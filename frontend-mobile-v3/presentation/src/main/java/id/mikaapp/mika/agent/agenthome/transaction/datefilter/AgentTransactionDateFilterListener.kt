package id.mikaapp.mika.agent.agenthome.transaction.datefilter

interface AgentTransactionDateFilterListener {
    fun onDayFilterSelected()
    fun onMonthFilterSelected()
    fun onNoFilterSelected()
}