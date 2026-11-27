package com.fieldops.mini.wear;

import android.app.*;
import android.graphics.Color;
import android.os.*;
import android.view.*;
import android.widget.*;
import com.fieldops.mini.shared.*;
import org.json.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

public final class MainActivity extends Activity {
    private final Handler timer=new Handler(Looper.getMainLooper());
    private String selected="",rendered="";
    private LinearLayout column;
    private ScrollView scroll;
    private JSONObject state=new JSONObject();
    private final Runnable refresh=new Runnable(){public void run(){reload();timer.postDelayed(this,2000);}};
    @Override public void onCreate(Bundle saved){
        super.onCreate(saved);getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        if(saved!=null)selected=saved.getString("selected","");Sync.schedule(this);
    }
    @Override protected void onResume(){super.onResume();Sync.schedule(this);timer.post(refresh);}
    @Override protected void onPause(){timer.removeCallbacks(refresh);super.onPause();}
    @Override protected void onSaveInstanceState(Bundle out){out.putString("selected",selected);super.onSaveInstanceState(out);}
    private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
    private void reload(){
        try{JSONObject next=new Vault(this).get();String fingerprint=next.toString()+selected+today();if(!fingerprint.equals(rendered)){state=next;rendered=fingerprint;draw();}}
        catch(Exception e){new AlertDialog.Builder(this).setMessage("Yerel kayıt okunamadı. Veri silinmedi. Uygulamayı yeniden açmayı dene.").setPositiveButton("Kapat",(d,w)->finish()).show();timer.removeCallbacks(refresh);}
    }
    private String today(){return LocalDate.now(ZoneId.of("Europe/Istanbul")).toString();}
    private TextView text(String value,int size,int color){TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);t.setGravity(Gravity.CENTER);t.setPadding(0,dp(5),0,dp(5));column.addView(t);return t;}
    private void button(String label,Runnable action,boolean enabled){Button b=new Button(this);b.setText(label);b.setTextSize(14);b.setAllCaps(false);b.setMinHeight(dp(48));b.setEnabled(enabled);column.addView(b,new LinearLayout.LayoutParams(-1,-2));b.setOnClickListener(v->action.run());}
    private String label(String status){return switch(status){case "done"->"Tamamlandı";case "postponed"->"Ertelendi";case "cancelled"->"İptal edildi";default->"Bekliyor";};}
    private JSONObject pending(String id)throws JSONException{JSONObject out=Protocol.object(state,"outbox");for(Iterator<String> it=out.keys();it.hasNext();){JSONObject op=out.getJSONObject(it.next());if(id.equals(op.optString("id")))return op;}return null;}
    private JSONObject notice(String id)throws JSONException{JSONObject all=Protocol.object(state,"notices"),latest=null;for(Iterator<String> it=all.keys();it.hasNext();){JSONObject n=all.getJSONObject(it.next());if(id.equals(n.optString("id"))&&(latest==null||n.optLong("at")>latest.optLong("at")))latest=n;}return latest;}
    private void draw(){
        int y=scroll==null?0:scroll.getScrollY();
        scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.setBackgroundColor(Color.BLACK);
        column=new LinearLayout(this);column.setOrientation(LinearLayout.VERTICAL);column.setPadding(dp(26),dp(30),dp(26),dp(34));scroll.addView(column);setContentView(scroll);
        try{
            text("FIELDOPS MINI",16,Color.rgb(80,220,190));
            JSONObject snapshot=state.optJSONObject("snapshot");
            if(snapshot==null){text("Telefonda FieldOps Pro’yu aç",18,Color.WHITE);text("İlk listeni eşitlemek için telefon ve saatin eşleşmiş olması gerekir.",13,Color.LTGRAY);button("Yeniden dene",()->Sync.schedule(this),true);return;}
            boolean fresh=today().equals(snapshot.optString("day"));
            text(snapshot.optString("day"),12,Color.LTGRAY);
            if(!fresh)text("Önceki günün listesi. Güncel liste için telefonu aç.",14,Color.YELLOW);
            int waiting=Protocol.object(state,"outbox").length();
            if(waiting>0)text(waiting+" işlem telefona kaydedilmeyi bekliyor. Telefon uygulamasını aç.",13,Color.YELLOW);
            long received=state.optLong("receivedAt");if(received>0)text("Son alınan liste: "+Instant.ofEpochMilli(received).atZone(ZoneId.of("Europe/Istanbul")).format(DateTimeFormatter.ofPattern("dd.MM HH:mm")),11,Color.LTGRAY);
            JSONArray records=snapshot.getJSONArray("records");
            if(!selected.isEmpty()){
                JSONObject row=null;for(int i=0;i<records.length();i++)if(records.getJSONObject(i).optString("id").equals(selected))row=records.getJSONObject(i);
                if(row==null){text("Fiş günlük listede yok. Telefonda kontrol et.",16,Color.WHITE);}
                else detail(row,fresh);
                button("Günlük liste",()->{selected="";rendered="";scroll=null;reload();},true);
            } else {
                if(records.length()==0)text("Günlük listede fiş yok",18,Color.WHITE);
                for(int i=0;i<records.length();i++){
                    JSONObject row=records.getJSONObject(i);String id=row.getString("id");
                    button(row.optString("timeSlot","Saat yok")+"\n"+row.getString("name")+"\nFiş "+row.getString("receiptNo")+"\n"+ShortAddress.format(row.optString("address")),()->{selected=id;rendered="";scroll=null;reload();},true);
                }
                JSONObject notes=Protocol.object(state,"notices");int rejected=0;for(Iterator<String> it=notes.keys();it.hasNext();)if(!notes.getJSONObject(it.next()).optString("result").equals("applied"))rejected++;
                if(rejected>0){text(rejected+" işlem uygulanmadı. Güncel telefon kaydı korundu; silinen/arşivlenen fişleri telefonda kontrol et.",13,Color.YELLOW);button("Bildirimi okudum",()->{try{new Vault(this).change(s->s.put("notices",new JSONObject()));rendered="";reload();}catch(Exception e){error();}},true);}
                button("Eşitlemeyi dene",()->Sync.schedule(this),true);
                text("Kayıtlar telefonda oluşturulur. Saat yalnızca fiş durumunu değiştirir.",12,Color.LTGRAY);
            }
        }catch(Exception e){text("Liste gösterilemedi. Telefonu açıp yeniden eşitle.",14,Color.YELLOW);}
        scroll.post(()->scroll.scrollTo(0,y));
    }
    private void detail(JSONObject row,boolean fresh)throws Exception{
        text(row.getString("name"),20,Color.WHITE);text(row.getString("timeSlot"),17,Color.rgb(80,220,190));
        text(row.getString("address"),15,Color.WHITE);text("Fiş: "+row.getString("receiptNo"),14,Color.LTGRAY);
        JSONObject p=pending(selected),n=notice(selected);
        text(label(row.optString("status")),15,Color.WHITE);
        if(p!=null)text(label(p.optString("status"))+" isteği bekliyor; henüz telefona kaydedilmedi.",14,Color.YELLOW);
        if(n!=null)text(switch(n.optString("result")){case "applied"->"İşlem telefona kaydedildi.";case "conflict"->"Telefonda bu fiş değişti. İşlemin uygulanmadı; güncel kaydı kontrol et.";case "missing"->"Fiş silinmiş veya arşivlenmiş. İşlemin uygulanmadı.";default->"Telefon veri kümesi değişti. İşlemin uygulanmadı.";},13,Color.YELLOW);
        boolean awaitingSnapshot=n!=null&&n.optString("result").equals("applied")&&n.optString("base").equals(row.optString("revision"));
        boolean enabled=fresh&&p==null&&!awaitingSnapshot&&row.optBoolean("actionable");
        button("Tamamlandı",()->new AlertDialog.Builder(this).setMessage("Fiş "+row.optString("receiptNo")+" tamamlandı olarak işaretlensin mi?").setPositiveButton("Tamamla",(d,w)->queue(row,"done","")).setNegativeButton("Vazgeç",null).show(),enabled);
        JSONArray configured=state.getJSONObject("snapshot").optJSONArray("postponeReasons");
        java.util.ArrayList<String> reasons=new java.util.ArrayList<>();
        if(configured==null){reasons.add("Müşteri evde yok");reasons.add("Telefona cevap vermiyor");}
        else for(int i=0;i<configured.length();i++)reasons.add(configured.getString(i));
        String[] choices=reasons.toArray(new String[0]);
        button("Ertele",()->new AlertDialog.Builder(this).setTitle("Erteleme sebebi").setItems(choices,(d,w)->queue(row,"postponed",choices[w])).setNeutralButton("Özel sebep",(d,w)->{
            EditText input=new EditText(this);input.setSingleLine(false);input.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(200)});
            AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Erteleme sebebi").setView(input).setPositiveButton("Ertele",null).setNegativeButton("Vazgeç",null).create();
            dialog.setOnShowListener(v->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(b->{String reason=input.getText().toString().trim();if(reason.isEmpty()){input.setError("Sebep yaz");return;}queue(row,"postponed",reason);dialog.dismiss();}));dialog.show();
        }).setNegativeButton("Vazgeç",null).show(),enabled);
    }
    private void queue(JSONObject row,String status,String reason){
        try{
            new Vault(this).change(s->{
                JSONObject snapshot=s.getJSONObject("snapshot");if(!today().equals(snapshot.getString("day")))throw new IllegalStateException();
                JSONObject current=null;JSONArray rows=snapshot.getJSONArray("records");for(int i=0;i<rows.length();i++)if(rows.getJSONObject(i).getString("id").equals(row.getString("id")))current=rows.getJSONObject(i);
                if(current==null||!current.optBoolean("actionable")||!current.getString("revision").equals(row.getString("revision")))throw new IllegalStateException();
                JSONObject out=Protocol.object(s,"outbox");if(out.length()>=200)throw new IllegalStateException();
                for(Iterator<String> it=out.keys();it.hasNext();)if(out.getJSONObject(it.next()).getString("id").equals(row.getString("id")))throw new IllegalStateException();
                String id=UUID.randomUUID().toString();JSONObject op=new JSONObject().put("v",1).put("opId",id).put("epoch",snapshot.getString("epoch")).put("id",row.getString("id")).put("base",row.getString("revision")).put("status",status).put("reason",reason);
                out.put(id,op);
            });
            Sync.schedule(this);rendered="";reload();
        }catch(Exception e){error();}
    }
    private void error(){new AlertDialog.Builder(this).setMessage("İşlem kaydedilemedi veya liste değişti. Güncel listeyi kontrol edip yeniden dene.").setPositiveButton("Tamam",null).show();}
    @Override public void onBackPressed(){if(!selected.isEmpty()){selected="";rendered="";scroll=null;reload();}else super.onBackPressed();}
}
