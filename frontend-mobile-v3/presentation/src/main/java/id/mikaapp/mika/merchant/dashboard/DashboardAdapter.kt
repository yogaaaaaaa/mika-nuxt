package id.mikaapp.mika.merchant.dashboard

import android.annotation.SuppressLint
import android.graphics.Color
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.github.mikephil.charting.components.AxisBase
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.formatter.IAxisValueFormatter
import com.github.mikephil.charting.formatter.IValueFormatter
import com.github.mikephil.charting.utils.MPPointF
import com.github.mikephil.charting.utils.ViewPortHandler
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.merchant.dashboard.DashboardFragment.Companion.TYPE_HEADER
import id.mikaapp.mika.merchant.dashboard.DashboardFragment.Companion.TYPE_PAYMENT_METHOD
import id.mikaapp.mika.merchant.dashboard.DashboardFragment.Companion.TYPE_PIE_CHART
import id.mikaapp.mika.utils.NumberUtil
import kotlinx.android.synthetic.main.item_dashboard_acquirer.view.*
import kotlinx.android.synthetic.main.item_dashboard_header.view.*
import kotlinx.android.synthetic.main.item_dashboard_line_chart.view.*
import kotlinx.android.synthetic.main.item_dashboard_pie_chart.view.*
import kotlinx.android.synthetic.main.layout_legend.view.*
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols

