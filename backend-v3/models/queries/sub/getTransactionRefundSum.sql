(SELECT
  SUM(`transactionRefund`.`amount`)
FROM
  `transactionRefund` 
WHERE
  `transactionRefund`.`transactionId` = ?)