package id.mikaapp.mika.agent.acquirer

import android.app.Dialog
import androidx.lifecycle.Observer
import android.os.Bundle
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.view.KeyEvent
import android.view.View
import android.widget.ImageButton
import android.widget.Toast
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.common.App
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.login.LoginActivity.Companion.ACQUIRER_CACHE
import id.mikaapp.sdk.models.Acquirer
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel

/**
 * Created by grahamdesmon on 18/04/19.
 */

class AcquirerFragment : BottomSheetDialogFragment() {
    private lateinit var behavior: BottomSheetBehavior<View>
    private lateinit var btnClose: ImageButton
    val imageLoader: ImageLoader by inject()
    val viewModel: AcquirerViewModel by viewModel()
    val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private lateinit var recyclerView: RecyclerView
    private lateinit var acquirerAdapter: AcquirerAdapter
    private lateinit var acquirers: ArrayList<Acquirer>
    private var callback: OnAcquirerSelected? = null

    interface OnAcquirerSelected {
        fun onSelected(acquirer: Acquirer)
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState) as BottomSheetDialog

        dialog.setCancelable(false)
        val view = View.inflate(context, R.layout.fragment_bottomsheet_payment_provider, null)

        dialog.setContentView(view)
        dialog.setOnKeyListener { arg0, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                dialog.dismiss()
            }
            true
        }
        behavior = BottomSheetBehavior.from(view.parent as View)
        behavior.setBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {

                if (BottomSheetBehavior.STATE_HIDDEN == newState) {
                    dismiss()
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {

            }
        })

        btnClose = view.findViewById(R.id.btn_close)
        btnClose.setOnClickListener { dismiss() }
        recyclerView = view.findViewById(R.id.recyclerView_acquirer)

        acquirerAdapter = AcquirerAdapter(
            imageLoader
        ) { acquirer, view ->
            callback?.onSelected(acquirer)
        }

        recyclerView.layoutManager = GridLayoutManager(context, 3)
        recyclerView.adapter = acquirerAdapter

        observeViewState()
        if (savedInstanceState == null) {
            loadAcquirer()
            viewModel.getAcquirers()
        }

        return dialog
    }

    override fun onStart() {
        super.onStart()
        behavior.state = BottomSheetBehavior.STATE_COLLAPSED
    }

    fun setOnAcquirerSelected(listener: OnAcquirerSelected) {
        callback = listener
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                Toast.makeText(activity, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleViewState(state: AcquirerViewState) {
        state.acquirers?.let {
            if (it.size != acquirers.size) {
                saveAcquirer(it)
                acquirerAdapter.clearData()
                acquirerAdapter.setData(it)
            }
        }
    }

    private fun saveAcquirer(data: ArrayList<Acquirer>) {
        val gson = Gson()
        val acquirersJson = gson.toJson(data)

        sharedPrefsLocalStorage.save(ACQUIRER_CACHE, acquirersJson)
    }

    private fun loadAcquirer() {
        val acquirerJson = sharedPrefsLocalStorage.getStringPref(ACQUIRER_CACHE)
        val listType = object : TypeToken<ArrayList<Acquirer>>() {}.type
        acquirers = Gson().fromJson(
            acquirerJson,
            listType
        )

        acquirerAdapter.setData(acquirers)
    }
}