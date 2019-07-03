package id.mikaapp.mika.merchant.outlet

import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.appcompat.widget.Toolbar
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.EndlessRecyclerViewScrollListener
import kotlinx.android.synthetic.main.activity_outlet.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel

class OutletActivity : AppCompatActivity(), View.OnClickListener {

    private val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: OutletViewModel by viewModel()
    private lateinit var dialog: Dialog
    private lateinit var toolbar: Toolbar
    private lateinit var searchOutletName: EditText
    private lateinit var btnSearch: ImageView
    private lateinit var recyclerView: RecyclerView
    private lateinit var outletAdapter: OutletAdapter
    private lateinit var scrollListener: EndlessRecyclerViewScrollListener
    private var selectedOutletId = ""
    var page = 1
    private val PAGE_SIZE = 30
    var isLoadMore: Boolean = false

    companion object {
        const val OUTLET_ID_PREF = "selected_outlet_id"
        const val OUTLET_NAME_PREF = "selected_outlet_name"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_outlet)

        bindView()

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        supportActionBar!!.setDisplayShowHomeEnabled(true)

        sharedPrefsLocalStorage.getStringPref(OUTLET_ID_PREF)?.let {
            selectedOutletId = it
        }

        outletAdapter = OutletAdapter(selectedOutletId) { outlet, view ->
            sharedPrefsLocalStorage.save(OUTLET_ID_PREF, outlet.id)
            sharedPrefsLocalStorage.save(OUTLET_NAME_PREF, outlet.name)
            outletAdapter.selectedId = outlet.id
            outletAdapter.notifyDataSetChanged()
            finish()
        }

        val llm = LinearLayoutManager(this)
        scrollListener = object : EndlessRecyclerViewScrollListener(20, llm) {
            override fun onLoadMore(currentPage: Int, totalItemsCount: Int, view: RecyclerView) {
                isLoadMore = true
                viewModel.getOutlets(currentPage.toString(), PAGE_SIZE.toString(), searchOutletName.text.toString())
            }
        }
        recyclerView.layoutManager = llm
        recyclerView.adapter = outletAdapter
        recyclerView.addOnScrollListener(scrollListener)

        if (savedInstanceState == null) {
            viewModel.getOutlets(page.toString(), PAGE_SIZE.toString(), searchOutletName.text.toString())
        }

        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if (throwable.message == getString(R.string.error_not_authenticated)) {
                    val homeIntent = Intent(this, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    finish()
                }
                if (throwable.message != "Entity Not found")
                    Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return super.onSupportNavigateUp()
    }

    override fun onClick(v: View?) {
        when (v) {
            btnSearch -> {
                isLoadMore = false
                viewModel.getOutlets(page.toString(), PAGE_SIZE.toString(), searchOutletName.text.toString())
                val keyboard = currentFocus
                if (keyboard != null) {
                    val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                    imm.hideSoftInputFromWindow(keyboard.windowToken, 0)
                }
            }
        }
    }

    private fun bindView() {
        toolbar = toolbar_outlet
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
        recyclerView = recycer_view_outlet
        searchOutletName = edit_search
        btnSearch = btn_search
        btnSearch.setOnClickListener(this)
        searchOutletName.imeOptions = EditorInfo.IME_ACTION_SEARCH
        searchOutletName.setOnEditorActionListener(object : TextView.OnEditorActionListener {
            override fun onEditorAction(v: TextView?, actionId: Int, p2: KeyEvent?): Boolean {
                if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                    viewModel.getOutlets(page.toString(), PAGE_SIZE.toString(), searchOutletName.text.toString())
                    val keyboard = currentFocus
                    if (keyboard != null) {
                        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                        imm.hideSoftInputFromWindow(keyboard.windowToken, 0)
                    }
                    return true
                }
                return false
            }

        })
    }

    private fun handleViewState(state: OutletViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            Handler().postDelayed({
                hideDialog(dialog)
            }, 500)
        }

        state.outlets?.let {
            outletAdapter.setData(it)
        }
    }

    private fun showDialog(dialog: Dialog) {
        if (!dialog.isShowing) {
            dialog.show()
        }
    }

    private fun hideDialog(dialog: Dialog) {
        if (dialog.isShowing) {
            dialog.dismiss()
        }
    }
}
