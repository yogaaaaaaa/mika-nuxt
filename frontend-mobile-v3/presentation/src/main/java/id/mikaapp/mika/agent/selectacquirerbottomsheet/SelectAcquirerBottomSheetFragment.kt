package id.mikaapp.mika.agent.selectacquirerbottomsheet

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.GridLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import id.mikaapp.mika.R
import id.mikaapp.mika.ext.observe
import id.mikaapp.sdk.models.Acquirer
import kotlinx.android.synthetic.main.fragment_select_acquirer_bottomsheet.*
import org.koin.android.viewmodel.ext.android.viewModel

/**
 * Created by grahamdesmon on 18/04/19.
 */

class SelectAcquirerBottomSheetFragment(private val title: String) : BottomSheetDialogFragment() {

    private val viewModel: SelectAcquirerBottomSheetViewModel by viewModel()
    private val listAdapter = SelectAcquirerBottomSheetListAdapter()
    private var onAcquirerSelectedListener: ((acquirer: SelectAcquirerBottomSheetListItemUiModel.Acquirer) -> Unit)? =
        null

    interface OnAcquirerSelected {
        fun onSelected(acquirer: Acquirer)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? =
        inflater.inflate(R.layout.fragment_select_acquirer_bottomsheet, container, false)


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        selectAcquirerBottomSheetTitle.text = title
        selectAcquirerBottomSheetRecyclerView.apply {
            adapter = listAdapter
            layoutManager = GridLayoutManager(context, 3)
        }
        listAdapter.setOnAcquirerSelected { onAcquirerSelectedListener?.invoke(it);dismiss() }
        observe(viewModel.uiModelState) { listAdapter.update(it) }
    }

    fun setOnAcquirerSelected(listener: ((acquirer: SelectAcquirerBottomSheetListItemUiModel.Acquirer) -> Unit)?) {
        onAcquirerSelectedListener = listener
    }
}