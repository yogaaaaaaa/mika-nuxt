package id.mikaapp.mika.merchant.dashboard


import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Intent
import android.graphics.Color
import android.graphics.Point
import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.PieEntry
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.merchant.home.DashboardHomeActivity
import id.mikaapp.mika.merchant.outlet.OutletActivity
import id.mikaapp.mika.merchant.outlet.OutletActivity.Companion.OUTLET_ID_PREF
import id.mikaapp.mika.merchant.outlet.OutletActivity.Companion.OUTLET_NAME_PREF
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.sdk.models.MerchantStatisticCount
import info.hoang8f.android.segmented.SegmentedGroup
import kotlinx.android.synthetic.main.fragment_dashboard.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


/**
 * A simple [Fragment] subclass.
 *
 */
class DashboardFragment : Fragment() {

    private val imageLoader: ImageLoader by inject()
    private val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: DashboardViewModel by viewModel()
    private lateinit var recyclerView: RecyclerView
    private lateinit var dashboardAdapter: DashboardAdapter
    private lateinit var btnTitle: LinearLayout
    private lateinit var segmentedGroup: SegmentedGroup
    private lateinit var layoutMenuTab: LinearLayout
    private lateinit var horizontalScrollView: HorizontalScrollView
    private val timeTransactions = ArrayList<DashboardTabModel>()
    private val dashboardModel = ArrayList<DashboardModel>()
    private lateinit var dialog: Dialog
    private var selectedTab: Int = 0
    private var selectedYear: String = ""
    private var selectedMonth: String = ""
    private var selectedDay: String = ""
    private val DAY = "day"
    private val MONTH = "month"
    private val YEAR = "year"
    private var timeGroup = DAY
    private var selectedOutletId = ""
    private val GROUP = "createdAt"
    private var BUTTON_WIDTH = 140f
    private var startDate = ""
    private var endDate = ""

