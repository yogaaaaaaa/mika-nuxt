SUM (
  CASE
    WHEN "transaction"."status" IN ('success', 'refundedPartial') THEN (
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
    ELSE 0
  END
)