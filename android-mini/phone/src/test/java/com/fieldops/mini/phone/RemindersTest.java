package com.fieldops.mini.phone;

import android.app.*;
import android.content.*;
import org.json.*;
import org.junit.*;
import org.junit.runner.RunWith;
import org.robolectric.*;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.*;
import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;

@RunWith(RobolectricTestRunner.class)
@Config(sdk=30)
public class RemindersTest {
    private Context context;
    private ShadowAlarmManager alarms;
    private ShadowNotificationManager notifications;
    private long at;
    @Before public void setup() {
        context=RuntimeEnvironment.getApplication();
        context.getSharedPreferences("visit-reminders",0).edit().clear().commit();
        alarms=shadowOf(context.getSystemService(AlarmManager.class));
        notifications=shadowOf(context.getSystemService(NotificationManager.class));
        at=System.currentTimeMillis()+60000;
    }
    private JSONObject row(String id,long time)throws Exception{return new JSONObject().put("id",id).put("at",time).put("name","Örnek Müşteri").put("mahalle","Gümüşpala").put("address","Örnek Sokak 1");}
    @Test public void persistsAndRestoresAfterBootWithoutActivity()throws Exception{
        Reminders.replace(context,new JSONArray().put(row("one",at)));
        assertEquals(1,alarms.getScheduledAlarms().size());
        AlarmManager manager=context.getSystemService(AlarmManager.class);
        manager.cancel(alarms.getScheduledAlarms().get(0).operation);
        assertEquals(0,alarms.getScheduledAlarms().size());
        new ReminderReceiver().onReceive(context,new Intent(Intent.ACTION_BOOT_COMPLETED));
        assertEquals(1,alarms.getScheduledAlarms().size());
        assertEquals(at,alarms.getScheduledAlarms().get(0).triggerAtTime);
    }
    @Test public void editsCancelOldAlarmAndRemovalCancelsNewAlarm()throws Exception{
        Reminders.replace(context,new JSONArray().put(row("one",at)));
        Reminders.replace(context,new JSONArray().put(row("one",at+120000)));
        assertEquals(1,alarms.getScheduledAlarms().size());assertEquals(at+120000,alarms.getScheduledAlarms().get(0).triggerAtTime);
        Reminders.replace(context,new JSONArray());assertEquals(0,alarms.getScheduledAlarms().size());
        Reminders.deliver(context,"one",at);assertEquals(0,notifications.size());
    }
    @Test public void staleDeliveryIsRejectedAndNotificationContainsDeepLink()throws Exception{
        long due=System.currentTimeMillis()-1000;
        Reminders.replace(context,new JSONArray().put(row("one",due)));
        Reminders.deliver(context,"one",due-1);assertEquals(0,notifications.size());
        Reminders.deliver(context,"one",due);assertEquals(1,notifications.size());
        Notification n=notifications.getNotification("one",1);
        assertTrue(n.extras.getCharSequence(Notification.EXTRA_TEXT).toString().contains("Gümüşpala"));
        assertTrue(n.extras.getCharSequence(Notification.EXTRA_TEXT).toString().contains("Örnek Sokak 1"));
        assertEquals("one",shadowOf(n.contentIntent).getSavedIntent().getStringExtra("visitId"));
        Reminders.replace(context,new JSONArray().put(row("one",due)));
        context.getSystemService(NotificationManager.class).cancelAll();Reminders.deliver(context,"one",due);assertEquals(0,notifications.size());
    }
    @Test public void stringHashCollisionsDoNotReplaceAnotherCustomersAlarm()throws Exception{
        assertEquals("Aa".hashCode(),"BB".hashCode());
        Reminders.replace(context,new JSONArray().put(row("Aa",at)).put(row("BB",at)));
        assertEquals(2,alarms.getScheduledAlarms().size());
    }
    @Test @Config(sdk=33) public void deniedExactAlarmPermissionUsesFallbackAndReportsStatus()throws Exception{
        alarms.setCanScheduleExactAlarms(false);
        Reminders.replace(context,new JSONArray().put(row("one",at)));
        assertFalse(Reminders.status(context).getBoolean("exact"));
        assertEquals(1,alarms.getScheduledAlarms().size());
        alarms.setCanScheduleExactAlarms(true);
        new ReminderReceiver().onReceive(context,new Intent(AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED));
        assertTrue(Reminders.status(context).getBoolean("exact"));
        assertEquals(1,alarms.getScheduledAlarms().size());
    }
    @Test @Config(sdk=33) public void deniedNotificationsRemainPendingUntilPermissionIsGranted()throws Exception{
        long due=System.currentTimeMillis()-1000;
        shadowOf((Application)context).denyPermissions(android.Manifest.permission.POST_NOTIFICATIONS);
        Reminders.replace(context,new JSONArray().put(row("one",due)));
        Reminders.deliver(context,"one",due);assertEquals(0,notifications.size());
        shadowOf((Application)context).grantPermissions(android.Manifest.permission.POST_NOTIFICATIONS);
        Reminders.deliver(context,"one",due);assertEquals(1,notifications.size());
    }
}
