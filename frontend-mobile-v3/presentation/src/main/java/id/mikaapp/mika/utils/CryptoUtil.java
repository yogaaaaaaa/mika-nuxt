package id.mikaapp.mika.utils;

import android.util.Base64;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;

/**
 * Created by grahamdesmon on 24/01/19.
 */

public class CryptoUtil {
    private final static String CRYPTO_METHOD = "RSA";

    public static HashMap<String, String> encryptcb1(String plain, String key, String keyType)
            throws NoSuchPaddingException,
            NoSuchAlgorithmException,
            BadPaddingException,
            IllegalBlockSizeException,
            InvalidKeySpecException,
            InvalidKeyException, InvalidAlgorithmParameterException {
        //encrypt session key
        Cipher cipher;
        byte[] encryptedSessionKey;
        SecureRandom random = new SecureRandom();
        random.nextBytes(new byte[32]);
        byte sessionKey[] = random.generateSeed(32);
        if (keyType.equals("private")) {
            cipher = Cipher.getInstance("RSA/NONE/PKCS1Padding");
            cipher.init(Cipher.ENCRYPT_MODE, stringToPrivateKey(key));
            encryptedSessionKey = cipher.doFinal(sessionKey);
        } else {
            cipher = Cipher.getInstance("RSA/NONE/OAEPPadding");
            cipher.init(Cipher.ENCRYPT_MODE, stringToPublicKey(key));
            encryptedSessionKey = cipher.doFinal(sessionKey);
        }
        String outSessionKey = Base64.encodeToString(encryptedSessionKey, Base64.DEFAULT);

        //encrypt userData
        random.nextBytes(new byte[16]);
        IvParameterSpec iv = new IvParameterSpec(random.generateSeed(16));
        SecretKeySpec sKey = new SecretKeySpec(sessionKey, "AES");
        Cipher cipherData = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipherData.init(Cipher.ENCRYPT_MODE, sKey, iv);
        byte[] encryptedDataBytes = cipherData.doFinal(plain.getBytes(StandardCharsets.UTF_8));
        String outEncryptedData = Base64.encodeToString(encryptedDataBytes, Base64.DEFAULT);

        //encode session key + timestamp to sha-256
        long unixTimeStamp = System.currentTimeMillis() / 1000L;
        byte[] utsBytes = String.valueOf(unixTimeStamp).getBytes(StandardCharsets.UTF_8);
        ByteBuffer bb = ByteBuffer.allocate(sessionKey.length + utsBytes.length);
        bb.put(sessionKey).put(utsBytes);
        byte[] concatSkeyTime = bb.array();
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(concatSkeyTime);
        byte[] digest = md.digest();

        //generate hmac
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec hmacKey = new SecretKeySpec(digest, sha256_HMAC.getAlgorithm());
        sha256_HMAC.init(hmacKey);
        byte[] encryptedHmacBytes = sha256_HMAC.doFinal(encryptedDataBytes);
        String encryptedHmacData = toHexString(encryptedHmacBytes);

        HashMap<String, String> cipherBox = new HashMap<>();
        cipherBox.put("cbx", "cb1");
        cipherBox.put("ts", String.valueOf(unixTimeStamp));
        cipherBox.put("pk", keyType);
        cipherBox.put("iv", Base64.encodeToString(iv.getIV(), Base64.DEFAULT));
        cipherBox.put("key", outSessionKey);
        cipherBox.put("hmac", encryptedHmacData);
        cipherBox.put("userData", outEncryptedData);

        return cipherBox;
    }

