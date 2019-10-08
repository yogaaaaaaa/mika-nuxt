package id.mikaapp.sdk.utils;

import android.os.*;
import android.text.TextUtils;
import com.sunmi.pay.hardware.aidlv2.AidlConstantsV2;
import com.sunmi.pay.hardware.aidlv2.bean.EMVCandidateV2;
import com.sunmi.pay.hardware.aidlv2.bean.EMVTransDataV2;
import com.sunmi.pay.hardware.aidlv2.emv.EMVListenerV2;
import com.sunmi.pay.hardware.aidlv2.emv.EMVOptV2;
import com.sunmi.pay.hardware.aidlv2.pinpad.PinPadOptV2;
import com.sunmi.pay.hardware.aidlv2.readcard.CheckCardCallbackV2;
import com.sunmi.pay.hardware.aidlv2.readcard.ReadCardOptV2;
import com.sunmi.pay.hardware.aidlv2.security.SecurityOptV2;
import com.sunmi.pay.hardware.aidlv2.system.BasicOptV2;
import id.mikaapp.sdk.BuildConfig;
import id.mikaapp.sdk.callbacks.StartSunmiPayServiceCallback;
import id.mikaapp.sdk.utils.sunmipay.*;
import sunmi.sunmiui.utils.LogUtil;

import java.util.*;

public class PaymentCardUtil {

    private StartSunmiPayServiceCallback callback;
    private String amount;
    private BasicOptV2 mBasicOptV2;
    private ReadCardOptV2 mReadCardOptV2;
    private PinPadOptV2 mPinPadOptV2;
    private SecurityOptV2 mSecurityOptV2;
    private EMVOptV2 mEMVOptV2;
    private Map<String, String> configMap;
    private boolean mCardReady;
    public String mEmvData;
    private String mCardNo;
    private String mEmvTrack2;
    public String magneticTrack2;
    private int mCardType;
    private int mPinType;   // 0-online pin, 1-offline pin
    private String mCertInfo;
    private int mAppSelect = 0;
    private int mProcessStep;
    private boolean isCheckingCard = false;
    private boolean isEmvInitialized = false;
    private int timeout;

    private String TAG = "PaymentSunmiService";
    private static final int EMV_APP_SELECT = 1;
    private static final int EMV_FINAL_APP_SELECT = 2;
    private static final int EMV_CONFIRM_CARD_NO = 3;
    private static final int EMV_CERT_VERIFY = 4;
    private static final int EMV_SHOW_PIN_PAD = 5;
    private static final int EMV_ONLINE_PROCESS = 6;
    private static final int EMV_SIGNATURE = 7;
    private static final int MAG_SHOW_PIN_PAD = 8;
    private static final int IC_CARD_ATTACH = 9;
    private static final int CARD_DETECTED = 10;
    private static final int IC_CARD_DETACH = 11;
    private static final int CARD_ERROR = 12;
    private static final int EMV_TRANS_SUCCESS = 888;
    private static final int EMV_TRANS_FAIL = 999;

