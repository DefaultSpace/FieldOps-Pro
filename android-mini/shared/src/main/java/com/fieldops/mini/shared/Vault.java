package com.fieldops.mini.shared;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

/** One atomic encrypted document. A corrupt/unreadable vault is never reset silently. */
public final class Vault {
    private static final Object LOCK=new Object();
    private final AtomicFile file;
    public interface Change { void apply(JSONObject state) throws Exception; }
    public Vault(Context c) { file=new AtomicFile(new File(c.getNoBackupFilesDir(),"mini-v1.enc")); }
    private SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if(!ks.containsAlias("fieldops-mini-v1")) {
            if(file.getBaseFile().exists()) throw new IOException("Yerel anahtar bulunamadı. Veriler korunuyor.");
            KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            gen.init(new KeyGenParameterSpec.Builder("fieldops-mini-v1",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
            gen.generateKey();
        }
        return (SecretKey)ks.getKey("fieldops-mini-v1",null);
    }
    private JSONObject read() throws Exception {
        if(!file.getBaseFile().exists()) return new JSONObject();
        byte[] data=file.readFully(); if(data.length<29 || data.length>8_000_000) throw new IOException("Yerel kayıt okunamadı.");
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,data,0,12));
        return new JSONObject(new String(cipher.doFinal(data,12,data.length-12),StandardCharsets.UTF_8));
    }
    public JSONObject get() throws Exception { synchronized(LOCK){return read();} }
    public void change(Change edit) throws Exception {
        synchronized(LOCK) {
            JSONObject state=read();String previous=state.toString();edit.apply(state);
            if(previous.equals(state.toString()))return;
            byte[] plain=state.toString().getBytes(StandardCharsets.UTF_8);
            if(plain.length>7_000_000) throw new IOException("Yerel eşitleme alanı dolu.");
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key());
            byte[] encrypted=cipher.doFinal(plain); FileOutputStream stream=null;
            try {stream=file.startWrite();stream.write(cipher.getIV());stream.write(encrypted);file.finishWrite(stream);}
            catch(Exception e){if(stream!=null)file.failWrite(stream);throw e;}
        }
    }
}
