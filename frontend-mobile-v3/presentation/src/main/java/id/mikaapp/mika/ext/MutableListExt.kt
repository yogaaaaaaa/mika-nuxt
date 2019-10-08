package id.mikaapp.mika.ext

fun <E> MutableList<in E>.replace(newData: List<E>) {
    this.clear()
    this.addAll(newData)
}

inline fun <reified Instance> MutableList<in Instance>.findLastInstanceOfIndexed(block: (Index: Int, instance: Instance) -> Unit) {
    for (i in lastIndex downTo 0) {
        val item = get(i)
        if (item is Instance) {
            block(i, item); return
        }
    }
}

// <In T> => specified Type can only be T or SubType of T
// <out T> => specified Type can only be T or SuperType of T

inline fun <reified Instance> MutableList<in Instance>.replaceLastInstanceOfIf(
    condition: Instance.() -> Boolean,
    to: Instance.() -> Instance
): Boolean {
    findLastInstanceOfIndexed { index, instance ->
        if (condition(instance)) {
            this[index] = to(instance)
            return true
        }
    }
    return false
}