    private Looper mLooper = Looper.myLooper();
    //Handler adopted from Sunmi SDK example
    private Handler mHandler = new Handler(mLooper) {
        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            switch (msg.what) {
                case EMV_FINAL_APP_SELECT:
                    importFinalAppSelectStatus(0);
                    break;
                case EMV_APP_SELECT:
                    String[] candiNames = (String[]) msg.obj;
//                    showDialogAppSelect(candiNames);
                    break;
                case EMV_CONFIRM_CARD_NO:
                    confirmCardNo();
                    break;
                case EMV_CERT_VERIFY:
//                    LogUtil.d(TAG, "EMV_CERT_VERIFY: " + mCertInfo);
                    break;
                case EMV_SHOW_PIN_PAD:
                    importPinInputStatus(2);
                    break;
                case EMV_ONLINE_PROCESS:
                    mockRequestToServer();
                    break;
                case EMV_SIGNATURE:
                    importSignatureStatus(0);
                    break;
                case EMV_TRANS_FAIL:
                    callback.onAttach(false, false);
                    callback.onFailure(msg.arg1, msg.obj.toString());
                    mCardReady = false;
                    initEmvProcess();
                    break;
                case EMV_TRANS_SUCCESS:
                    if (BuildConfig.DEBUG) {
                        LogUtil.d(TAG, "EMV_TRANS_SUCCESS");
                    }
                    if (mCardType == AidlConstantsV2.CardType.NFC.getValue() || mCardType == AidlConstantsV2.CardType.IC.getValue()) {
                        checkAttachedIC();
                    }
                    break;
                case CARD_DETECTED:
                    mCardReady = true;
                    if (mCardType == AidlConstantsV2.CardType.MAGNETIC.getValue()) {
                        Bundle bundle = (Bundle) msg.obj;
                        handleMagnetic(bundle);
                    } else {
                        callback.onAttach(true, false);
                        String last4digitPAN = mEmvTrack2.substring(mEmvTrack2.length() - 4);
                        String first6digitPAN = mEmvTrack2.substring(0, 6);
                        String panMasked = first6digitPAN.substring(0, 4) + " " + first6digitPAN.substring(4, 6) + "xx xxxx " + last4digitPAN;
                        callback.onSuccessIcNfcCard(panMasked);
                    }
                    break;
                case IC_CARD_DETACH:
//                    mEmvTrack2 = "";
//                    mEmvData = "";
//                    magneticTrack2 = "";
                    callback.onAttach(false, false);
                    mCardReady = false;
                    initEmvProcess();
                    break;
                case IC_CARD_ATTACH:
                    callback.onAttach(true, true);
                    transactProcess(amount);
                    break;
                case CARD_ERROR:
                    callback.onFailure(msg.arg1, msg.obj.toString());
                    //-30005 = Card read timeout and -30001 = Failure to read card
                    if (msg.arg1 == -30005) {
                        initEmvProcess();
                    } else if (msg.arg1 == -30001) {
                        initEmvProcess();
                    }
                    break;
            }
        }
    };

    public PaymentCardUtil(StartSunmiPayServiceCallback callback, String amount, int timeout, BasicOptV2 mBasicOptV2, ReadCardOptV2 mReadCardOptV2, PinPadOptV2 mPinPadOptV2, SecurityOptV2 mSecurityOptV2, EMVOptV2 mEMVOptV2) {
        this.callback = callback;
        this.amount = amount;
        this.timeout = timeout;
        this.mBasicOptV2 = mBasicOptV2;
        this.mReadCardOptV2 = mReadCardOptV2;
        this.mPinPadOptV2 = mPinPadOptV2;
        this.mSecurityOptV2 = mSecurityOptV2;
        this.mEMVOptV2 = mEMVOptV2;

        configMap = EmvUtil.getConfig(EmvUtil.COUNTRY_INDONESIA);
        ThreadPoolUtil.executeInCachePool(
                new Runnable() {
                    @Override
                    public void run() {
                        EmvUtil.initKey();
                        EmvUtil.initAidAndRid();
                        EmvUtil.setTerminalParam(configMap);
                    }
                }
        );
    }

    /**
     * Initialize EMV Process (clear all TLV), then check card
     */
    public void initEmvProcess() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "initEmvProcess");
        }
        try {
            //Check whether the emv already initialized
            if (isEmvInitialized) stopEmvProcess();
            //Initialize EMV process
            mEMVOptV2.initEmvProcess();
            isEmvInitialized = true;
            //Check card
            checkCard();
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    /**
     * Stop EMV process
     */
    public void stopEmvProcess() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "stopEmvProcess");
        }
        try {
            if (mCardType == AidlConstantsV2.CardType.IC.getValue() ||
                    mCardType == AidlConstantsV2.CardType.NFC.getValue()) {
                if (mProcessStep == EMV_APP_SELECT) {
                    importAppSelect(-1);
                } else if (mProcessStep == EMV_FINAL_APP_SELECT) {
                    importFinalAppSelectStatus(-1);
                } else if (mProcessStep == EMV_CONFIRM_CARD_NO) {
                    importCardNoStatus(1);
                } else if (mProcessStep == EMV_CERT_VERIFY) {
                    importCertStatus(1);
                } else if (mProcessStep == EMV_ONLINE_PROCESS) {
                    importOnlineProcessStatus(1);
                } else if (mProcessStep == EMV_SIGNATURE) {
                    importSignatureStatus(1);
                } else {
                    if (mCardType == AidlConstantsV2.CardType.NFC.getValue()) {
                        importPinInputStatus(3);
                    }
                }
                isEmvInitialized = false;
            }
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    /**
     * Card checking (Magnetic, IC, NFC)
     */
    private void checkCard() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "checkCard");
        }
        try {
            if (isCheckingCard) cancelCheckCard();
            int cardType = AidlConstantsV2.CardType.MAGNETIC.getValue() |
                    AidlConstantsV2.CardType.IC.getValue() |
                    AidlConstantsV2.CardType.NFC.getValue();
            mReadCardOptV2.checkCard(cardType, mCheckCardCallback, timeout);
            isCheckingCard = true;
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    //Callback for card checking process
    private CheckCardCallbackV2 mCheckCardCallback = new CheckCardCallbackV2.Stub() {



        @Override
        public void findMagCard(Bundle bundle) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "findMagCard");
            }
            mCardType = AidlConstantsV2.CardType.MAGNETIC.getValue();
            mHandler.obtainMessage(CARD_DETECTED, bundle).sendToTarget();
        }

        @Override
        public void findICCard(String s) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onFindICCard: " + s);
            }
            mCardType = AidlConstantsV2.CardType.IC.getValue();
            mHandler.obtainMessage(IC_CARD_ATTACH).sendToTarget();
        }

        @Override
        public void findRFCard(String s) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "findRFCard: " + s);
            }
            mCardType = AidlConstantsV2.CardType.NFC.getValue();
            mHandler.obtainMessage(IC_CARD_ATTACH).sendToTarget();
        }

        @Override
        public void onError(int code, String message) {
            String error = "onError:" + message + " -- " + code;
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, error);
            }
            mHandler.obtainMessage(CARD_ERROR, code, code, error).sendToTarget();
        }
    };

    /**
     * Cancel attached card listener
     */
    public void cancelAttachedCard() {
        if (mCardType == AidlConstantsV2.CardType.IC.getValue() || mCardType == AidlConstantsV2.CardType.NFC.getValue()) {
            mHandler.removeCallbacksAndMessages(null);
        }
    }

    /**
     * Cancel card checking
     */
    public void cancelCheckCard() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "cancelCheckCard");
        }
        try {
            mReadCardOptV2.cancelCheckCard();
            isCheckingCard = false;
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    /**
     * Check whether the IC/NFC card exist on slot
     */
    private void checkAttachedIC() {
        if (mCardType == AidlConstantsV2.CardType.IC.getValue() || mCardType == AidlConstantsV2.CardType.NFC.getValue()) {
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        // if card exist on slot then stopTransactionProcess checking card, else check card
                        if (mReadCardOptV2.getCardExistStatus(mCardType) == AidlConstantsV2
                                .CardExistStatus.CARD_PRESENT) {
                            mHandler.postDelayed(this, 1000);
                        } else {
                            mHandler.obtainMessage(IC_CARD_DETACH).sendToTarget();
                        }
                    } catch (Exception e) {
                        if (BuildConfig.DEBUG) {
                            LogUtil.e(TAG, "exception:" + e.getMessage());
                        }
                    }
                }
            });
        }
    }

    /**
     * Handle the magnet card data
     *
     * @param bundle Magnetic card bundle (track1, track2, track3)
     */
    private void handleMagnetic(Bundle bundle) {
        mCardType = AidlConstantsV2.CardType.MAGNETIC.getValue();
        if (bundle == null) {
            initEmvProcess();
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "TrackCardNull");
            }
        } else {
            String track2 = bundle.getString("TRACK2");
            if (track2 != null) {
                mEmvData = "";
                magneticTrack2 = track2;
                String pan = magneticTrack2.split("=")[0];
                String last4digitPAN = pan.substring(pan.length() - 4);
                String first6digitPAN = pan.substring(0, 6);
                String panMasked = first6digitPAN.substring(0, 4) + " " + first6digitPAN.substring(4, 6) + "xx xxxx " + last4digitPAN;

                callback.onSuccessMagneticCard(panMasked);
            } else {
                callback.onError(new Throwable("Please try again"));
            }
            initEmvProcess();
        }
    }

    /**
     * Start transaction process for IC and NFC card to retrieve the EMV tag
     *
     * @param amount Transaction amount
     */
    private void transactProcess(String amount) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "transactProcess");
        }
        try {
            EMVTransDataV2 emvTransData = new EMVTransDataV2();
            emvTransData.amount = String.valueOf(amount);
            emvTransData.flowType = 1;
            emvTransData.cardType = mCardType;
            mEMVOptV2.transactProcess(emvTransData, mEMVListener);
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    /**
     * Confirm card no of IC and NFC card
     */
    private void confirmCardNo() {
        importCardNoStatus(0);
    }

    /**
     * Mock request to server
     */
    private void mockRequestToServer() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "mockRequestToServer");
        }
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (AidlConstantsV2.CardType.MAGNETIC.getValue() != mCardType) {
                        getTlvData();
                    }
                    Thread.sleep(1500);
                    // notice  ==  import the online result to SDK and end the process.
                    importOnlineProcessStatus(0);
                } catch (Exception e) {
                    if (BuildConfig.DEBUG) {
                        LogUtil.e(TAG, e.getMessage());
                    }
                    importOnlineProcessStatus(-1);
                }
            }
        }).start();
    }

    /**
     * Initialize EMV TLV data
     */
    private void initEmvTlvData() {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "initEmvTlvData");
        }
        try {
            // set normal tlv data
            String[] tags = {"5F2A", "5F36"};
            String[] values = {
                    configMap.get("5F2A"),
                    configMap.get("5F36")
            };
            mEMVOptV2.setTlvList(AidlConstantsV2.EMV.TLVOpCode.OP_NORMAL, tags, values);
        } catch (RemoteException e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "initEmvTlvData:" + e.getMessage());
            }
            e.printStackTrace();
        }
    }

    private void importAppSelect(int selectIndex) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importAppSelect selectIndex:" + selectIndex);
        }
        try {
            mEMVOptV2.importAppSelect(selectIndex);
        } catch (Exception e) {
            e.printStackTrace();
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importAppSelect:" + e.getMessage());
            }
        }
    }

    private void importFinalAppSelectStatus(int status) {
        try {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "importFinalAppSelectStatus status:" + status);
            }
            mEMVOptV2.importAppFinalSelectStatus(status);
        } catch (RemoteException e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importFinalAppSelectStatus:" + e.getMessage());
            }
        }
    }

    private void importCardNoStatus(int status) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importCardNoStatus status:" + status);
        }
        try {
            mEMVOptV2.importCardNoStatus(status);
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importCardNoStatus:" + e.getMessage());
            }
        }
    }

    private void importCertStatus(int status) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importCertStatus status:" + status);
        }
        try {
            mEMVOptV2.importCertStatus(status);
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importCertStatus:" + e.getMessage());
            }
        }
    }

    private void importPinInputStatus(int inputResult) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importPinInputStatus:" + inputResult);
        }
        try {
            mEMVOptV2.importPinInputStatus(mPinType, inputResult);
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importPinInputStatus:" + e.getMessage());
            }
        }
    }

    private void importOnlineProcessStatus(int status) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importOnlineProcessStatus status:" + status);
        }
        try {
            String[] tags = {"71", "72", "91", "8A", "89"};
            String[] values = {"", "", "", "", ""};
            byte[] out = new byte[1024];
            int len = mEMVOptV2.importOnlineProcStatus(status, tags, values, out);
            if (len < 0) {
                if (BuildConfig.DEBUG) {
                    LogUtil.e(TAG, "importOnlineProcessStatus error,code:" + len);
                }
            } else {
                byte[] bytes = Arrays.copyOf(out, len);
                String hexStr = ByteUtil.bytes2HexStr(bytes);
                if (BuildConfig.DEBUG) {
                    LogUtil.d(TAG, "importOnlineProcessStatus outData:" + hexStr);
                }
            }
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importOnlineProcessStatus:" + e.getMessage());
            }
        }
    }

    private void importSignatureStatus(int status) {
        if (BuildConfig.DEBUG) {
            LogUtil.d(TAG, "importSignatureStatus status:" + status);
        }
        try {
            mEMVOptV2.importSignatureStatus(status);
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, "importSignatureStatus:" + e.getMessage());
            }
        }
    }

    /**
     * Get EMV TLV data
     */
    private void getTlvData() {
        try {
            String[] tagList = {"57", "82", "95", "9A", "9C", "5F2A", "5F34", "9F02", "9F03",
                    "9F10", "9F1A", "9F26", "9F27", "9F33", "9F34", "9F35", "9F36", "9F37",
                    "8F", "9F49",};

            byte[] outData = new byte[2048];
            Map<String, TLV> map = new LinkedHashMap<>();
            int tlvOpCode;
            if (AidlConstantsV2.CardType.NFC.getValue() == mCardType) {
                if (mAppSelect == 2) {
                    tlvOpCode = AidlConstantsV2.EMV.TLVOpCode.OP_PAYPASS;
                } else if (mAppSelect == 1) {
                    tlvOpCode = AidlConstantsV2.EMV.TLVOpCode.OP_PAYWAVE;
                } else {
                    tlvOpCode = AidlConstantsV2.EMV.TLVOpCode.OP_NORMAL;
                }
            } else {
                tlvOpCode = AidlConstantsV2.EMV.TLVOpCode.OP_NORMAL;
            }

            int len = mEMVOptV2.getTlvList(tlvOpCode, tagList, outData);
            if (len > 0) {
                byte[] bytes = Arrays.copyOf(outData, len);
                String hexStr = ByteUtil.bytes2HexStr(bytes);
//                if (BuildConfig.DEBUG) {
//                    LogUtil.d(TAG, "hexStr:" + hexStr);
//                }
                magneticTrack2 = "";
                mEmvData = hexStr;
                mHandler.obtainMessage(CARD_DETECTED, hexStr).sendToTarget();
                Map<String, TLV> tlvMap = TLVUtil.buildTLVMap(hexStr);
                map.putAll(tlvMap);
            }

            final StringBuilder sb = new StringBuilder();
            Set<String> keySet = map.keySet();
            for (String key : keySet) {
                TLV tlv = map.get(key);
                sb.append(key);
                sb.append(":");
                if (tlv != null) {
                    String value = tlv.getValue();
                    sb.append(value);
                }
                sb.append("\n");
            }
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "getTlvData sb1:" + sb);
            }
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                LogUtil.e(TAG, e.getMessage());
            }
        }
    }

    //Listener for EMV process
    private EMVListenerV2 mEMVListener = new EMVListenerV2.Stub() {

        @Override
        public void onWaitAppSelect(List<EMVCandidateV2> appNameList, boolean isFirstSelect) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onWaitAppSelect isFirstSelect:" + isFirstSelect);
            }
            mProcessStep = EMV_APP_SELECT;
            String[] candidateNames = getCandidateNames(appNameList);
            mHandler.obtainMessage(EMV_APP_SELECT, candidateNames).sendToTarget();
        }

        @Override
        public void onAppFinalSelect(String tag9F06value) throws RemoteException {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onAppFinalSelect tag9F06value:" + tag9F06value);
            }
            initEmvTlvData();

            if (tag9F06value != null && tag9F06value.length() > 0) {
                boolean isVisa = tag9F06value.startsWith("A000000003");
                boolean isMaster = tag9F06value.startsWith("A000000004");
                boolean isUnion = tag9F06value.startsWith("A000000333");
                if (isVisa) {
                    // VISA(PayWave)
                    if (BuildConfig.DEBUG) {
                        LogUtil.d(TAG, "detect VISA card");
                    }
                    mAppSelect = 1;
                    // set PayWave tlv data
                    String[] tagsPayWave = {
                            "DF8124", "DF8125", "DF8126"
                    };
                    String[] valuesPayWave = {
                            "999999999999", "999999999999", "000000000000"
                    };
                    mEMVOptV2.setTlvList(AidlConstantsV2.EMV.TLVOpCode.OP_PAYWAVE, tagsPayWave, valuesPayWave);
                } else if (isMaster) {
                    // MasterCard(PayPass)
                    if (BuildConfig.DEBUG) {
                        LogUtil.d(TAG, "detect MasterCard card");
                    }
                    mAppSelect = 2;
                    // set PayPass tlv data
                    String[] tagsPayPass = {
                            "DF8117", "DF8118", "DF8119", "DF811F", "DF811E", "DF812C",
                            "DF8123", "DF8124", "DF8125", "DF8126",
                            "DF811B", "DF811D", "DF8122", "DF8120", "DF8121"
                    };
                    String[] valuesPayPass = {
                            "E0", "F8", "F8", "E8", "00", "00",
                            "999999999999", "999999999999", "999999999999", "000000000000",
                            "30", "02", "0000000000", "000000000000", "000000000000"
                    };
                    mEMVOptV2.setTlvList(AidlConstantsV2.EMV.TLVOpCode.OP_PAYPASS, tagsPayPass,
                            valuesPayPass);
                } else if (isUnion) {
                    mAppSelect = 0;
                    // UnionPay
                    if (BuildConfig.DEBUG) {
                        LogUtil.d(TAG, "detect UnionPay card");
                    }
                }

                if (AidlConstantsV2.CardType.IC.getValue() == mCardType) {
                    String[] tags = {
                            "9F33", "9F09", "DF81FF"
                    };
                    String[] values = {
                            "E008FF", "0111", "01"
                    };
                    mEMVOptV2.setTlvList(AidlConstantsV2.EMV.TLVOpCode.OP_NORMAL, tags, values);
                }
            }
            mProcessStep = EMV_FINAL_APP_SELECT;
            mHandler.obtainMessage(EMV_FINAL_APP_SELECT, tag9F06value).sendToTarget();
        }

        @Override
        public void onConfirmCardNo(String cardNo) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onConfirmCardNo cardNo:" + cardNo);
            }
            mEmvTrack2 = cardNo;
            mCardNo = cardNo;
            mProcessStep = EMV_CONFIRM_CARD_NO;
            mHandler.obtainMessage(EMV_CONFIRM_CARD_NO).sendToTarget();
        }

        @Override
        public void onRequestShowPinPad(int pinType, int remainTime) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onRequestShowPinPad pinType:" + pinType + " remainTime:" + remainTime);
            }
            mPinType = pinType;
            mProcessStep = EMV_SHOW_PIN_PAD;
            mHandler.obtainMessage(EMV_SHOW_PIN_PAD).sendToTarget();
        }

        @Override
        public void onRequestSignature() {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onRequestSignature");
            }
            mProcessStep = EMV_SIGNATURE;
            mHandler.obtainMessage(EMV_SIGNATURE).sendToTarget();
        }

        @Override
        public void onCertVerify(int certType, String certInfo) {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onCertVerify certType:" + certType + " certInfo:" + certInfo);
            }
            mCertInfo = certInfo;
            mProcessStep = EMV_CERT_VERIFY;
            mHandler.obtainMessage(EMV_CERT_VERIFY).sendToTarget();
        }

        @Override
        public void onOnlineProc() {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onOnlineProcess");
            }
            mProcessStep = EMV_ONLINE_PROCESS;
            mHandler.obtainMessage(EMV_ONLINE_PROCESS).sendToTarget();
        }

        @Override
        public void onCardDataExchangeComplete() {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onCardDataExchangeComplete");
            }
        }

        @Override
        public void onTransResult(int code, String desc) {
            if (code != 0) {
                mHandler.obtainMessage(EMV_TRANS_FAIL, code, code, desc).sendToTarget();
                if (BuildConfig.DEBUG) {
                    LogUtil.d(TAG, "[" + code + "] onTransResult: " + desc);
                }
            } else {
                mHandler.obtainMessage(EMV_TRANS_SUCCESS, code, code, desc).sendToTarget();
            }
        }

        @Override
        public void onConfirmationCodeVerified() throws RemoteException {
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "onConfirmationCodeVerified");
            }
            byte[] outData = new byte[512];
            int len = mEMVOptV2.getTlv(AidlConstantsV2.EMV.TLVOpCode.OP_PAYPASS, "DF8129", outData);
            if (len > 0) {
                byte[] data = new byte[len];
                System.arraycopy(outData, 0, data, 0, len);
                String hexStr = ByteUtil.bytes2HexStr(data);
                if (BuildConfig.DEBUG) {
                    LogUtil.e(TAG, "DF8129: " + hexStr);
                }
            }

            // card off
            mReadCardOptV2.cardOff(mCardType);
        }
    };

    private String[] getCandidateNames(List<EMVCandidateV2> candiList) {
        if (candiList == null || candiList.size() == 0) return new String[0];
        String[] result = new String[candiList.size()];
        for (int i = 0; i < candiList.size(); i++) {
            EMVCandidateV2 candi = candiList.get(i);
            String name = candi.appPreName;
            name = TextUtils.isEmpty(name) ? candi.appLabel : name;
            name = TextUtils.isEmpty(name) ? candi.appName : name;
            name = TextUtils.isEmpty(name) ? "" : name;
            result[i] = name;
            if (BuildConfig.DEBUG) {
                LogUtil.d(TAG, "EMVCandidateV2: " + name);
            }
        }
        return result;
    }
}
