SUM (
  "transaction"."amount" - COALESCE(
    (
      SELECT
        SUM("transactionRefund"."amount")
      FROM
        "transactionRefund"
      WHERE
        "transactionRefund"."transactionId" = "transaction"."id"
    ),
    0
  )
)