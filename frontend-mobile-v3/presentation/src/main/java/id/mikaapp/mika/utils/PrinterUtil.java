package id.mikaapp.mika.utils;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.widget.Toast;
import id.mikaapp.mika.R;

import java.io.OutputStream;

/**
 * Created by danielhc on 20/04/18.
 */

public class PrinterUtil {

    private static PrinterUtil instance;

    public static PrinterUtil getInstance(Context context) {
        if (instance == null) {
            instance = new PrinterUtil(context.getApplicationContext());
        }
        return instance;
    }

    private Context context;

    private PrinterUtil(Context context) {
        this.context = context;
    }

    BluetoothAdapter btAdapter;
    BluetoothDevice device;

    public void connectBluetooth() {
        btAdapter = BluetoothUtil.getBTAdapter();
        if (btAdapter == null) {
            Toast.makeText(context, context.getString(R.string.error_connect_bluetooth),
                    Toast.LENGTH_LONG)
                    .show();
            return;
        }
    }

    public void initializeDevice() {
        device = BluetoothUtil.getDevice(btAdapter);
        if (device == null) {
//            Toast.makeText(context, context.getString(R.string.error_connect_printer), Toast.LENGTH_LONG).show();
            return;
        }
    }

    public void printData(String header, String content, String footer) {
        BluetoothSocket socket = null;
        try {
            PrinterCommandTranslator translator = new PrinterCommandTranslator();
            if (device == null) {
                initializeDevice();
                Toast.makeText(context, "Please Try Again", Toast.LENGTH_SHORT).show();
            } else {
                socket = BluetoothUtil.getSocket(device);
                OutputStream out = socket.getOutputStream();
                out.write(translator.toNormalLeftBold("\n"));
                out.write(translator.toNormalCenterBold(header));
                out.write(translator.toNormalLeft("\n--------------------------------\n"));
                out.write(translator.toNormalLeftBold(content));
                out.write(translator.toNormalLeft("\n--------------------------------\n"));
                out.write(translator.toNormalCenterBold(footer));
                out.write(translator.toNormalLeft("\n\n\n\n"));
                out.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


    }
}
