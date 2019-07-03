package id.mikaapp.mika.merchant.dashboard

import android.view.View
import android.widget.LinearLayout
import android.widget.TextView

data class DashboardTabModel(
    val container: LinearLayout,
    val labelTop: TextView,
    val labelBottom: TextView,
    val viewUnder: View,
    var year: String? = null,
    var month: String? = null,
    var day: String? = null,
    var enabled: Boolean = false
)