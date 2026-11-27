package com.fieldops.mini.phone;

import android.content.*;
import android.net.Uri;
public final class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        // Short, serialized local disk/alarm work; no server and no running WebView required.
        try {
            if("com.fieldops.mini.REMIND".equals(intent.getAction())){
                Uri uri=intent.getData();if(uri!=null&&uri.getPathSegments().size()==2)Reminders.deliver(context,uri.getPathSegments().get(0),Long.parseLong(uri.getPathSegments().get(1)));
            } else Reminders.restore(context);
        }catch(Exception error){android.util.Log.e("FieldOpsReminders","Reminder operation failed",error);}
    }
}