    companion object {
        var TYPE_HEADER = 0
        var TYPE_PAYMENT_METHOD = 1
        var TYPE_LINE_CHART = 2
        var TYPE_PIE_CHART = 3
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                hideDialog(dialog)
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
        return inflater.inflate(R.layout.fragment_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        bindView()

        sharedPrefsLocalStorage.getStringPref(OUTLET_NAME_PREF)?.let {
            text_title.text = it
        }
        sharedPrefsLocalStorage.getStringPref(OUTLET_ID_PREF)?.let {
            selectedOutletId = it
        }

        if (savedInstanceState == null) {
            val (start: String, end: String) = getFilterOfCurrentMonth()
            getMerchantStatisticByTimeCount(start, end)
        }

        dashboardAdapter = DashboardAdapter(imageLoader) { data, view, id ->
            val dashboardHomeActivity = activity as DashboardHomeActivity
            dashboardHomeActivity.showTransactions(data.year, data.month, data.day, id, timeGroup)
        }
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.addItemDecoration(
            DividerItemDecoration(
                context,
                DividerItemDecoration.VERTICAL
            )
        )
        recyclerView.adapter = dashboardAdapter
    }

    override fun onResume() {
        super.onResume()
        sharedPrefsLocalStorage.getStringPref(OUTLET_NAME_PREF)?.let {
            text_title.text = it
        }
        sharedPrefsLocalStorage.getStringPref(OUTLET_ID_PREF)?.let { id ->
            if (selectedOutletId != id) {
                selectedOutletId = id
                if (timeGroup == DAY) {
                    val (start: String, end: String) = getFilterOfCurrentMonth()
                    getMerchantStatisticByTimeCount(start, end)
                } else {
                    getMerchantStatisticByTimeCount("", "")
                }
            }
        }
    }

    private fun bindView() {
        dialog = CustomDialog.progressDialog(context!!, getString(R.string.loading))
        recyclerView = recycler_dashboard
        btnTitle = btn_title
        segmentedGroup = segmented2
        layoutMenuTab = layout_menu_tab
        horizontalScrollView = horizontal_bar
        btnTitle.setOnClickListener {
            val intent = Intent(context, OutletActivity::class.java)
            startActivity(intent)
        }

        segmentedGroup.setOnCheckedChangeListener { _, viewId ->
            when (viewId) {
                R.id.rbDate -> {
                    val (start: String, end: String) = getFilterOfCurrentMonth()
                    timeGroup = DAY
                    selectedTab = 0
                    getMerchantStatisticByTimeCount(start, end)
                }
                R.id.rbMonth -> {
                    timeGroup = MONTH
                    selectedTab = 0
                    getMerchantStatisticByTimeCount("", "")
                }
                R.id.rbYear -> {
                    timeGroup = YEAR
                    selectedTab = 0
                    getMerchantStatisticByTimeCount("", "")
                }
            }
        }
    }

    private fun handleViewState(state: DashboardViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        }
        state.transactionCount?.let { response ->
            if (response.size > 0) {
                setButtonTabData(response)
                scrollToCurrent(response.size)
            } else {
                hideDialog(dialog)
            }
        }

        state.transactionAcquirer?.let { response ->
            if (response.size > 0) {
                label_no_data.visibility = View.GONE
                recyclerView.visibility = View.VISIBLE
                dashboardModel.clear()
                val acquirersData = ArrayList<DashboardModel>()
                val headerData =
                    DashboardModel(
                        type = TYPE_HEADER,
                        year = selectedYear,
                        month = selectedMonth,
                        day = selectedDay,
                        timeGroup = timeGroup
                    )
                val pieChartData =
                    DashboardModel(type = TYPE_PIE_CHART)

                for (i in response.indices) {
                    val data = response[i]
                    headerData.totalIncome += data.amount
                    headerData.totalNett += data.nettAmount.toInt()
                    headerData.totalTransaction += data.transactionCount

                    if (i % 2 == 0) {
                        val acquirerData = if (i == 0) {
                            DashboardModel(
                                type = TYPE_PAYMENT_METHOD,
                                year = selectedYear,
                                month = selectedMonth,
                                day = selectedDay,
                                timeGroup = timeGroup
                            )
                        } else {
                            DashboardModel(
                                type = TYPE_PAYMENT_METHOD,
                                isShowTitle = false,
                                year = selectedYear,
                                month = selectedMonth,
                                day = selectedDay,
                                timeGroup = timeGroup
                            )
                        }
                        acquirerData.paymentMethods.add(data)
                        val nextIdx = i + 1
                        if (nextIdx < response.size) {
                            acquirerData.paymentMethods.add(response[nextIdx])
                        }
                        acquirersData.add(acquirerData)
                    }
                    pieChartData.colors.add(Color.parseColor(data.acquirer.acquirerType.chartColor))
                    val pieEntry = PieEntry(
                        data.nettAmount.toFloat(),
                        data.acquirer.name + " " + NumberUtil.formatCurrency(data.amount.toDouble())
                    )
                    pieChartData.pieEntries.add(pieEntry)
                    pieChartData.paymentMethods.add(data)
                }
                dashboardModel.add(headerData)
                for (acquirerData in acquirersData) {
                    dashboardModel.add(acquirerData)
                }
                dashboardModel.add(pieChartData)

                getLineChartData(startDate, endDate)
            } else {
                recyclerView.visibility = View.GONE
                label_no_data.visibility = View.VISIBLE
                hideDialog(dialog)
            }
        }

        state.lineChartData?.let { response ->
            if (response.size > 0) {
                val lineChartData = DashboardModel(type = TYPE_LINE_CHART)
                val firstData = response.last()
                lineChartData.maxY = firstData.transactionCount.toLong()
                lineChartData.minY = firstData.transactionCount.toLong()
                var date = DateUtil.utcToLocal(firstData.createdAt)
                var month = date.substring(5, 7).toInt()
                var day = date.substring(8, 10).toInt()
                var hour = date.substring(11, 13).toInt()
                when (timeGroup) {
                    DAY -> {
                        lineChartData.title = "Jumlah Transaksi per Jam"
                        for (i in 0..23) {
                            lineChartData.lineEntries.add(Entry(i.toFloat(), 0F))
                        }
                    }

                    MONTH -> {
                        lineChartData.title = "Jumlah Transaksi per Hari"
                        for (i in 1..31) {
                            lineChartData.lineEntries.add(Entry(i.toFloat(), 0F))
                        }
                    }

                    YEAR -> {
                        lineChartData.title = "Jumlah Transaksi per Bulan"
                        for (i in 1..12) {
                            lineChartData.lineEntries.add(Entry(i.toFloat(), 0F))
                        }
                    }
                }
                for (i in response.size downTo 1) {
                    val idx = i - 1
                    val data = response[idx]
                    date = DateUtil.utcToLocal(data.createdAt)
                    val currentMonth = date.substring(5, 7).toInt()
                    val currentDay = date.substring(8, 10).toInt()
                    val currentHour = date.substring(11, 13).toInt()

                    when (timeGroup) {
                        DAY -> {
                            if (i == response.size || hour != currentHour) {
                                hour = currentHour
                                lineChartData.lineEntries[hour].y = data.transactionCount.toFloat()

                                if (data.transactionCount >= lineChartData.maxY) {
                                    lineChartData.maxY = data.transactionCount.toLong()
                                    lineChartData.maxTime = "Jam Terbanyak: $hour"
                                }
                                if (data.transactionCount <= lineChartData.minY) {
                                    lineChartData.minY = data.transactionCount.toLong()
                                }
                            }
                        }

                        MONTH -> {
                            if (i == response.size || day != currentDay) {
                                day = currentDay
                                lineChartData.lineEntries[day - 1].y = data.transactionCount.toFloat()

                                if (data.transactionCount >= lineChartData.maxY) {
                                    lineChartData.maxY = data.transactionCount.toLong()
                                    lineChartData.maxTime = "Hari Terbanyak: $day"
                                }
                                if (data.transactionCount <= lineChartData.minY) {
                                    lineChartData.minY = data.transactionCount.toLong()
                                }
                            }

                        }

                        YEAR -> {
                            if (i == response.size || month != currentMonth) {
                                month = currentMonth
                                lineChartData.lineEntries[month - 1].y = data.transactionCount.toFloat()

                                if (data.transactionCount >= lineChartData.maxY) {
                                    lineChartData.maxY = data.transactionCount.toLong()
                                    lineChartData.maxTime = "Bulan Terbanyak: $month"
                                }
                                if (data.transactionCount <= lineChartData.minY) {
                                    lineChartData.minY = data.transactionCount.toLong()
                                }
                            }
                        }
                    }
                }
                dashboardModel.add(lineChartData)
                dashboardAdapter.setData(dashboardModel)
                hideDialog(dialog)
            }
        }
    }

