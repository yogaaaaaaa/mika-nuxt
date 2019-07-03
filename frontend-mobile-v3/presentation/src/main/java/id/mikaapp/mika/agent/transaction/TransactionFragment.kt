package id.mikaapp.mika.agent.transaction


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
import android.widget.*
import com.timehop.stickyheadersrecyclerview.StickyRecyclerHeadersDecoration
import com.tsongkha.spinnerdatepicker.SpinnerDatePickerDialogBuilder
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.entities.HeaderTransaction
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.EndlessRecyclerViewScrollListener
import id.mikaapp.sdk.models.Transaction
import kotlinx.android.synthetic.main.fragment_transaction.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.util.*

/**
 * A simple [Fragment] subclass.
 *
 */
class TransactionFragment : Fragment(), View.OnClickListener {

    val imageLoader: ImageLoader by inject()
    val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    val viewModel: TransactionViewModel by viewModel()
    private lateinit var recyclerViewTransaction: RecyclerView
    private lateinit var recyclerViewAcquirer: RecyclerView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var transactionAdapter: TransactionAdapter
    private lateinit var transactionAcquirerAdapter: TransactionAcquirerAdapter
    private lateinit var layoutAcquirer: LinearLayout
    private lateinit var textViewTitle: TextView
    private lateinit var imgCalendar: ImageView
    private lateinit var dropDown: ImageView
    private lateinit var textViewSortAll: TextView
    private lateinit var textViewSortMonth: TextView
    private lateinit var textViewSortDate: TextView
    private lateinit var btnTitle: LinearLayout
    private lateinit var rlTransaction: RelativeLayout
    private lateinit var scrollListener: EndlessRecyclerViewScrollListener
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
    val TAG = TransactionFragment::class.java.simpleName
    var isLoadMore: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        viewModel = ViewModelProviders.of(this, factory).get(TransactionViewModel::class.java)

        if (savedInstanceState == null) {
            viewModel.getAcquirers()
            viewModel.getTransactions(page.toString(), PAGE_SIZE.toString(), ORDER, GET_COUNT)
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
        return layoutInflater.inflate(R.layout.fragment_transaction, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        bindView()

        transactionAdapter = TransactionAdapter(imageLoader) { transaction, view ->
            val intent = TransactionDetailActivity.newIntent(
                context!!, false, false, false, transaction.id
            )
            startActivity(intent)
        }
        recyclerViewTransaction.adapter = transactionAdapter
        val llm = LinearLayoutManager(context)
        recyclerViewTransaction.layoutManager = llm
        recyclerViewTransaction.addItemDecoration(StickyRecyclerHeadersDecoration(transactionAdapter))
        recyclerViewTransaction.addItemDecoration(
            DividerItemDecoration(
                activity!!,
                DividerItemDecoration.VERTICAL
            )
        )
        scrollListener = object : EndlessRecyclerViewScrollListener(20, llm) {
            override fun onLoadMore(currentPage: Int, totalItemsCount: Int, view: RecyclerView) {
                Log.d(TAG, "onLoadMore:$currentPage")
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
                textViewTitle.text = getString(R.string.all_transaction)
            } else {
                textViewTitle.text = "Transaksi ${acquirer.acquirerType.name}"
            }
            rlTipePembayaran.visibility = View.GONE
        }
        recyclerViewAcquirer.adapter = transactionAcquirerAdapter
        recyclerViewAcquirer.layoutManager = LinearLayoutManager(context)

        val calendar = Calendar.getInstance()
        month = calendar.get(Calendar.MONTH)
        year = calendar.get(Calendar.YEAR)
        day = calendar.get(Calendar.DAY_OF_MONTH)
        saveFilter(year, month, day)

        textViewSortAll.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))