    public static HashMap<String, String> encryptcb3(String plain, Key key) throws NoSuchPaddingException,
            NoSuchAlgorithmException,
            BadPaddingException,
            IllegalBlockSizeException,
            InvalidKeyException,
            InvalidAlgorithmParameterException {

        //generate salt and sessionkey
        SecureRandom random = new SecureRandom();
        random.nextBytes(new byte[64]);
        byte salt[] = random.generateSeed(64);

        Mac sha256_HMACkey = Mac.getInstance("HmacSHA256");
        sha256_HMACkey.init(key);
        byte[] sessionKey = sha256_HMACkey.doFinal(salt);

        //encrypt userData
        random.nextBytes(new byte[16]);
        IvParameterSpec iv = new IvParameterSpec(random.generateSeed(16));
        SecretKeySpec sKey = new SecretKeySpec(sessionKey, "AES");
        Cipher cipherData = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipherData.init(Cipher.ENCRYPT_MODE, sKey, iv);
        byte[] encryptedData = cipherData.doFinal(plain.getBytes(StandardCharsets.UTF_8));
        String outEncryptedData = Base64.encodeToString(encryptedData, Base64.NO_WRAP);

        //encode session key + timestamp to sha-256
        long unixTime = System.currentTimeMillis() / 1000L;
        byte[] unixTimeBytes = String.valueOf(unixTime).getBytes(StandardCharsets.UTF_8);
        ByteBuffer bb = ByteBuffer.allocate(sessionKey.length + unixTimeBytes.length);
        bb.put(sessionKey).put(unixTimeBytes);
        byte[] concatSkeyTime = bb.array();
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(concatSkeyTime);
        byte[] digest = md.digest();

        //generate hmac
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec hmacKey = new SecretKeySpec(digest, "HmacSHA256");
        sha256_HMAC.init(hmacKey);
        byte[] encryptedMac = sha256_HMAC.doFinal(encryptedData);
        String encryptedMacData = toHexString(encryptedMac);

        HashMap<String, String> cipherBox = new HashMap<>();
        cipherBox.put("cbx", "cb3");
        cipherBox.put("ts", String.valueOf(unixTime));
        cipherBox.put("salt", Base64.encodeToString(salt, Base64.NO_WRAP));
        cipherBox.put("iv", Base64.encodeToString(iv.getIV(), Base64.NO_WRAP));
        cipherBox.put("hmac", encryptedMacData);
        cipherBox.put("userData", outEncryptedData);
        cipherBox.put("sessionKey", Base64.encodeToString(sessionKey, Base64.NO_WRAP));

        return cipherBox;
    }

    public static String decryptcb0(String ts, String iv, String data, String hmac, String key)
            throws NoSuchAlgorithmException,
            InvalidKeyException,
            NoSuchPaddingException,
            InvalidAlgorithmParameterException,
            BadPaddingException,
            IllegalBlockSizeException {

        byte[] dataBytes = Base64.decode(data, Base64.DEFAULT);

        byte[] tsBytes = ts.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = Base64.decode(key, Base64.DEFAULT);
        ByteBuffer bb = ByteBuffer.allocate(keyBytes.length + tsBytes.length);
        bb.put(keyBytes).put(tsBytes);
        byte[] concatSkeyTime = bb.array();
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(concatSkeyTime);
        byte[] digest = md.digest();

        //generate mac
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec hmacKey = new SecretKeySpec(digest, "HmacSHA256");
        mac.init(hmacKey);
        byte[] encryptedMac = mac.doFinal(Base64.decode(data, Base64.DEFAULT));

        Cipher cipherData = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec intv = new IvParameterSpec(Base64.decode(iv, Base64.DEFAULT));
        SecretKeySpec skeySpec = new SecretKeySpec(keyBytes, "AES");
        cipherData.init(Cipher.DECRYPT_MODE, skeySpec, intv);
        byte[] decryptedBytes = cipherData.doFinal(Base64.decode(data, Base64.DEFAULT));

        return new String(decryptedBytes);
    }

    private static PublicKey stringToPublicKey(String publicKeyString)
            throws InvalidKeySpecException,
            NoSuchAlgorithmException {

        byte[] keyBytes = Base64.decode(publicKeyString, Base64.DEFAULT);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(CRYPTO_METHOD);

        return keyFactory.generatePublic(spec);
    }

    private static PrivateKey stringToPrivateKey(String privateKeyString)
            throws InvalidKeySpecException,
            NoSuchAlgorithmException {

        byte[] pkcs8EncodedBytes = Base64.decode(privateKeyString, Base64.DEFAULT);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(pkcs8EncodedBytes);
        KeyFactory kf = KeyFactory.getInstance(CRYPTO_METHOD);

        return kf.generatePrivate(keySpec);
    }

    public static String toHexString(byte[] in) {
        final StringBuilder builder = new StringBuilder();
        for (byte b : in) {
            builder.append(String.format("%02x", b));
        }

        return builder.toString();
    }
}
