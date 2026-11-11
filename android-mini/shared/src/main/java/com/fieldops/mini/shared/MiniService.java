package com.fieldops.mini.shared;
import com.google.android.gms.wearable.*;
public final class MiniService extends WearableListenerService {
    @Override public void onDataChanged(DataEventBuffer events){
        for(DataEvent event:events)try{
            if(event.getType()==DataEvent.TYPE_CHANGED)Sync.receive(this,event.getDataItem());
            else if(event.getType()==DataEvent.TYPE_DELETED)Sync.deleted(this,event.getDataItem().getUri());
        }catch(Exception ignored){ /* Data Layer keeps the item; next recovery retries. No customer data in logs. */ }
        Sync.schedule(this);
    }
}