        swipeRefreshLayout.setOnRefreshListener {
            isLoadMore = false
            getTransactions(page = 1)
        }
        rlTipePembayaran.visibility = View.GONE

    }

    override fun onClick(v: View?) {
        when (v) {
            btnTitle -> {
                showFilters()
            }
            textViewSortAll -> {
                isLoadMore = false
                viewModel.getTransactions("1", PAGE_SIZE.toString(), ORDER, GET_COUNT)
                startDate = ""
                endDate = ""
                rlTransaction.visibility = View.GONE
                dropDown.setImageDrawable(
                    ContextCompat.getDrawable(
                        context!!,
                        R.drawable.ic_arrow_drop_down_black_24dp
                    )
                )
                textViewTitle.text = getString(R.string.all_transaction)
                textViewSortAll.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))
                textViewSortDate.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                textViewSortMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
            }
            textViewSortMonth -> {
                showMonthPicker()
                rlTransaction.visibility = View.GONE
                dropDown.setImageDrawable(
                    ContextCompat.getDrawable(
                        context!!,
                        R.drawable.ic_arrow_drop_down_black_24dp
                    )
                )
            }
            textViewSortDate -> {
                showDayPicker()
                rlTransaction.visibility = View.GONE
                dropDown.setImageDrawable(
                    ContextCompat.getDrawable(
                        context!!,
                        R.drawable.ic_arrow_drop_down_black_24dp
                    )
                )
            }
            imgCalendar -> showAcquirers()
        }
    }

    private fun bindView(){
        textViewTitle = text_title
        recyclerViewTransaction = list_transaction
        layoutAcquirer = rlTipePembayaran
        swipeRefreshLayout = swipe_refresh
        recyclerViewAcquirer = rvAcquirer
        rlTransaction = rv2
        dropDown = drop_down
        textViewSortMonth = text_filter_by_month
        textViewSortAll = text_all_transaction
        textViewSortDate = text_filter_by_date
        btnTitle = btn_title
        imgCalendar = img_calendar
        btnTitle.setOnClickListener(this)
        imgCalendar.setOnClickListener(this)
        textViewSortMonth.setOnClickListener(this)
        textViewSortAll.setOnClickListener(this)
        textViewSortDate.setOnClickListener(this)
    }

    private fun handleViewState(state: TransactionViewState) {
        swipeRefreshLayout.isRefreshing = state.isLoading && !isLoadMore
        state.acquirers?.let {
            transactionAcquirerAdapter.setData(it)
        }
        state.transactionData?.let {
            val headerTransactions = processTotal(it)
            transactionAdapter.addData(it, headerTransactions)
        }
    }

    private fun processTotal(transactionList: List<Transaction>): List<HeaderTransaction> {
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
        if (acquirerFilterId == "") {
            viewModel.getTransactionsByFilters(
                page.toString(),
                PAGE_SIZE.toString(),
                startDate,
                endDate,
                "",
                ORDER,
                GET_COUNT
            )
        } else {
            viewModel.getTransactionsByFilters(
                page.toString(),
                PAGE_SIZE.toString(),
                startDate,
                endDate,
                acquirerFilterId.toString(),
                ORDER,
                GET_COUNT
            )
        }
    }

    private fun showAcquirers() {
        if (rlTipePembayaran.visibility == View.VISIBLE) {
            rlTipePembayaran.visibility = View.GONE
            rlTransaction.visibility = View.GONE
        } else {
            rlTipePembayaran.visibility = View.VISIBLE
            rlTransaction.visibility = View.GONE
        }
    }

    private fun showFilters() {
        if (rlTransaction.visibility == View.VISIBLE) {
            rlTransaction.visibility = View.GONE
            rlTipePembayaran.visibility = View.GONE
            dropDown.setImageDrawable(
                ContextCompat.getDrawable(
                    context!!,
                    R.drawable.ic_arrow_drop_down_black_24dp
                )
            )
        } else {
            rlTransaction.visibility = View.VISIBLE
            rlTipePembayaran.visibility = View.GONE
            dropDown.setImageDrawable(
                ContextCompat.getDrawable(
                    context!!,
                    R.drawable.ic_arrow_drop_up_black_24dp
                )
            )
        }
    }

    private fun loadFilter() {
        year = sharedPrefsLocalStorage.getIntPref("filterYear")!!
        month = sharedPrefsLocalStorage.getIntPref("filterMonth")!!
        day = sharedPrefsLocalStorage.getIntPref("filterDay")!!
    }

    private fun saveFilter(year: Int, month: Int, day: Int) {
        sharedPrefsLocalStorage.save("filterYear", year)
        sharedPrefsLocalStorage.save("filterMonth", month)
        sharedPrefsLocalStorage.save("filterDay", day)

        loadFilter()
    }

    private fun showDayPicker() {
        val nowMonth = Calendar.getInstance().get(Calendar.MONTH)
        val nowYear = Calendar.getInstance().get(Calendar.YEAR)
        val nowDay = Calendar.getInstance().get(Calendar.DAY_OF_MONTH)

        Locale.setDefault(Locale("id"))

        val dialog = SpinnerDatePickerDialogBuilder()
            .context(activity)
            .callback { view, year, month, day ->
                var month = month
                saveFilter(year, month, day)
                month += 1

                val dm = if (month > 10) "$year-$month-$day" else "$year-0$month-$day"
                startDate = dm + "T00:00:00.000Z"
                endDate = dm + "T24:00:00.000Z"

                isLoadMore = false
                getTransactions(page = 1)

                val strMonth = DateUtil.months[month - 1]

                textViewTitle.text = "$year-$strMonth-$day"
                textViewSortAll.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                textViewSortMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                textViewSortDate.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))
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
            .callback { view, year, month, day ->
                var month = month
                saveFilter(year, month, this@TransactionFragment.day)
                month += 1

                val yearMonth = if (month > 10) "$year-$month" else "$year-0$month"
                startDate = "$yearMonth-01T00:00:00.000Z"
                endDate = "$yearMonth-${day}T24:00:00.000Z"

                isLoadMore = false
                getTransactions(page = 1)

                val strMonth = DateUtil.months[month - 1]

                textViewTitle.text = "$strMonth-$year"
                textViewSortAll.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
                textViewSortMonth.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogHighlight))
                textViewSortDate.setBackgroundColor(ContextCompat.getColor(context!!, R.color.chooserDialogBg))
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
}