    private fun setButtonTabData(data: ArrayList<MerchantStatisticCount>) {
        for (i in data.size downTo 1) {

            val idx = i - 1
            val item = data[idx]
            val date = DateUtil.utcToLocal(item.createdAt)
            val year = date.substring(0, 4)
            val month = date.substring(5, 7).toInt()
            val day = date.substring(8, 10)
            val calendar = Calendar.getInstance()
            val m = month - 1
            val monthString = DateUtil.months[m]

            val itemView =
                LayoutInflater.from(context).inflate(R.layout.layout_tab_button, null, false) as LinearLayout
            val labelBottom = itemView.findViewById<TextView>(R.id.label_bottom)
            val labelTop = itemView.findViewById<TextView>(R.id.label_top)
            val viewUnder = itemView.findViewById<View>(R.id.view_under)
            labelTop.setTextColor(ContextCompat.getColor(context!!, R.color.lightGrey))
            labelBottom.setTextColor(ContextCompat.getColor(context!!, R.color.lightGrey))

            when (timeGroup) {
                DAY -> {
                    itemView.setOnClickListener {
                        selectedDay = day
                        selectedMonth = month.toString()
                        selectedYear = year
                        val yearMonthDay = if (month > 10) "$year-$month-$day" else "$year-0$month-$day"
                        startDate = yearMonthDay + "T00:00:00.000Z"
                        endDate = yearMonthDay + "T24:00:00.000Z"
                        getMerchantStatisticByAcquirer()

                        val position = data.size - i
                        changeTabColor(position)
                    }
                    labelTop.text = monthString
                    labelBottom.text = day
                    val tabModel =
                        DashboardTabModel(itemView, labelTop, labelBottom, viewUnder, year, monthString, day)
                    timeTransactions.add(tabModel)
                    layoutMenuTab.addView(itemView)
                }

                MONTH -> {
                    itemView.setOnClickListener {
                        selectedMonth = month.toString()
                        selectedYear = year
                        calendar.set(year.toInt(), m, day.toInt())
                        val maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                        val yearMonth = if (month > 10) "$year-$month" else "$year-0$month"
                        startDate = "$yearMonth-01T00:00:00.000Z"
                        endDate = "$yearMonth-$maxDay" + "T24:00:00.000Z"
                        getMerchantStatisticByAcquirer()

                        val position = data.size - i
                        changeTabColor(position)
                    }
                    labelTop.text = year
                    labelBottom.text = monthString
                    val tabModel =
                        DashboardTabModel(itemView, labelTop, labelBottom, viewUnder, year, monthString, day)
                    timeTransactions.add(tabModel)
                    layoutMenuTab.addView(itemView)
                }

                YEAR -> {
                    selectedYear = year
                    calendar.set(year.toInt(), 11, day.toInt())
                    val maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                    itemView.setOnClickListener {
                        startDate = "$year-01-01T00:00:00.000Z"
                        endDate = "$year-12-$maxDay" + "T24:00:00.000Z"
                        getMerchantStatisticByAcquirer()

                        val position = data.size - i
                        changeTabColor(position)
                    }
                    labelTop.text = year
                    val tabModel =
                        DashboardTabModel(itemView, labelTop, labelBottom, viewUnder, year, monthString, day)
                    timeTransactions.add(tabModel)
                    layoutMenuTab.addView(tabModel.container)
                }
            }

        }
        selectedTab = data.size - 1
        timeTransactions[selectedTab].container.callOnClick()
        changeTabColor(selectedTab)
    }

