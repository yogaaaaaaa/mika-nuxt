package id.mikaapp.sdk.enums

enum class CardTransactionServiceLifeCycle {
    UNINITIALIZED,
    READY,
    STARTED,
    READING_CARD,
    CARD_FOUND_MAGNETIC,
    CARD_FOUND_IC,
    EMV_STARTED,
    EMV_CONFIRM_CARD_NUMBER,
    ONLINE_PROCESS,
    SHOW_PIN_PAD,
    SHOW_SIGNATURE,
    PIN_PAD_RESULT,
    DISCONNECTED,
}