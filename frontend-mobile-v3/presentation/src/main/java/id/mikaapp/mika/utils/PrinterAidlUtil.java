package id.mikaapp.mika.utils;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.RemoteException;
import android.widget.Toast;
import woyou.aidlservice.jiuiv5.ICallback;
import woyou.aidlservice.jiuiv5.IWoyouService;

/**
 * Created by danielhc on 02/05/18.
 */

public class PrinterAidlUtil {

    private static PrinterAidlUtil instance;

    public static PrinterAidlUtil getInstance(Context context) {
        if (instance == null) {
            instance = new PrinterAidlUtil(context);
        }
        return instance;
    }

    private Context context;
    private IWoyouService woyouService;

    private PrinterAidlUtil(Context context) {
        this.context = context.getApplicationContext();
        bindService();
    }

    private void bindService() {
        Intent intent = new Intent();
        intent.setPackage("woyou.aidlservice.jiuiv5");
        intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
        context.startService(intent);
        context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }


    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            woyouService = IWoyouService.Stub.asInterface(iBinder);
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            Toast.makeText(context, "service disconnected",
                    Toast.LENGTH_LONG).show();

            woyouService = null;
        }
    };

    public void print(String text) {
        if (woyouService == null) {
            return;
        }
        try {
            woyouService.printerInit(callback);
            woyouService.printText(text, callback);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }


    private ICallback callback = new ICallback() {
        @Override
        public void onRunResult(boolean isSuccess) {

        }

        @Override
        public void onReturnString(String result) {
            Toast.makeText(context, result, Toast.LENGTH_SHORT).show();
        }

        @Override
        public void onRaiseException(int code, String msg) {

        }

        @Override
        public IBinder asBinder() {
            return null;
        }
    };
}
