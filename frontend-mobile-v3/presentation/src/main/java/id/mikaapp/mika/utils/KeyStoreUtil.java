package id.mikaapp.mika.utils;

import android.os.Build;
import android.security.keystore.KeyProperties;
import android.security.keystore.KeyProtection;
import androidx.annotation.RequiresApi;
import android.util.Base64;
import android.util.Log;

import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyStoreException;

/**
 * Created by grahamdesmon on 29/01/19.
 */

public class KeyStoreUtil {
    private final String alias;
    private static final String TAG = KeyStoreUtil.class.getName();

    public KeyStoreUtil(String alias) {
        this.alias = alias;
    }

    private KeyStore obtainKeyStore() throws GeneralSecurityException {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        try {
            keyStore.load(null);
        } catch (IOException e) {
            throw new KeyStoreException("Key store error", e);
        }
        return keyStore;
    }

        @RequiresApi(api = Build.VERSION_CODES.M)
        public void importKey(String key) throws GeneralSecurityException {
        Log.i(TAG, "importKeytoKeyStore");

        SecretKeySpec secretKeySpec = new SecretKeySpec(Base64.decode(key, Base64.DEFAULT), "HmacSHA256");

        KeyStore keyStore = obtainKeyStore();
        keyStore.setEntry(
                alias,
                new KeyStore.SecretKeyEntry(secretKeySpec),
                new KeyProtection.Builder(KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT | KeyProperties.PURPOSE_SIGN).build());
    }

    public Key obtainKey() throws GeneralSecurityException {
        KeyStore keyStore = obtainKeyStore();

        return keyStore.getKey(alias, null);
    }
}
