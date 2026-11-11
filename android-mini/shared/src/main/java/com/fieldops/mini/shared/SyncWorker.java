package com.fieldops.mini.shared;
import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.*;
public final class SyncWorker extends Worker {
    public SyncWorker(@NonNull Context c,@NonNull WorkerParameters p){super(c,p);}
    @NonNull @Override public Result doWork(){
        try{
            Sync.recover(getApplicationContext());Sync.publish(getApplicationContext());
            // Data Layer now owns a durable copy. Keep our outbox until ACK;
            // lack of a remote ACK is not a reason to repeatedly wake the radio.
            return Result.success();
        }catch(Exception e){return Result.retry();}
    }
}
