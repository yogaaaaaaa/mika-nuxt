package id.mikaapp.mika.agent.key

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Point
import android.hardware.Camera
import android.os.*
import android.view.*
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.content.ContextCompat
import com.google.android.material.appbar.AppBarLayout
import com.sunmi.scan.Config
import com.sunmi.scan.Image
import com.sunmi.scan.ImageScanner
import id.mikaapp.mika.R
import id.mikaapp.mika.utils.ScanConfig
import id.mikaapp.sdk.models.User
import kotlinx.android.synthetic.main.activity_scankey.*
import org.json.JSONException
import org.json.JSONObject
import sunmi.sunmiui.utils.LogUtil
import java.util.*
import java.util.concurrent.atomic.AtomicBoolean

class ScanKeyActivity : AppCompatActivity(), SurfaceHolder.Callback {

    private lateinit var toolbar: Toolbar
    private lateinit var appBarLayout: AppBarLayout
    private lateinit var surfaceView: SurfaceView
    private lateinit var scannerLayout: View
    private lateinit var scannerBar: View
    private lateinit var mCamera: Camera
    private lateinit var mHolder: SurfaceHolder
    private lateinit var mImageScanner: ImageScanner
    private lateinit var mAutoFocusHandler: Handler
    private lateinit var asyncDecode: AsyncDecode
    private val isRUN = AtomicBoolean(false)
    private val vibrate: Boolean = false
    private lateinit var animator: ObjectAnimator
    private val TAG = ScanKeyActivity::class.java.simpleName
    private var isFlashOn: Boolean = false
    private var user: User? = null
    private var token: String? = null
    private var isLoading = false
    private var mAlias: String? = null
    private var mKey: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scankey)

        toolbar = toolbar_scankey
        appBarLayout = qrPaymentAppBar
        surfaceView = surface_view
        scannerBar = scanner_bar
        scannerLayout = scanner_layout

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        init()
    }

    override fun onResume() {
        super.onResume()
        initScanConfig()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    override fun onPause() {
        super.onPause()
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (mAutoFocusHandler != null) {
            mAutoFocusHandler.removeCallbacksAndMessages(null)
//            mAutoFocusHandler = null
        }
        if (mImageScanner != null) {
            mImageScanner.destroy()
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.activity_payment_scanqr, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> onBackPressed()
            R.id.flash -> if (isFlashOn) {
                item.icon = ContextCompat.getDrawable(this, R.drawable.ic_flash_on)
                turnFlashLightOff()
            } else {
                item.icon = ContextCompat.getDrawable(this, R.drawable.ic_flash_off)
                turnFlashLightOn()
            }
        }

        return super.onOptionsItemSelected(item)
    }

    private fun init() {
        setSupportActionBar(toolbar)
        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        supportActionBar!!.title = ""
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            appBarLayout.outlineProvider = null
        }

//        animator = null

        val vto = scannerLayout.viewTreeObserver
        vto.addOnGlobalLayoutListener(object : ViewTreeObserver.OnGlobalLayoutListener {
            override fun onGlobalLayout() {

                scannerLayout.viewTreeObserver.removeGlobalOnLayoutListener(this)
                scannerLayout.viewTreeObserver.removeOnGlobalLayoutListener(this)

                val destination = scannerLayout.y + scannerLayout.height

                animator = ObjectAnimator.ofFloat(
                    scannerBar, "translationY",
                    scannerLayout.y,
                    destination
                )

                animator.repeatMode = ValueAnimator.REVERSE
                animator.repeatCount = ValueAnimator.INFINITE
                animator.interpolator = AccelerateDecelerateInterpolator()
                animator.duration = 3000
                animator.start()

            }
        })

        mAutoFocusHandler = Handler()
        mHolder = surfaceView.holder
        mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS)
        mHolder.addCallback(this)
        mImageScanner = ImageScanner()
        mImageScanner.setConfig(0, Config.X_DENSITY, 2)//行扫描间隔
        mImageScanner.setConfig(0, Config.Y_DENSITY, 2)//列扫描间隔
