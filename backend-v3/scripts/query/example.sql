SELECT *
FROM 
  `transaction`
WHERE 
  `transaction`.`status` = ?
ORDER BY ?;