class DashboardAdapter(
    private val imageLoader: ImageLoader,
    private val onClickViewTransaction: (DashboardModel, View, String) -> Unit
) :
    RecyclerView.Adapter<DashboardAdapter.DashboardViewHolder>() {

    private var dashboardData: MutableList<DashboardModel> = mutableListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DashboardViewHolder {
        return when (viewType) {
            TYPE_HEADER -> {
                val view = LayoutInflater.from(parent.context).inflate(R.layout.item_dashboard_header, parent, false)
                DashboardHeaderVH(view)
            }
            TYPE_PAYMENT_METHOD -> {
                val view = LayoutInflater.from(parent.context).inflate(R.layout.item_dashboard_acquirer, parent, false)
                DashboardAcquirerVH(view)
            }
            TYPE_PIE_CHART -> {
                val view = LayoutInflater.from(parent.context).inflate(R.layout.item_dashboard_pie_chart, parent, false)
                DashboardPieChartVH(view)
            }
            else -> {
                val view =
                    LayoutInflater.from(parent.context).inflate(R.layout.item_dashboard_line_chart, parent, false)
                DashboardLineChartVH(view)
            }
        }

    }

    override fun getItemCount(): Int {
        return dashboardData.size
    }

    override fun getItemViewType(position: Int): Int {
        return dashboardData[position].type
    }

    override fun onBindViewHolder(holder: DashboardViewHolder, position: Int) {
        holder.bind(imageLoader, dashboardData[position], onClickViewTransaction)
    }

    fun setData(data: ArrayList<DashboardModel>) {
        dashboardData.clear()
        dashboardData.addAll(data)
        notifyDataSetChanged()
    }


    abstract class DashboardViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        abstract fun bind(
            imageLoader: ImageLoader,
            data: DashboardModel,
            listener: (DashboardModel, View, String) -> Unit
        )
    }

    class DashboardHeaderVH(itemView: View) : DashboardViewHolder(itemView) {
        override fun bind(
            imageLoader: ImageLoader,
            data: DashboardModel,
            listener: (DashboardModel, View, String) -> Unit
        ) =
            with(itemView) {
                itemView.label_total_income_value.text = NumberUtil.formatCurrency(data.totalIncome.toDouble())
                itemView.label_total_transaction_value.text = data.totalTransaction.toString()
                itemView.label_total_nett_value.text = NumberUtil.formatCurrency(data.totalNett)
                itemView.layout_total_transaction.setOnClickListener {
                    listener(data, itemView.layout_total_transaction, "0")
                }
            }

    }

    class DashboardAcquirerVH(itemView: View) : DashboardViewHolder(itemView) {
        private val previxUrl = BuildConfig.BASE_URL + "/thumbnails/"
        override fun bind(
            imageLoader: ImageLoader,
            data: DashboardModel,
            listener: (DashboardModel, View, String) -> Unit
        ) =
            with(itemView) {
                itemView.label_payment_method.visibility = if (data.isShowTitle) {
                    View.VISIBLE
                } else {
                    View.GONE
                }
                val acquirer1 = data.paymentMethods[0]
                itemView.label_total_income_value_1.text = NumberUtil.formatCurrency(acquirer1.amount.toDouble())
                itemView.label_total_transaction_value_1.text = acquirer1.transactionCount.toString()
                itemView.label_view_transaction_1.visibility =
                    if (acquirer1.transactionCount > 0) View.VISIBLE else View.INVISIBLE
                acquirer1.acquirer.acquirerType.thumbnail?.let {
                    imageLoader.load(
                        previxUrl + it,
                        itemView.img_method_1
                    )
                }
                itemView.label_view_transaction_1.setOnClickListener {
                    data.acquirerId = acquirer1.acquirerId.toString()
                    listener(
                        data,
                        itemView.label_view_transaction_1,
                        acquirer1.acquirerId.toString()
                    )
                }

                if (data.paymentMethods.size > 1) {
                    data.paymentMethods[1]?.let {
                        val acquirer2 = data.paymentMethods[1]
                        itemView.layout_method_2.visibility = View.VISIBLE
                        itemView.label_total_income_value_2.text =
                            NumberUtil.formatCurrency(acquirer2.amount.toDouble())
                        itemView.label_total_transaction_value_2.text = acquirer2.transactionCount.toString()
                        itemView.label_view_transaction_2.visibility =
                            if (acquirer1.transactionCount > 0) View.VISIBLE else View.INVISIBLE
                        acquirer2.acquirer.acquirerType.thumbnail?.let {
                            imageLoader.load(
                                previxUrl + it,
                                itemView.img_method_2
                            )
                        }
                        itemView.label_view_transaction_2.setOnClickListener {
                            data.acquirerId = acquirer2.acquirerId.toString()
                            listener(
                                data,
                                itemView.label_view_transaction_2,
                                acquirer2.acquirerId.toString()
                            )
                        }
                    }
                } else {
                    itemView.layout_method_2.visibility = View.INVISIBLE
                }
            }

    }

    class DashboardLineChartVH(itemView: View) : DashboardViewHolder(itemView) {
        override fun bind(
            imageLoader: ImageLoader,
            data: DashboardModel,
            listener: (DashboardModel, View, String) -> Unit
        ) =
            with(itemView) {
                itemView.bar_loading.visibility = View.GONE
                val dataSet1 = LineDataSet(data.lineEntries, "Penghasilan")
                dataSet1.lineWidth = 2f
                dataSet1.setDrawCircles(false)
                dataSet1.valueTextSize = 8f
                dataSet1.color = ContextCompat.getColor(itemView.context, R.color.colorAccent)

                val lineData = LineData(dataSet1)
                lineData.setDrawValues(false)
                itemView.line_chart.axisLeft.valueFormatter =
                    IAxisValueFormatter { value, _ -> DecimalFormat("#").format(value.toLong()) }

                itemView.line_chart.data = lineData
                itemView.line_chart.axisLeft.setDrawGridLines(false)
                itemView.line_chart.xAxis.setDrawGridLines(false)
                itemView.line_chart.xAxis.textSize = 8f
                itemView.line_chart.axisLeft.textSize = 8f

                itemView.line_chart.axisRight.setDrawGridLines(false)
                itemView.line_chart.axisRight.setDrawLabels(false)
                itemView.line_chart.axisRight.setDrawAxisLine(false)
                itemView.line_chart.description.isEnabled = false
                itemView.line_chart.legend.isEnabled = false
                itemView.line_chart.xAxis.position = XAxis.XAxisPosition.BOTTOM

                var count = 10
                if (data.maxY - data.minY < 10) {
                    count = (data.maxY - data.minY).toInt()
                }
                itemView.line_chart.axisLeft.setLabelCount(count, true)
                itemView.line_chart.invalidate()

                itemView.line_chart.setTouchEnabled(false)

                itemView.label_max_value.text = data.maxTime
                itemView.text_title.text = data.title
            }

    }

    class DashboardPieChartVH(itemView: View) : DashboardViewHolder(itemView) {
        @SuppressLint("SetTextI18n")
        override fun bind(
            imageLoader: ImageLoader,
            data: DashboardModel,
            listener: (DashboardModel, View, String) -> Unit
        ) =
            with(itemView) {
                itemView.layout_legend.removeAllViews()

                val dataSet = PieDataSet(data.pieEntries, "")
                dataSet.colors = data.colors
                dataSet.iconsOffset = MPPointF(0f, 40f)
                dataSet.selectionShift = 5f
                dataSet.xValuePosition = PieDataSet.ValuePosition.OUTSIDE_SLICE
                dataSet.yValuePosition = PieDataSet.ValuePosition.OUTSIDE_SLICE
                dataSet.valueLinePart1OffsetPercentage = 100f
                dataSet.valueLinePart1Length = 1f
                dataSet.valueLinePart2Length = 1f

                val pieData = PieData(dataSet)
                pieData.setValueFormatter(PercentFormatter())
                pieData.setValueTextColor(Color.DKGRAY)
                pieData.setValueTextSize(10f)

                itemView.pie_chart.holeRadius = 0f
                itemView.pie_chart.transparentCircleRadius = 0f
                itemView.pie_chart.legend.isEnabled = false
                itemView.pie_chart.setExtraOffsets(10f, 10f, 10f, 10f)

                itemView.pie_chart.setUsePercentValues(true)
                itemView.pie_chart.setDrawEntryLabels(false)
                itemView.pie_chart.description.isEnabled = false
                itemView.pie_chart.data = pieData
                itemView.pie_chart.setTouchEnabled(false)

                for (i in data.paymentMethods.indices) {
                    val acquirerData = data.paymentMethods[i]
                    val legend =
                        LayoutInflater.from(itemView.layout_legend.context)
                            .inflate(R.layout.layout_legend, itemView.layout_legend, false)
                    legend.view_color_chart.setBackgroundColor(data.colors[i])
                    legend.label_payment_name.text = acquirerData.acquirer.acquirerType.name
                    legend.label_payment_count.text = "${acquirerData.transactionCount} Transaksi"
                    legend.label_payment_total.text = NumberUtil.formatCurrency(acquirerData.nettAmount)
                    itemView.layout_legend.addView(legend)
                }
            }

    }

    class PercentFormatter : IValueFormatter, IAxisValueFormatter {

        private var mFormat: DecimalFormat

        constructor() {
            mFormat = DecimalFormat("###,###,##0.0")
            val sym = DecimalFormatSymbols.getInstance()
            sym.decimalSeparator = ','
            mFormat.decimalFormatSymbols = sym
        }

        /**
         * Allow a custom decimalformat
         *
         * @param format
         */
        constructor(format: DecimalFormat) {
            this.mFormat = format
        }

        // IValueFormatter
        override fun getFormattedValue(
            value: Float,
            entry: Entry,
            dataSetIndex: Int,
            viewPortHandler: ViewPortHandler
        ): String {
            return mFormat.format(value.toDouble()) + "%"
        }

        // IAxisValueFormatter
        override fun getFormattedValue(value: Float, axis: AxisBase): String {
            return mFormat.format(value.toDouble()) + "%"
        }
    }
}