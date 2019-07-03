package id.mikaapp.domain.common

import io.reactivex.ObservableTransformer

/**
 * Created by grahamdesmon on 01/04/19.
 */

abstract class Transformer<T> : ObservableTransformer<T, T>