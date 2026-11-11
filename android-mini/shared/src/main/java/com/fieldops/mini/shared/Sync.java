package com.fieldops.mini.shared;

import android.content.Context;
import android.net.Uri;
import androidx.work.*;
import com.google.android.gms.tasks.Tasks;
import com.google.android.gms.wearable.*;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

public final class Sync {
    public static boolean watch(Context c){return c.getResources().getBoolean(R.bool.is_watch);}
    public static void schedule(Context c) {
        WorkManager.getInstance(c).enqueueUniquePeriodicWork("mini-recovery",ExistingPeriodicWorkPolicy.KEEP,
            new PeriodicWorkRequest.Builder(SyncWorker.class,15,TimeUnit.MINUTES).build());
        // Append prevents a write arriving during a running worker from losing
        // its wakeup. Successfully stored DataItems themselves survive offline.
        WorkManager.getInstance(c).enqueueUniqueWork("mini-sync",ExistingWorkPolicy.APPEND_OR_REPLACE,
            new OneTimeWorkRequest.Builder(SyncWorker.class).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,10,TimeUnit.SECONDS).build());
    }
    private static <T>T await(com.google.android.gms.tasks.Task<T> t)throws Exception{return Tasks.await(t,30,TimeUnit.SECONDS);}
    private static void put(Context c,String path,JSONObject value,boolean asset)throws Exception{
        PutDataMapRequest req=PutDataMapRequest.create(path);
        byte[] bytes=value.toString().getBytes(StandardCharsets.UTF_8);
        if(asset)req.getDataMap().putAsset("payload",Asset.createFromBytes(bytes));
        else req.getDataMap().putString("json",value.toString());
        await(Wearable.getDataClient(c).putDataItem(req.asPutDataRequest().setUrgent()));
    }
    public static void publish(Context c)throws Exception{
        JSONObject state=new Vault(c).get();
        if(watch(c)) {
            JSONObject out=Protocol.object(state,"outbox");
            for(Iterator<String> it=out.keys();it.hasNext();) {String id=it.next();put(c,Protocol.OP+id,out.getJSONObject(id),false);}
        } else {
            JSONObject snapshot=state.optJSONObject("snapshot");if(snapshot!=null)put(c,Protocol.SNAPSHOT,snapshot,true);
            JSONObject acks=Protocol.object(state,"acks");
            for(Iterator<String> it=acks.keys();it.hasNext();) {String id=it.next();put(c,Protocol.ACK+id,acks.getJSONObject(id),false);}
        }
        JSONObject cleanup=Protocol.object(state,"cleanup");
        for(Iterator<String> it=cleanup.keys();it.hasNext();) {
            String uri=it.next();await(Wearable.getDataClient(c).deleteDataItems(Uri.parse(uri)));
            new Vault(c).change(s->Protocol.object(s,"cleanup").remove(uri));
        }
    }
    public static void recover(Context c)throws Exception{
        DataItemBuffer items=await(Wearable.getDataClient(c).getDataItems());
        Set<String> present=new HashSet<>();
        try{for(DataItem item:items){present.add(item.getUri().toString());receive(c,item);}}finally{items.release();}
        // Reconcile missed deletion events after process death. Unacknowledged
        // operations are never discarded by this cleanup.
        if(!watch(c)){
            String local=await(Wearable.getNodeClient(c).getLocalNode()).getId();
            new Vault(c).change(s->{
                JSONObject acks=Protocol.object(s,"acks"),sources=Protocol.object(s,"sources");
                List<String> completed=new ArrayList<>();
                for(Iterator<String> it=acks.keys();it.hasNext();){String id=it.next();if(sources.has(id)&&!present.contains(sources.getString(id)))completed.add(id);}
                for(String id:completed){acks.remove(id);sources.remove(id);Protocol.object(s,"inbox").remove(id);Protocol.object(s,"cleanup").put("wear://"+local+Protocol.ACK+id,true);}
            });
        }
    }
    public static void receive(Context c,DataItem item)throws Exception{
        String path=item.getUri().getPath(),node=item.getUri().getHost();
        if(path==null || node==null || !path.startsWith(Protocol.ROOT))return;
        String local=await(Wearable.getNodeClient(c).getLocalNode()).getId(); if(local.equals(node))return;
        boolean watch=watch(c); Vault vault=new Vault(c);
        DataMap map=DataMapItem.fromDataItem(item).getDataMap();
        if(watch && path.equals(Protocol.SNAPSHOT)) {
            Asset asset=map.getAsset("payload");if(asset==null)return;
            DataClient.GetFdForAssetResponse response=await(Wearable.getDataClient(c).getFdForAsset(asset));
            byte[] bytes;
            try(InputStream stream=response.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()) {
                if(stream==null)return;byte[] buffer=new byte[8192];int n;
                while((n=stream.read(buffer))!=-1){out.write(buffer,0,n);if(out.size()>Protocol.MAX_SNAPSHOT)throw new IOException("Saat listesi çok büyük.");}bytes=out.toByteArray();
            } finally{response.release();}
            JSONObject snap=new JSONObject(new String(bytes,StandardCharsets.UTF_8));if(!Protocol.snapshot(snap)||snap.optLong("sequence")<=0)return;
            vault.change(s->{
                String peer=s.optString("peer");if(!peer.isEmpty()&&!peer.equals(node))return;
                JSONObject previous=s.optJSONObject("snapshot");
                JSONObject retired=Protocol.object(s,"retiredEpochs");if(retired.has(snap.getString("epoch")))return;
                if(previous!=null&&!previous.optString("epoch").equals(snap.optString("epoch")))retired.put(previous.getString("epoch"),true);
                if(previous!=null&&previous.optString("epoch").equals(snap.optString("epoch"))&&previous.optLong("sequence")>=snap.optLong("sequence"))return;
                s.put("peer",node);s.put("snapshot",snap);s.put("receivedAt",System.currentTimeMillis());
            });
        } else if(!watch&&path.startsWith(Protocol.OP)) {
            String raw=map.getString("json","");if(raw.length()>8192)return;
            JSONObject op=new JSONObject(raw);if(!Protocol.operation(op)||!path.equals(Protocol.OP+op.optString("opId")))return;
            vault.change(s->{
                String peer=s.optString("peer");if(!peer.isEmpty()&&!peer.equals(node))return;
                s.put("peer",node);
                JSONObject inbox=Protocol.object(s,"inbox");String id=op.getString("opId");
                if(inbox.length()>=1000&&!inbox.has(id))throw new IOException("Telefon işlem kuyruğu dolu.");
                if(!inbox.has(id)){inbox.put(id,op);Protocol.object(s,"sources").put(id,item.getUri().toString());}
            });
        } else if(watch&&path.startsWith(Protocol.ACK)) {
            String raw=map.getString("json","");if(raw.length()>4096)return;
            JSONObject ack=new JSONObject(raw);String id=ack.optString("opId");if(!path.equals(Protocol.ACK+id))return;
            vault.change(s->{
                if(!s.optString("peer").equals(node))return;
                JSONObject out=Protocol.object(s,"outbox");JSONObject op=out.optJSONObject(id);
                if(!Protocol.ack(ack,op))return;
                JSONObject notices=Protocol.object(s,"notices");
                notices.put(id,new JSONObject().put("id",op.getString("id")).put("base",op.getString("base")).put("status",op.getString("status")).put("result",ack.getString("result")).put("at",System.currentTimeMillis()));
                while(notices.length()>40)notices.remove(notices.keys().next());
                out.remove(id);
                Protocol.object(s,"cleanup").put("wear://"+local+Protocol.OP+id,true);
            });
        }
    }
    public static void deleted(Context c,Uri uri)throws Exception{
        if(watch(c)||uri.getPath()==null||!uri.getPath().startsWith(Protocol.OP))return;
        String id=uri.getLastPathSegment();Vault vault=new Vault(c);
        String local=await(Wearable.getNodeClient(c).getLocalNode()).getId();
        vault.change(s->{
            if(!uri.getHost().equals(s.optString("peer")))return;
            Protocol.object(s,"inbox").remove(id);Protocol.object(s,"sources").remove(id);Protocol.object(s,"acks").remove(id);
            Protocol.object(s,"cleanup").put("wear://"+local+Protocol.ACK+id,true);
        });
    }
}
