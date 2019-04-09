SELECT *
FROM 
  `transaction`
WHERE 
  `transaction`.`transactionStatus` = ?
ORDER BY ?;