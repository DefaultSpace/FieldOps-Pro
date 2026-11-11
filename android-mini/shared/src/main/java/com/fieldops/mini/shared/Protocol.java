package com.fieldops.mini.shared;

import org.json.*;
import java.util.regex.Pattern;

public final class Protocol {
    public static final String ROOT="/fieldops/v1/", SNAPSHOT=ROOT+"snapshot", OP=ROOT+"op/", ACK=ROOT+"ack/";
    public static final int MAX_SNAPSHOT=1_000_000;
    private static final Pattern UUID=Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}");
    public static boolean uuid(String s) { return UUID.matcher(s).matches(); }
    public static boolean operation(JSONObject o) {
        return o.optInt("v")==1 && uuid(o.optString("opId")) && uuid(o.optString("epoch")) &&
            o.opt("id") instanceof String && !o.optString("id").isEmpty() && o.optString("id").length()<=200 &&
            o.optString("base").matches("[a-f0-9]{64}") &&
            (o.optString("status").equals("done") || o.optString("status").equals("postponed")) &&
            o.opt("reason") instanceof String && o.optString("reason").length()<=200 &&
            (!o.optString("status").equals("postponed") || !o.optString("reason").trim().isEmpty());
    }
    public static boolean snapshot(JSONObject s) {
        if(s.optInt("v")!=1 || !uuid(s.optString("epoch")) || s.optLong("generatedAt")<=0 || !s.optString("day").matches("\\d{4}-\\d{2}-\\d{2}")) return false;
        JSONArray rows=s.optJSONArray("records"); if(rows==null || rows.length()>1000) return false;
        java.util.HashSet<String> ids=new java.util.HashSet<>();
        for(int i=0;i<rows.length();i++) {
            JSONObject r=rows.optJSONObject(i);
            if(r==null || r.optString("id").isEmpty() || r.optString("id").length()>200 || !ids.add(r.optString("id")) || !r.optString("revision").matches("[a-f0-9]{64}")) return false;
            for(String key:new String[]{"name","address","timeSlot","receiptNo","status"}) if(!(r.opt(key) instanceof String) || r.optString(key).length()>2500) return false;
        }
        return true;
    }
    public static boolean ack(JSONObject a, JSONObject op) {
        return op!=null && a.optInt("v")==1 && a.optString("opId").equals(op.optString("opId")) && a.optString("epoch").equals(op.optString("epoch")) &&
            java.util.Set.of("applied","conflict","missing","reset").contains(a.optString("result"));
    }
    public static JSONObject object(JSONObject o,String key) throws JSONException {
        JSONObject v=o.optJSONObject(key); if(v==null){v=new JSONObject();o.put(key,v);} return v;
    }
}