//        initData()
    }

    private fun initScanConfig() {
        mImageScanner.setConfig(0, Config.ENABLE_MULTILESYMS, 0)
        mImageScanner.setConfig(0, Config.ENABLE_INVERSE, 0)
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        LogUtil.e(TAG, "surfaceCreated")
        try {
            mCamera = Camera.open()
        } catch (e: Exception) {
            LogUtil.e(TAG, "Camera.open()")
//            mCamera = null
        }

    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        LogUtil.e(TAG, "surfaceChanged")
        if (mHolder.surface == null) {
            return
        }
        try {
            mCamera.stopPreview()
        } catch (e: Exception) {
            LogUtil.e(TAG, e.message)
        }

        try {
            setCameraParameters()
            mCamera.setDisplayOrientation(90)//竖屏显示
            mCamera.setPreviewDisplay(mHolder)
            mCamera.setPreviewCallback(previewCallback)
            mCamera.startPreview()
            mCamera.autoFocus(autoFocusCallback)
        } catch (e: Exception) {
            LogUtil.e("DBG", "Error starting camera preview: " + e.message)
        }

    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        LogUtil.e(TAG, "surfaceDestroyed")
        if (mCamera != null) {
            mCamera.setPreviewCallback(null)
            mCamera.release()
//            mCamera = null
        }
    }

    // 获取最佳的屏幕显示尺寸
    private fun getBestCameraResolution(parameters: Camera.Parameters, screenResolution: Point): Point {
        var tmp = 0f
        var mindiff = 100f
        val x_d_y = screenResolution.x.toFloat() / screenResolution.y.toFloat()
        var best: Camera.Size? = null
        val supportedPreviewSizes = parameters.supportedPreviewSizes
        for (s in supportedPreviewSizes) {
            tmp = Math.abs(s.height.toFloat() / s.width.toFloat() - x_d_y)
            if (tmp < mindiff) {
                mindiff = tmp
                best = s
            }
        }
        return Point(best!!.width, best.height)
    }

    private fun turnFlashLightOn() {
        try {
            if (packageManager.hasSystemFeature(
                    PackageManager.FEATURE_CAMERA_FLASH
                )
            ) {
                isFlashOn = true
                val p = mCamera.parameters
                p.flashMode = Camera.Parameters.FLASH_MODE_TORCH
                mCamera.parameters = p
            }
        } catch (e: Exception) {
            e.printStackTrace()
            LogUtil.e(TAG, e.message)
        }

    }

    private fun turnFlashLightOff() {
        try {
            if (packageManager.hasSystemFeature(
                    PackageManager.FEATURE_CAMERA_FLASH
                )
            ) {
                isFlashOn = false
                val p = mCamera.parameters
                p.flashMode = Camera.Parameters.FLASH_MODE_OFF
                mCamera.parameters = p
            }
        } catch (e: Exception) {
            e.printStackTrace()
            LogUtil.e(TAG, e.message)
        }

    }

    private fun setCameraParameters() {
        if (mCamera == null) return
        //        LogUtil.e(TAG, "ScanConfig.CURRENT_PPI=" + ScanConfig.CURRENT_PPI);
        //摄像头预览分辨率设置和图像放大参数设置，非必须，根据实际解码效果可取舍
        val parameters = mCamera.parameters

        val manager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val display = manager.defaultDisplay
        ScanConfig.BEST_RESOLUTION = getBestCameraResolution(parameters, Point(display.width, display.height))
        //        parameters.setPreviewSize(160, 120);

        parameters.set("orientation", "portrait")
        //        parameters.set("zoom", String.valueOf(27 / 10.0));//放大图像2.7倍
        mCamera.parameters = parameters
    }

    /**
     * 预览数据
     */
    private val previewCallback = Camera.PreviewCallback { data, camera ->
        if (isRUN.compareAndSet(false, true)) {
            val parameters = camera.parameters
            val size = parameters.previewSize//获取预览分辨率

            //创建解码图像，并转换为原始灰度数据，注意图片是被旋转了90度的
            val source = Image(size.width, size.height, "Y800")
            //图片旋转了90度，将扫描框的TOP作为left裁剪
            source.data = data//填充数据
            asyncDecode = AsyncDecode()
            asyncDecode.execute(source)//调用异步执行解码
        }
    }

    private inner class AsyncDecode : AsyncTask<Image, Void, ArrayList<HashMap<String, String>>>() {

        override fun doInBackground(vararg params: Image): ArrayList<HashMap<String, String>> {

            val result = ArrayList<HashMap<String, String>>()
            val src_data = params[0]//获取灰度数据
            //解码，返回值为0代表失败，>0表示成功
            val data = mImageScanner.scanImage(src_data)
            if (data != 0) {
                playBeepSoundAndVibrate()//解码成功播放提示音
                val syms = mImageScanner.results//获取解码结果
                for (sym in syms) {
                    val temp = HashMap<String, String>()
                    temp[ScanConfig.TYPE] = sym.symbolName
                    temp[ScanConfig.VALUE] = sym.result
                    result.add(temp)
                    if (!ScanConfig.IDENTIFY_MORE_CODE) {
                        break
                    }
                }
            }

            return result
        }

        override fun onPostExecute(result: ArrayList<HashMap<String, String>>) {
            super.onPostExecute(result)

            if (!result.isEmpty()) {
                LogUtil.e(TAG, "!result.isEmpty()")
                runOnUiThread { handleResult(result) }
            } else {
                isRUN.set(false)
            }
        }

    }

    private fun handleResult(result: ArrayList<HashMap<String, String>>) {
        LogUtil.e(TAG, result[0][ScanConfig.VALUE])
        val message = result[0][ScanConfig.VALUE]
        if (message != null) {
            try {
                val jsonObject = JSONObject(message)
                mAlias = jsonObject.getString("id")
                mKey = jsonObject.getString("key")
//                requestTerminalInfo(mAlias)
            } catch (e: JSONException) {
                Toast.makeText(this, R.string.error_parse_json, Toast.LENGTH_SHORT).show()
                LogUtil.e(TAG, e.message)
                e.printStackTrace()
                finish()
            }

        }
    }

    /**
     * 自动对焦回调
     */
    private val autoFocusCallback = Camera.AutoFocusCallback { success, camera ->
        if (mAutoFocusHandler != null) {
            mAutoFocusHandler.postDelayed(doAutoFocus, 1000)
        }
    }

    //自动对焦
    private val doAutoFocus = Runnable {
        if (mCamera == null) {
            return@Runnable
        }
//        mCamera.autoFocus(autoFocusCallback)
    }

    private val VIBRATE_DURATION = 200L

    private fun playBeepSoundAndVibrate() {
        if (ScanConfig.PLAY_VIBRATE) {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            vibrator.vibrate(VIBRATE_DURATION)
        }
    }
}
