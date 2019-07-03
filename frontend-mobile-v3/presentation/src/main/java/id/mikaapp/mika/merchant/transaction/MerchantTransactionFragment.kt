package id.mikaapp.mika.merchant.transaction


import android.annotation.SuppressLint
import androidx.lifecycle.Observer
import android.content.DialogInterface
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.timehop.stickyheadersrecyclerview.StickyRecyclerHeadersDecoration
import com.tsongkha.spinnerdatepicker.SpinnerDatePickerDialogBuilder
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.transaction.TransactionAcquirerAdapter
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.entities.HeaderTransaction
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.merchant.outlet.OutletActivity
import id.mikaapp.mika.merchant.outlet.OutletActivity.Companion.OUTLET_ID_PREF
import id.mikaapp.mika.merchant.outlet.OutletActivity.Companion.OUTLET_NAME_PREF
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.EndlessRecyclerViewScrollListener
import id.mikaapp.sdk.models.MerchantTransaction
import kotlinx.android.synthetic.main.fragment_transaction_merchant.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.util.*
import kotlin.collections.ArrayList

/**
 * A simple [Fragment] subclass.
 *
 */
class MerchantTransactionFragment : Fragment(), View.OnClickListener {

    private val imageLoader: ImageLoader by inject()
    private val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: MerchantTransactionViewModel by viewModel()
    private lateinit var recyclerViewTransaction: RecyclerView
    private lateinit var recyclerViewAcquirer: RecyclerView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var transactionAdapter: MerchantTransactionAdapter
    private lateinit var transactionAcquirerAdapter: TransactionAcquirerAdapter
    private lateinit var layoutAcquirer: LinearLayout
    private lateinit var scrollListener: EndlessRecyclerViewScrollListener
    private lateinit var btnAcquirer: TextView
    private lateinit var btnFilterDate: TextView
    private lateinit var pointerFilterDate: ImageView
    private lateinit var pointerAcquirer: ImageView
    private lateinit var filterDateLayout: LinearLayout
    private lateinit var acquirerLayout: LinearLayout
    private lateinit var btnFilterMonth: TextView
    private lateinit var btnFilterDay: TextView
    private lateinit var btnFilterCurrentMonth: TextView
    private lateinit var btnTitle: LinearLayout
    private var startDate = ""
    private var endDate = ""
    private var acquirerFilterId = ""
    private var page = 1
    private val PAGE_SIZE = 30
    private val ORDER = "desc"
    private val GET_COUNT = "0"
    private var day: Int = 0
    private var month: Int = 0
    private var year: Int = 0
    private var selectedOutletId = ""
    private val DAY = "day"
    private val MONTH = "month"
    private val YEAR = "year"
    val TAG = MerchantTransactionFragment::class.java.simpleName
    var isLoadMore: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sharedPrefsLocalStorage.getStringPref(OUTLET_ID_PREF)?.let {
            selectedOutletId = it
        }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if (throwable.message == getString(R.string.error_not_authenticated)) {
                    val homeIntent = Intent(activity, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    activity!!.finish()
                }
                if (throwable.message != "Entity Not found")
                    Toast.makeText(activity, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_transaction_merchant, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        bindView()
        transactionAdapter = MerchantTransactionAdapter(imageLoader) { transaction, view ->
            val intent = TransactionDetailActivity.newIntent(
                context!!, false, false, false, transaction.id
            )
            startActivity(intent)
        }
        recyclerViewTransaction.adapter = transactionAdapter
        val llm = LinearLayoutManager(context)
        val stickyHeaderDecor = StickyRecyclerHeadersDecoration(transactionAdapter)
        recyclerViewTransaction.layoutManager = llm
        recyclerViewTransaction.addItemDecoration(stickyHeaderDecor)
        recyclerViewTransaction.addItemDecoration(
            DividerItemDecoration(
                context,
                DividerItemDecoration.VERTICAL
            )
        )
        transactionAdapter.registerAdapterDataObserver(object : RecyclerView.AdapterDataObserver() {
            override fun onChanged() {
                super.onChanged()
                stickyHeaderDecor.invalidateHeaders()
            }
        })
        scrollListener = object : EndlessRecyclerViewScrollListener(20, llm) {
            override fun onLoadMore(currentPage: Int, totalItemsCount: Int, view: RecyclerView) {
                isLoadMore = true
                getTransactions(currentPage)
            }
        }
        recyclerViewTransaction.addOnScrollListener(scrollListener)

        transactionAcquirerAdapter = TransactionAcquirerAdapter(imageLoader) { acquirer, _ ->
            acquirerFilterId = acquirer.id
            isLoadMore = false
            getTransactions(page)

            if (acquirerFilterId == "") {
                btnAcquirer.text = getString(R.string.all_method)
            } else {
                btnAcquirer.text = acquirer.acquirerType.name
            }
            hideAcquirerFilter()
        }
        recyclerViewAcquirer.adapter = transactionAcquirerAdapter
        recyclerViewAcquirer.layoutManager = LinearLayoutManager(context)

        swipeRefreshLayout.setOnRefreshListener {
            isLoadMore = false
            getTransactions(page = 1)
        }

        sharedPrefsLocalStorage.getStringPref(OUTLET_NAME_PREF)?.let {
            text_title.text = it
        }

        if (savedInstanceState == null) {
            arguments?.let { bundle ->
                if (bundle.size() > 0) {
                    setBundleData(bundle)
                    val acquirerId = bundle.getString("acquirerId")
                    if (acquirerId.isNotEmpty()) {
                        acquirerFilterId = acquirerId
                    }
                    filterDate(
                        bundle.getString(DAY),
                        bundle.getString(MONTH),
                        bundle.getString(YEAR),
                        bundle.getString("timeGroup")
                    )
                    bundle.clear()
                } else {
                    acquirerFilterId = ""
                    getAllTransaction()
                }
            } ?: run {
                acquirerFilterId = ""
                getAllTransaction()
            }
        }
        viewModel.getAcquirers()
    }

    private fun bindView() {
        acquirerLayout = rlTipePembayaran
        filterDateLayout = rlPilihTanggal
        pointerFilterDate = pointerPilihTanggal
        pointerAcquirer = pointerTipePembayaran
        btnAcquirer = btnTipePembayaran
        btnFilterDate = btnPilihTanggal
        btnFilterMonth = btnBerdasarBulan
        btnFilterDay = btnBerdasarHari
        btnFilterCurrentMonth = btnBulanBerjalan
        btnTitle = btn_title
        swipeRefreshLayout = swipe_refresh
        recyclerViewTransaction = list_transaction
        layoutAcquirer = acquirerLayout
        swipeRefreshLayout = swipe_refresh
        recyclerViewAcquirer = rvAcquirer
        btnAcquirer.setOnClickListener(this)
        btnFilterDate.setOnClickListener(this)
        btnFilterMonth.setOnClickListener(this)
        btnFilterDay.setOnClickListener(this)
        btnFilterCurrentMonth.setOnClickListener(this)
        btnTitle.setOnClickListener(this)
    }
    override fun onResume() {
        super.onResume()
        sharedPrefsLocalStorage.getStringPref(OUTLET_NAME_PREF)?.let {
            text_title.text = it
        }
        sharedPrefsLocalStorage.getStringPref(OUTLET_ID_PREF)?.let { id ->
            if (selectedOutletId != id) {
                selectedOutletId = id
                getTransactions(page)
            }
        }
    }

    override fun onClick(v: View?) {
        when (v) {
            btnAcquirer -> {
                if (filterDateLayout.visibility == View.VISIBLE) {
                    hideDateFilter()
                }

                if (acquirerLayout.visibility == View.VISIBLE) {
                    hideAcquirerFilter()
                } else {
                    showAcquirerFilter()
                }
            }

            btnFilterDate -> {
                if (acquirerLayout.visibility == View.VISIBLE) {
                    hideAcquirerFilter()
                }

                if (rlPilihTanggal.visibility == View.VISIBLE) {
                    hideDateFilter()
                } else {
                    showDateFilter()
                }
            }

            btnFilterMonth -> {
                showMonthPicker()
            }

            btnFilterDay -> {
                showDayPicker()
            }

            btnFilterCurrentMonth -> {
                getCurrentMonth()
            }

            btnTitle -> {
                val intent = Intent(context, OutletActivity::class.java)
                startActivity(intent)
            }
        }
    }


    private fun handleViewState(state: MerchantTransactionViewState) {
        swipeRefreshLayout.isRefreshing = state.isLoading && !isLoadMore
        state.acquirers?.let { response ->
            transactionAcquirerAdapter.selectedId = acquirerFilterId
            if (acquirerFilterId == "") {
                btnAcquirer.text = getString(R.string.all_method)
            } else {
                for (acquirer in response) {
                    if (acquirer.id == acquirerFilterId) {
                        btnAcquirer.text = acquirer.acquirerType.name
                    }
                }
            }
            transactionAcquirerAdapter.setData(response)
        }
        state.transactionData?.let {
            val headerTransactions = processTotal(it)
            transactionAdapter.addData(it, headerTransactions)
        }
    }

    private fun showAcquirerFilter() {
        pointerTipePembayaran.visibility = View.VISIBLE
        rlTipePembayaran.visibility = View.VISIBLE
        acquirerLayout.visibility = View.VISIBLE
    }

    private fun hideAcquirerFilter() {
        pointerTipePembayaran.visibility = View.GONE
        rlTipePembayaran.visibility = View.GONE
        acquirerLayout.visibility = View.GONE
    }

    private fun showDateFilter() {
        pointerPilihTanggal.visibility = View.VISIBLE
        rlPilihTanggal.visibility = View.VISIBLE
        filterDateLayout.visibility = View.VISIBLE
    }

    private fun hideDateFilter() {
        pointerPilihTanggal.visibility = View.GONE
        rlPilihTanggal.visibility = View.GONE
        filterDateLayout.visibility = View.GONE
    }

    private fun processTotal(transactionList: List<MerchantTransaction>): List<HeaderTransaction> {
        val header = ArrayList<HeaderTransaction>()
        var date = ""
        var total = 0
        var entry = 0
        var index = -1

        for (transaction in transactionList) {
            if (DateUtil.getDate(transaction.createdAt) != date) {
                if (transaction.status == getString(R.string.success)) {
                    total = transaction.amount
                    entry = 1
                } else {
                    total = 0
                    entry = 0
                }
                date = DateUtil.getDate(transaction.createdAt)
                header.add(HeaderTransaction(date, total.toString(), entry))
                index++
            } else {
                if (transaction.status == getString(R.string.success)) {
                    entry += 1
                    total += transaction.amount
                    header[index].totalEntry = entry
                    header[index].totalAmount = total.toString()
                }
            }
        }

        return header
    }

    private fun getTransactions(page: Int) {
        Log.d(TAG, "start:$startDate,end:$endDate,id:$acquirerFilterId")
        if (page == 1) {
            transactionAdapter.clearData()
            scrollListener.resetState()
        }
        val acquirerId = if (acquirerFilterId == "") "" else acquirerFilterId.toString()
        val outletId = if (selectedOutletId == "") "" else selectedOutletId.toString()

        viewModel.getTransactions(
            page.toString(),
            PAGE_SIZE.toString(),
            startDate,
            endDate,
            acquirerId,
            ORDER,
            GET_COUNT,
            outletId
        )
    }

    private fun loadFilter() {
        year = sharedPrefsLocalStorage.getIntPref("merchantFilterYear")!!
        month = sharedPrefsLocalStorage.getIntPref("merchantFilterMonth")!!
        day = sharedPrefsLocalStorage.getIntPref("merchantFilterDay")!!
    }

    private fun saveFilter(year: Int, month: Int, day: Int) {
        sharedPrefsLocalStorage.save("merchantFilterYear", year)
        sharedPrefsLocalStorage.save("merchantFilterMonth", month)
        sharedPrefsLocalStorage.save("merchantFilterDay", day)

        loadFilter()
    }

    @SuppressLint("SetTextI18n")
    private fun showDayPicker() {
        val nowMonth = Calendar.getInstance().get(Calendar.MONTH)
        val nowYear = Calendar.getInstance().get(Calendar.YEAR)
        val nowDay = Calendar.getInstance().get(Calendar.DAY_OF_MONTH)

        Locale.setDefault(Locale("id"))

        val dialog = SpinnerDatePickerDialogBuilder()
            .context(activity)
            .callback { view, year, month, day ->
                saveFilter(year, month, day)

                val selectedMonth = month + 1
                filterDate(day.toString(), selectedMonth.toString(), year.toString(), DAY)
            }
            .showTitle(false)
            .showDaySpinner(true)
            .defaultDate(year, month, day)
            .spinnerTheme(R.style.MyDatePickerTheme)
            .maxDate(nowYear, nowMonth, nowDay)
            .minDate(2000, 0, 1)
            .build()

        dialog.show()

        dialog.getButton(DialogInterface.BUTTON_POSITIVE).text = getString(R.string.text_ok)
        dialog.getButton(DialogInterface.BUTTON_NEGATIVE).text = getString(R.string.text_batal)

    }

    private fun showMonthPicker() {
        val nowMonth = Calendar.getInstance().get(Calendar.MONTH)
        val nowYear = Calendar.getInstance().get(Calendar.YEAR)
        val nowDay = Calendar.getInstance().get(Calendar.DAY_OF_MONTH)

        Locale.setDefault(Locale("id"))

        val dialog = SpinnerDatePickerDialogBuilder()
            .context(activity)
            .callback { view, year, month, _ ->
                saveFilter(year, month, this@MerchantTransactionFragment.day)

                val selectedMonth = month + 1
                filterDate("", selectedMonth.toString(), year.toString(), MONTH)
            }
            .showTitle(false)
            .showDaySpinner(false)
            .spinnerTheme(R.style.MyDatePickerTheme)
            .defaultDate(year, month, day)
            .maxDate(nowYear, nowMonth, nowDay)
            .minDate(2000, 0, 1)
            .build()

        dialog.show()

        dialog.getButton(DialogInterface.BUTTON_POSITIVE).text = getString(R.string.text_ok)
        dialog.getButton(DialogInterface.BUTTON_NEGATIVE).text = getString(R.string.text_batal)
    }

    private fun getCurrentMonth() {
        val calendar = Calendar.getInstance()
        val month = calendar.get(Calendar.MONTH) + 1
        val year = calendar.get(Calendar.YEAR)

        filterDate("", month.toString(), year.toString(), MONTH)
    }

    private fun encodeTime(time: Int): String {

        return if (time >= 10) {
            time.toString()
        } else {
            "0$time"
        }
    }

    private fun filterDate(day: String, month: String, year: String, timeGroup: String) {
        when (timeGroup) {
            DAY -> {
                val yearMonthDay = if (month.toInt() > 10) "$year-$month-$day" else "$year-0$month-$day"
                startDate = yearMonthDay + "T00:00:00.000Z"
                endDate = yearMonthDay + "T24:00:00.000Z"

                val strMonth = DateUtil.months[(month.toInt() - 1)]
                btnFilterDate.text = "$day-$strMonth-$year"
                btnFilterCurrentMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                btnFilterMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                btnFilterDay.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))
                hideDateFilter()
            }

            MONTH -> {
                val calendar = Calendar.getInstance()
                calendar.set(year.toInt(), (month.toInt() - 1), day.toInt())
                val maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                val yearMonth = if (month.toInt() > 10) "$year-$month" else "$year-0$month"
                startDate = "$yearMonth-01T00:00:00.000Z"
                endDate = "$yearMonth-$maxDay" + "T24:00:00.000Z"

                val strMonth = DateUtil.months[(month.toInt() - 1)]
                btnFilterDate.text = "$strMonth-$year"
                btnFilterCurrentMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                btnFilterMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))
                btnFilterDay.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                hideDateFilter()
            }

            YEAR -> {
                val calendar = Calendar.getInstance()
                calendar.set(year.toInt(), 11, 1)
                val maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                startDate = "$year-01-01T00:00:00.000Z"
                endDate = "$year-12-$maxDay" + "T24:00:00.000Z"

                btnFilterDate.text = year
                hideDateFilter()
            }
        }

        isLoadMore = false
        getTransactions(page = 1)
    }

    private fun getAllTransaction() {
        val calendar = Calendar.getInstance()
        month = calendar.get(Calendar.MONTH) + 1
        year = calendar.get(Calendar.YEAR)
        day = calendar.get(Calendar.DAY_OF_MONTH)
        val hour = encodeTime(calendar.get(Calendar.HOUR_OF_DAY))
        val minute = encodeTime(calendar.get(Calendar.MINUTE))
        val second = encodeTime(calendar.get(Calendar.SECOND))
        val dm = if (month > 10) "$year-$month-$day" else "$year-0$month-$day"
        startDate = ""
        endDate = dm + "T$hour:$minute:$second.000Z"

        saveFilter(year, (month - 1), day)
        getTransactions(page)
    }

    private fun setBundleData(bundle: Bundle) {
        if (bundle.size() > 0) {
            val selectedDate: String
            val d = bundle.getString("day")
            val m = bundle.getString("month")
            val y = bundle.getString("year")
            val strMonth = DateUtil.months[m.toInt() - 1]
            selectedDate = if (d.isNotEmpty() && m.isNotEmpty()) {
                "$d-$strMonth-$y"
            } else if (d.isEmpty() && m.isNotEmpty()) {
                "$strMonth-$y"
            } else {
                y
            }
            btnFilterDate.text = selectedDate
        }
    }
}
