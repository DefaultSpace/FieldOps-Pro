package com.fieldops.mini.phone;

import android.app.*;
import android.content.*;
import android.net.Uri;
import android.os.*;
import android.view.WindowManager;
import android.webkit.*;
import android.widget.Toast;
import androidx.webkit.*;
import com.fieldops.mini.shared.*;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

public final class MainActivity extends Activity {
    private static final String ORIGIN="https://appassets.androidplatform.net";
    private final ExecutorService io=Executors.newSingleThreadExecutor();
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private boolean exporting;
    // React needs JS; only packaged assets are served, with an origin-scoped
    // bridge, CSP and all remote subresource requests denied.
    @android.annotation.SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state){
        super.onCreate(state); getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        web=new WebView(this);setContentView(web);
        web.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(false);
        WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){
                WebResourceResponse local=loader.shouldInterceptRequest(req.getUrl());
                return local!=null?local:new WebResourceResponse("text/plain","UTF-8",403,"Blocked",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){
                Uri uri=req.getUrl();if(ORIGIN.equals(uri.getScheme()+"://"+uri.getAuthority())&&uri.getPath()!=null&&uri.getPath().startsWith("/assets/web/"))return false;
                if(req.isForMainFrame()&&req.hasGesture()&&Set.of("https","tel","sms","geo").contains(uri.getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(ActivityNotFoundException ignored){toast("Bağlantıyı açacak uygulama bulunamadı.");}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");
                try{startActivityForResult(intent,10);}catch(ActivityNotFoundException e){fileCallback.onReceiveValue(null);fileCallback=null;}
                return true;
            }
        });
        if(!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){
            new AlertDialog.Builder(this).setMessage("Android System WebView uygulamasını güncelle; saat bağlantısı güvenli köprü desteği gerektiriyor.").setPositiveButton("Kapat",(d,w)->finish()).show();return;
        }
        if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER))WebViewCompat.addWebMessageListener(web,"FieldOpsMini",Set.of(ORIGIN),(view,message,origin,mainFrame,reply)->{
            if(!mainFrame||!ORIGIN.equals(origin.toString()))return;
            String raw=message.getData();if(raw==null)return;
            if(raw.length()>10_100_000){respond(reply,jsonError("Veri boyutu sınırı aşıldı. İşlem uygulanmadı."));return;}
            io.execute(()->{
                try{handle(new JSONObject(raw),reply);}catch(Exception e){respond(reply,jsonError("Eşitleme kaydedilemedi. Kayıtlar korunuyor; bağlantıyı ve boş alanı kontrol et."));}
            });
        });
        web.loadUrl(ORIGIN+"/assets/web/index.html");
        Sync.schedule(this);
    }
    private void handle(JSONObject message,JavaScriptReplyProxy reply)throws Exception{
        Vault vault=new Vault(this);
        switch(message.optString("type")){
            case "snapshot":{
                if(message.toString().getBytes(StandardCharsets.UTF_8).length>Protocol.MAX_SNAPSHOT)throw new IOException();
                JSONObject incoming=message.getJSONObject("value");if(!Protocol.snapshot(incoming))throw new IOException();
                AtomicBoolean changed=new AtomicBoolean(false);
                vault.change(s->{
                    JSONObject previous=s.optJSONObject("snapshot");
                    if(previous!=null&&previous.optString("epoch").equals(incoming.optString("epoch"))&&previous.getJSONArray("records").toString().equals(incoming.getJSONArray("records").toString())&&previous.optString("day").equals(incoming.optString("day"))&&incoming.getLong("generatedAt")-previous.optLong("generatedAt")<60_000)return;
                    incoming.put("sequence",s.optLong("sequence")+1);s.put("sequence",incoming.getLong("sequence"));s.put("snapshot",incoming);
                    changed.set(true);
                });
                if(changed.get())Sync.schedule(this);break;
            }
            case "poll":{
                JSONObject s=vault.get(),inbox=Protocol.object(s,"inbox"),acks=Protocol.object(s,"acks");JSONArray batch=new JSONArray();
                for(Iterator<String> it=inbox.keys();it.hasNext()&&batch.length()<20;){String id=it.next();if(!acks.has(id))batch.put(inbox.getJSONObject(id));}
                respond(reply,new JSONObject().put("type","operations").put("value",batch));break;
            }
            case "ack":{
                JSONObject ack=message.getJSONObject("value");
                vault.change(s->{JSONObject op=Protocol.object(s,"inbox").optJSONObject(ack.optString("opId"));if(!Protocol.ack(ack,op))throw new IOException();Protocol.object(s,"acks").put(ack.getString("opId"),ack);});
                Sync.schedule(this);break;
            }
            case "export":{
                String data=message.getString("data");if(data.length()>5_000_000)throw new IOException();
                new JSONObject(data);vault.change(s->s.put("exportDraft",data));
                runOnUiThread(()->{if(exporting)return;exporting=true;startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,"fieldops-backup.json"),11);});break;
            }
            default:throw new IOException();
        }
    }
    private JSONObject jsonError(String message){try{return new JSONObject().put("type","error").put("message",message);}catch(JSONException impossible){throw new IllegalStateException(impossible);}}
    private void respond(JavaScriptReplyProxy reply,JSONObject message){runOnUiThread(()->{if(!isDestroyed()&&WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER))reply.postMessage(message.toString());});}
    private void toast(String text){runOnUiThread(()->Toast.makeText(this,text,Toast.LENGTH_LONG).show());}
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==10&&fileCallback!=null){Uri uri=result==RESULT_OK&&data!=null?data.getData():null;fileCallback.onReceiveValue(uri!=null&&"content".equals(uri.getScheme())?new Uri[]{uri}:null);fileCallback=null;}
        if(request==11){exporting=false;io.execute(()->{
            try{
                Vault vault=new Vault(this);String draft=vault.get().optString("exportDraft");
                if(result==RESULT_OK&&data!=null&&data.getData()!=null){
                    try(OutputStream out=getContentResolver().openOutputStream(data.getData(),"wt")){if(out==null)throw new IOException();out.write(draft.getBytes(StandardCharsets.UTF_8));out.flush();}
                    toast("Yedek dosyası kaydedildi.");
                }
                vault.change(s->s.remove("exportDraft"));
            }catch(Exception e){toast("Yedek kaydedilemedi. Yeniden dene.");}
        });}
    }
    @Override protected void onResume(){super.onResume();Sync.schedule(this);if(web!=null)web.onResume();}
    @Override protected void onPause(){if(web!=null)web.onPause();super.onPause();}
    @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);web.destroy();io.shutdown();super.onDestroy();}
}