    private fun getMerchantStatisticByAcquirer() {
        val outletId = if (selectedOutletId == "") "" else selectedOutletId.toString()
        viewModel.getMerchantStatisticByAcquirer(startDate, endDate, outletId)
    }

    private fun getMerchantStatisticByTimeCount(startDate: String, endDate: String) {
        val outletId = if (selectedOutletId == "") "" else selectedOutletId.toString()
        timeTransactions.clear()
        layoutMenuTab.removeAllViews()
        dashboardModel.clear()
        viewModel.getMerchantStatisticByTimeCount(GROUP, timeGroup, getTimeOffset(), outletId, startDate, endDate)
    }

    private fun getLineChartData(startDate: String, endDate: String) {
        val outletId = if (selectedOutletId == "") "" else selectedOutletId.toString()
        var tGroup = ""
        when (timeGroup) {
            DAY -> {
                tGroup = "hour"
            }

            MONTH -> {
                tGroup = DAY
            }
            YEAR -> {
                tGroup = MONTH
            }
        }

        viewModel.getLineChartData(startDate, endDate, GROUP, tGroup, getTimeOffset(), outletId)
    }

    private fun getTimeOffset(): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"), Locale.getDefault())
        val currentLocalTime = calendar.time
        val date = SimpleDateFormat("Z", Locale.getDefault())

        return date.format(currentLocalTime)
    }

    private fun changeTabColor(position: Int) {
        if (selectedTab != position) {
            timeTransactions[position].labelTop.setTextColor(ContextCompat.getColor(context!!, R.color.colorAccent))
            timeTransactions[position].labelBottom.setTextColor(ContextCompat.getColor(context!!, R.color.colorAccent))
            timeTransactions[position].viewUnder.visibility = View.VISIBLE
            timeTransactions[selectedTab].labelTop.setTextColor(ContextCompat.getColor(context!!, R.color.lightGrey))
            timeTransactions[selectedTab].labelBottom.setTextColor(ContextCompat.getColor(context!!, R.color.lightGrey))
            timeTransactions[selectedTab].viewUnder.visibility = View.GONE
            selectedTab = position
        } else {
            timeTransactions[position].labelTop.setTextColor(ContextCompat.getColor(context!!, R.color.colorAccent))
            timeTransactions[position].labelBottom.setTextColor(ContextCompat.getColor(context!!, R.color.colorAccent))
            timeTransactions[position].viewUnder.visibility = View.VISIBLE
        }
    }

    private fun scrollToCurrent(current: Int) {
        horizontalScrollView.post {
            val display = activity!!.windowManager.defaultDisplay
            val size = Point()
            display.getSize(size)
            val screenWidth = size.x

            val buttonX = (BUTTON_WIDTH * current - screenWidth / 2 + BUTTON_WIDTH / 2).toInt()
            horizontalScrollView.smoothScrollTo(buttonX, 0)
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

    private fun getFilterOfCurrentMonth(): Pair<String, String> {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        var month = calendar.get(Calendar.MONTH)
        val yearMonthEnd = if (month > 10) "$year-$month" else "$year-0$month"
        month -= 1
        val yearMonthStart = if (month > 10) "$year-$month" else "$year-0$month"
        val day = calendar.get(Calendar.DAY_OF_MONTH)
        val sDate = "$yearMonthStart-${day}T00:00:00.000Z"
        val eDate = "$yearMonthEnd-${day}T24:00:00.000Z"

        return sDate to eDate
    }
}
