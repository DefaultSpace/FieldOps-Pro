package com.fieldops.mini.phone;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import org.json.*;
import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;

/** Durable, local-only reminder schedule. PendingIntent identity never uses a hash code. */
public final class Reminders {
    private static final String CHANNEL="fieldops-visits";
    private static android.content.SharedPreferences prefs(Context c){return c.getSharedPreferences("visit-reminders",Context.MODE_PRIVATE);}
    private static JSONObject read(Context c)throws JSONException{return new JSONObject(prefs(c).getString("schedule","{}"));}
    private static void write(Context c,JSONObject data)throws IOException{if(!prefs(c).edit().putString("schedule",data.toString()).commit())throw new IOException("Reminder storage failed");}
    private static AlarmManager alarms(Context c){return c.getSystemService(AlarmManager.class);}
    public static boolean exact(Context c){return Build.VERSION.SDK_INT<31||alarms(c).canScheduleExactAlarms();}
    private static NotificationManager notifications(Context c){return c.getSystemService(NotificationManager.class);}
    private static void channel(Context c){notifications(c).createNotificationChannel(new NotificationChannel(CHANNEL,"Ziyaret hatırlatıcıları",NotificationManager.IMPORTANCE_HIGH));}
    public static JSONObject status(Context c)throws JSONException{
        channel(c);
        boolean enabled=notifications(c).areNotificationsEnabled() && notifications(c).getNotificationChannel(CHANNEL).getImportance()!=NotificationManager.IMPORTANCE_NONE;
        return new JSONObject().put("type","reminderStatus").put("exact",exact(c)).put("notifications",enabled);
    }
    private static PendingIntent alarmIntent(Context c,String id,long at){
        Intent intent=new Intent(c,ReminderReceiver.class).setAction("com.fieldops.mini.REMIND")
            .setData(new Uri.Builder().scheme("fieldops").authority("reminder").appendPath(id).appendPath(Long.toString(at)).build());
        return PendingIntent.getBroadcast(c,0,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private static void cancel(Context c,String id,JSONObject row){alarms(c).cancel(alarmIntent(c,id,row.optLong("at")));notifications(c).cancel(id,1);}
    private static void schedule(Context c,String id,JSONObject row)throws JSONException{
        if(row.optBoolean("delivered"))return;
        long at=Math.max(System.currentTimeMillis()+500,row.getLong("at"));
        PendingIntent intent=alarmIntent(c,id,row.getLong("at"));
        try {if(exact(c)){alarms(c).setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,intent);return;}}
        catch(SecurityException revoked){ /* Permission changed between check and scheduling. */ }
        alarms(c).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,intent);
    }
    public static synchronized void replace(Context c,JSONArray list)throws Exception{
        if(list.length()>1000)throw new IOException("Too many reminders");
        JSONObject old=read(c),next=new JSONObject();
        for(int i=0;i<list.length();i++){
            JSONObject row=list.getJSONObject(i);String id=row.getString("id");
            if(id.isEmpty()||id.length()>200||next.has(id)||row.getLong("at")<=0)throw new IOException("Invalid reminder");
            for(String key:new String[]{"name","address","mahalle"})if(!(row.opt(key) instanceof String)||row.getString(key).length()>4000)throw new IOException("Invalid reminder text");
            JSONObject previous=old.optJSONObject(id);
            row.put("delivered",previous!=null&&previous.optLong("at")==row.getLong("at")&&previous.optBoolean("delivered"));
            next.put(id,row);
        }
        // Persist desired state first: stale in-flight receivers recheck it before notifying.
        write(c,next);
        for(java.util.Iterator<String> it=old.keys();it.hasNext();){String id=it.next();JSONObject before=old.getJSONObject(id),after=next.optJSONObject(id);if(after==null||before.optLong("at")!=after.optLong("at"))cancel(c,id,before);}
        for(java.util.Iterator<String> it=next.keys();it.hasNext();){String id=it.next();JSONObject after=next.getJSONObject(id),before=old.optJSONObject(id);if(before==null||!before.toString().equals(after.toString()))schedule(c,id,after);}
    }
    public static synchronized void restore(Context c)throws Exception{
        JSONObject data=read(c);for(java.util.Iterator<String> it=data.keys();it.hasNext();){String id=it.next();schedule(c,id,data.getJSONObject(id));}
    }
    public static synchronized void deliver(Context c,String id,long at)throws Exception{
        JSONObject data=read(c),row=data.optJSONObject(id);
        if(row==null||row.optLong("at")!=at||row.optBoolean("delivered"))return;
        if(at>System.currentTimeMillis()){schedule(c,id,row);return;}
        channel(c);
        if(!notifications(c).areNotificationsEnabled() || (Build.VERSION.SDK_INT>=33&&c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED))return;
        if(notifications(c).getNotificationChannel(CHANNEL).getImportance()==NotificationManager.IMPORTANCE_NONE)return;
        Intent open=new Intent(c,MainActivity.class).setData(new Uri.Builder().scheme("fieldops").authority("visit").appendPath(id).build()).putExtra("visitId",id).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent content=PendingIntent.getActivity(c,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        String time=Instant.ofEpochMilli(at).atZone(ZoneId.of("Europe/Istanbul")).format(DateTimeFormatter.ofPattern("dd.MM HH:mm"));
        String body=row.getString("name")+" · "+row.getString("mahalle")+"\n"+row.getString("address")+"\nZiyaret: "+time;
        Notification notification=new Notification.Builder(c,CHANNEL).setSmallIcon(com.fieldops.mini.shared.R.drawable.fieldops_icon)
            .setContentTitle("FieldOps · Ziyaret zamanı").setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body))
            .setContentIntent(content).setAutoCancel(true).setCategory(Notification.CATEGORY_REMINDER)
            .setVisibility(Notification.VISIBILITY_PRIVATE).setLocalOnly(false).build();
        notifications(c).notify(id,1,notification);
        row.put("delivered",true);write(c,data);
    }
}
