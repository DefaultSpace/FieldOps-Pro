package com.fieldops.mini.shared;
import org.json.*;
import org.junit.Test;
import static org.junit.Assert.*;
public class ProtocolTest {
    private JSONObject op()throws Exception{return new JSONObject().put("v",1).put("opId","aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa").put("epoch","bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb").put("id","receipt-1").put("base","a".repeat(64)).put("status","done").put("reason","");}
    @Test public void operationAllowsOnlySupportedStatuses()throws Exception{assertTrue(Protocol.operation(op()));assertFalse(Protocol.operation(op().put("status","cancelled")));assertFalse(Protocol.operation(op().put("status","postponed")));assertTrue(Protocol.operation(op().put("status","postponed").put("reason","Müşteri talebi")));}
    @Test public void malformedOperationRejected()throws Exception{assertFalse(Protocol.operation(op().put("opId","../../x")));assertFalse(Protocol.operation(op().put("base","bad")));assertFalse(Protocol.operation(op().put("reason","a".repeat(201))));assertFalse(Protocol.operation(op().put("v",2)));}
    @Test public void ackMustMatchOperationAndEpoch()throws Exception{JSONObject o=op(),a=new JSONObject().put("v",1).put("opId",o.getString("opId")).put("epoch",o.getString("epoch")).put("result","applied");assertTrue(Protocol.ack(a,o));assertFalse(Protocol.ack(a.put("epoch","other"),o));assertFalse(Protocol.ack(a,null));}
    @Test public void unknownAckResultCannotClearOutbox()throws Exception{JSONObject o=op(),a=new JSONObject().put("v",1).put("opId",o.getString("opId")).put("epoch",o.getString("epoch")).put("result","received");assertFalse(Protocol.ack(a,o));}
    @Test public void snapshotRequiresVersionAndUniqueIds()throws Exception{JSONObject row=new JSONObject().put("id","one").put("revision","b".repeat(64)).put("name","Test").put("address","Adres").put("receiptNo","123").put("timeSlot","10/12").put("status","pending");JSONObject s=new JSONObject().put("v",1).put("epoch",op().getString("epoch")).put("generatedAt",1000).put("day","2026-11-12").put("records",new JSONArray().put(row));assertTrue(Protocol.snapshot(s));assertFalse(Protocol.snapshot(s.put("records",new JSONArray().put(row).put(row))));}
}
