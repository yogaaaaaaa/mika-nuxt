package id.mikaapp.mika.utils;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.*;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;
import android.widget.Toast;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.journeyapps.barcodescanner.BarcodeEncoder;
import id.mikaapp.mika.R;
import id.mikaapp.sdk.models.TransactionDetail;
import woyou.aidlservice.jiuiv5.ICallback;
import woyou.aidlservice.jiuiv5.IWoyouService;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class AidlUtil {
    private static final String SERVICE＿PACKAGE = "woyou.aidlservice.jiuiv5";
    private static final String SERVICE＿ACTION = "woyou.aidlservice.jiuiv5.IWoyouService";

    private OnPrinterConnectListener listener;
    private IWoyouService woyouService;
    private static AidlUtil mAidlUtil = new AidlUtil();
    private Context context;


    private AidlUtil() {
    }

    public static AidlUtil getInstance() {
        return mAidlUtil;
    }

    /**
     * 连接服务
     *
     * @param context context
     */
    public void connectPrinterService(Context context, OnPrinterConnectListener listener) {
        this.listener = listener;
        this.context = context.getApplicationContext();
        Intent intent = new Intent();
        intent.setPackage(SERVICE＿PACKAGE);
        intent.setAction(SERVICE＿ACTION);
        context.getApplicationContext().startService(intent);
        context.getApplicationContext().bindService(intent, connService, Context.BIND_AUTO_CREATE);
    }

    /**
     * 断开服务
     *
     * @param context context
     */
    public void disconnectPrinterService(Context context) {
        if (woyouService != null) {
            context.getApplicationContext().unbindService(connService);
            woyouService = null;
        }
    }

    public boolean isConnect() {
        return woyouService != null;
    }

    private ServiceConnection connService = new ServiceConnection() {

        @Override
        public void onServiceDisconnected(ComponentName name) {
            woyouService = null;
        }

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            woyouService = IWoyouService.Stub.asInterface(service);
            if (listener != null) {
                listener.onConnect();
            }
        }
    };

    public ICallback generateCB(final PrinterCallback printerCallback) {
        return new ICallback.Stub() {


            @Override
            public void onRunResult(boolean isSuccess) throws RemoteException {

            }

            @Override
            public void onReturnString(String result) throws RemoteException {
                printerCallback.onReturnString(result);
            }

            @Override
            public void onRaiseException(int code, String msg) throws RemoteException {

            }
        };
    }

    /**
     * 设置打印浓度
     */
    private int[] darkness = new int[]{0x0600, 0x0500, 0x0400, 0x0300, 0x0200, 0x0100, 0,
            0xffff, 0xfeff, 0xfdff, 0xfcff, 0xfbff, 0xfaff};

    public void setDarkness(int index) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return;
        }

        int k = darkness[index];
        try {
            woyouService.sendRAWData(ESCUtil.setPrinterDarkness(k), null);
            woyouService.printerSelfChecking(null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    /**
     * 取得打印机系统信息，放在list中
     *
     * @return list
     */
    public List<String> getPrinterInfo(PrinterCallback printerCallback) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return null;
        }

        List<String> info = new ArrayList<>();
        try {
            woyouService.getPrintedLength(generateCB(printerCallback));
            info.add(woyouService.getPrinterSerialNo());
            info.add(woyouService.getPrinterModal());
            info.add(woyouService.getPrinterVersion());
            info.add(printerCallback.getResult());
            info.add("");
            //info.add(woyouService.getServiceVersion());
            PackageManager packageManager = context.getPackageManager();
            try {
                PackageInfo packageInfo = packageManager.getPackageInfo(SERVICE＿PACKAGE, 0);
                if (packageInfo != null) {
                    info.add(packageInfo.versionName);
                    info.add(packageInfo.versionCode + "");
                } else {
                    info.add("");
                    info.add("");
                }
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
            }

        } catch (RemoteException e) {
            e.printStackTrace();
        }
        return info;
    }

    /**
     * 初始化打印机
     */
    public void initPrinter() {
        if (woyouService == null) {
            Toast.makeText(context, "CCCC", Toast.LENGTH_LONG).show();
            return;
        }

        try {
            woyouService.printerInit(null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    /**
     * 打印二维码
     */
    public void printQr(String data, int modulesize, int errorlevel) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return;
        }


        try {
            woyouService.setAlignment(1, null);
            woyouService.printQRCode(data, modulesize, errorlevel, null);
            woyouService.lineWrap(3, null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    /**
     * 打印条形码
     */
    public void printBarCode(String data, int symbology, int height, int width, int textposition) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return;
        }


        try {
            woyouService.printBarCode(data, symbology, height, width, textposition, null);
            woyouService.lineWrap(3, null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    /**
     * 打印文4字
     */
    public void printText(String content, float size, boolean isBold, boolean isUnderLine) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return;
        }

        try {
            if (isBold) {
                woyouService.sendRAWData(ESCUtil.boldOn(), null);
            } else {
                woyouService.sendRAWData(ESCUtil.boldOff(), null);
            }

            if (isUnderLine) {
                woyouService.sendRAWData(ESCUtil.underlineWithOneDotWidthOn(), null);
            } else {
                woyouService.sendRAWData(ESCUtil.underlineOff(), null);
            }

            woyouService.setAlignment(1, null);
            woyouService.printTextWithFont(content, null, size, null);
            woyouService.lineWrap(3, null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }

    }

    public boolean printTransactionReceipt(TransactionDetail transaction, String merchantName, String outletName, String outletAddress) {
        Log.e("FROM_PUSH", "PRINT ORDER RECEIPT");

        if (woyouService == null) {
            Log.d("IMG PRINTER", "WOYOU SERVICE NULL");
            return false;
        }

        try {
            Log.d("IMG PRINTER", "WOYOU SERVICE PRINT");
            woyouService.sendRAWData(ESCUtil.boldOn(), null);
            int[] widths = new int[]{21, 16};
            int[] aligns = new int[]{0, 2};

            woyouService.printText("\n", null);

            woyouService.setAlignment(1, null);

            Bitmap icon = BitmapFactory.decodeResource(context.getResources(), R.drawable.logo_print_mika);
            woyouService.printBitmap(icon, null);


            int[] widths2 = new int[]{38, 3};
            int[] align2 = new int[]{1, 1};

            String terminalName = outletName;
            String terminalFullName = merchantName;
            String transactionId = "Transaksi: " + transaction.getIdAlias();

            String address = outletAddress;
            String footer = "Gunakan QR dan eWallet untuk pembayaran bisnis Anda";
            Pattern pattern = Pattern.compile("\\G\\s*(.{1," + widths2[0] + "})(?=\\s|$)", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(address);

            woyouService.setAlignment(1, null);
            woyouService.setFontSize(20, null);
            woyouService.printText("\n\n", null);
            woyouService.printText(terminalName + "\n", null);
            while (matcher.find()) {
                woyouService.printText(matcher.group(1) + "\n", null);
            }

            woyouService.setAlignment(1, null);
            MultiFormatWriter multiFormatWriter = new MultiFormatWriter();
            try {
                BitMatrix bitMatrixQr = multiFormatWriter.encode(String.valueOf(transaction.getIdAlias()),
                        BarcodeFormat.QR_CODE, 100, 100);
                BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
                Bitmap bitmapQr = barcodeEncoder.createBitmap(bitMatrixQr);
                woyouService.printBitmap(bitmapQr, null);

                Bitmap src = Bitmap.createBitmap(150, 95, Bitmap.Config.ARGB_8888);
                src.eraseColor(Color.WHITE);
                Bitmap dest = Bitmap.createBitmap(src.getWidth(), src.getHeight(), Bitmap.Config.ARGB_8888);
                dest.eraseColor(Color.WHITE);
                String yourText = "ID Transaksi ";
                int index = transaction.getIdAlias().indexOf("-");
                String text2 = transaction.getIdAlias().substring(0, index);
                String text3 = transaction.getIdAlias().substring(index, transaction.getIdAlias().length());

                Typeface tf = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD);
                Canvas cs = new Canvas(dest);
                Paint tPaint = new Paint();
                tPaint.setTextSize(18);
                tPaint.setColor(Color.BLACK);
                tPaint.setStyle(Paint.Style.FILL);
                tPaint.setTypeface(tf);
                cs.drawBitmap(src, 0f, 0f, null);
                float height = tPaint.measureText("yY");
                float width = tPaint.measureText(yourText);
                float x_coord = (src.getWidth() - width) / 2;
                cs.drawText(yourText, 0, height + 10f, tPaint);
                cs.drawText(text2, 0, height + 35f, tPaint);
                cs.drawText(text3, 0, height + 60f, tPaint);

                woyouService.printBitmap(dest, null);
                woyouService.printText("\n", null);
            } catch (WriterException e) {
                e.printStackTrace();
            }

            woyouService.setAlignment(0, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{DateUtil.getDate(transaction.getCreatedAt()).toUpperCase(), DateUtil.getHour(transaction.getCreatedAt()) + ""}, widths, aligns, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{"Metode Pembayaran:", transaction.getAcquirer().getAcquirerType().getName() + ""}, widths, aligns, null);

            woyouService.printColumnsText(new String[]{"Kode Pembayaran:", transaction.getReferenceNumber() + ""}, widths, aligns, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{"TOTAL:", NumberUtil.formatCurrency((double) transaction.getAmount()) + ""}, widths, aligns, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.setAlignment(1, null);

            woyouService.printColumnsText(new String[]{"TERIMA KASIH"}, widths2, align2, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.setAlignment(1, null);
            matcher = pattern.matcher(footer);
            while (matcher.find()) {
                woyouService.printText(matcher.group(1) + "\n", null);
            }
            woyouService.printText("Hubungi snap@getmika.id\n", null);

            woyouService.lineWrap(4, null);

        } catch (RemoteException e) {
            e.printStackTrace();
        }

        return true;
    }

    public boolean printTransactionReceipt(TransactionDetail transaction, Bitmap signature, String cardNo,
                                           String approvalCode, String merchantName, String outletName,
                                           String outletAddress) {
        Log.e("FROM_PUSH", "PRINT ORDER RECEIPT");

        if (woyouService == null) {
            Log.d("IMG PRINTER", "WOYOU SERVICE NULL");
            return false;
        }

        try {
            Log.d("IMG PRINTER", "WOYOU SERVICE PRINT");
            woyouService.sendRAWData(ESCUtil.boldOn(), null);
            int[] widths = new int[]{21, 16};
            int[] widthsCard = new int[]{15, 22};
            int[] aligns = new int[]{0, 2};

            woyouService.setFontSize(20, null);
            woyouService.printText("\n", null);
            woyouService.setAlignment(1, null);

            Bitmap icon = BitmapFactory.decodeResource(context.getResources(), R.drawable.logo_print_mika);
            woyouService.printBitmap(icon, null);

            int[] widths2 = new int[]{38, 3};
            int[] align2 = new int[]{1, 1};

            String terminalName = outletName;
            String terminalFullName = merchantName;
            String transactionId = "Transaksi: " + transaction.getIdAlias();

            String address = outletAddress;
            String footer = "Gunakan QR dan eWallet untuk pembayaran bisnis Anda";
            Pattern pattern = Pattern.compile("\\G\\s*(.{1," + widths2[0] + "})(?=\\s|$)", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(address);

            woyouService.setAlignment(1, null);
            woyouService.printText("\n\n", null);

            woyouService.printText(terminalName + "\n", null);

            while (matcher.find()) {
                woyouService.printText(matcher.group(1) + "\n", null);
            }

            woyouService.setAlignment(1, null);

            MultiFormatWriter multiFormatWriter = new MultiFormatWriter();
            try {
                BitMatrix bitMatrixQr = multiFormatWriter.encode(String.valueOf(transaction.getIdAlias()),
                        BarcodeFormat.QR_CODE, 100, 100);
                BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
                Bitmap bitmapQr = barcodeEncoder.createBitmap(bitMatrixQr);
                woyouService.printBitmap(bitmapQr, null);

                Bitmap src = Bitmap.createBitmap(150, 95, Bitmap.Config.ARGB_8888);
                src.eraseColor(Color.WHITE);
                Bitmap dest = Bitmap.createBitmap(src.getWidth(), src.getHeight(), Bitmap.Config.ARGB_8888);
                dest.eraseColor(Color.WHITE);
                String yourText = "ID Transaksi ";
                int index = transaction.getIdAlias().indexOf("-");
                String text2 = transaction.getIdAlias().substring(0, index);
                String text3 = transaction.getIdAlias().substring(index, transaction.getIdAlias().length());

                Typeface tf = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD);
                Canvas cs = new Canvas(dest);
                Paint tPaint = new Paint();
                tPaint.setTextSize(18);
                tPaint.setColor(Color.BLACK);
                tPaint.setStyle(Paint.Style.FILL);
                tPaint.setTypeface(tf);
                cs.drawBitmap(src, 0f, 0f, null);
                float height = tPaint.measureText("yY");
                float width = tPaint.measureText(yourText);
                float x_coord = (src.getWidth() - width) / 2;
                cs.drawText(yourText, 0, height + 10f, tPaint);
                cs.drawText(text2, 0, height + 35f, tPaint);
                cs.drawText(text3, 0, height + 60f, tPaint);

                woyouService.printBitmap(dest, null);
                woyouService.printText("\n", null);
            } catch (WriterException e) {
                e.printStackTrace();
            }

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{DateUtil.getDate(transaction.getCreatedAt()).toUpperCase(), DateUtil.getHour(transaction.getCreatedAt()) + ""}, widths, aligns, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{"Metode Pembayaran:", transaction.getAcquirer().getAcquirerType().getName() + ""}, widths, aligns, null);

            woyouService.printColumnsText(new String[]{"Kode Pembayaran:", transaction.getReferenceNumber() + ""}, widths, aligns, null);

            if (transaction.getCardApprovalCode() != null) {
                woyouService.printColumnsText(new String[]{"Approval Code:", transaction.getCardApprovalCode() + ""}, widths, aligns, null);
                try {
                    BitMatrix bitMatrix = multiFormatWriter.encode(String.valueOf(approvalCode),
                            BarcodeFormat.CODE_128, 200, 30);
                    BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
                    Bitmap bitmapTransasctionId = barcodeEncoder.createBitmap(bitMatrix);
                    woyouService.setAlignment(1, null);
                    woyouService.printBitmap(bitmapTransasctionId, null);
                    woyouService.printText("\n", null);
                } catch (WriterException e) {
                    e.printStackTrace();
                }
            }

            if (cardNo != null) {
                woyouService.printColumnsText(new String[]{"Nomor Kartu:", cardNo + ""}, widthsCard, aligns, null);
            }

            woyouService.printText("--------------------------------------\n", null);

            woyouService.printColumnsText(new String[]{"TOTAL:", NumberUtil.formatCurrency((double) transaction.getAmount()) + ""}, widths, aligns, null);

            woyouService.printText("--------------------------------------\n", null);


            woyouService.setAlignment(1, null);

            if (signature != null) {
                woyouService.printColumnsText(new String[]{"Tanda tangan Customer:"}, widths2, align2, null);
                woyouService.setAlignment(1, null);
                woyouService.printBitmap(signature, null);
                woyouService.printText("\n", null);
            }
            woyouService.printColumnsText(new String[]{"TERIMA KASIH"}, widths2, align2, null);

            woyouService.printText("--------------------------------------\n", null);

            woyouService.setAlignment(1, null);
            matcher = pattern.matcher(footer);
            while (matcher.find()) {
                woyouService.printText(matcher.group(1) + "\n", null);
            }
            woyouService.printText("Hubungi snap@getmika.id\n", null);

            woyouService.lineWrap(4, null);

        } catch (RemoteException e) {
            e.printStackTrace();
        }

        return true;
    }

    private String censorNumber(String customer) {
        if (customer == null) {
            return "xxxxxxxxxx";
        } else {
            return "xxxxxx" + customer.substring(customer.length() - 4, customer.length());
        }
    }

    /*
     *打印图片
     */
    public void printBitmap(Bitmap bitmap) {
        if (woyouService == null) {
//            Toast.makeText(context, R.string.toast_2, Toast.LENGTH_LONG).show();
            return;
        }

        try {
            woyouService.setAlignment(1, null);
            woyouService.printBitmap(bitmap, null);
            woyouService.lineWrap(3, null);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    public interface OnPrinterConnectListener {
        void onConnect();

        void onFailed();
    }
}
