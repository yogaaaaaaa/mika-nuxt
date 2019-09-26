(SELECT
  `outlet`.`id` 
FROM
  `outlet` 
WHERE
  `outlet`.`merchantId` IN (
    SELECT 
      `acquirer`.`merchantId`
    FROM 
      `acquirer`
    WHERE
      `acquirer`.`acquirerCompanyId` = ?
  ) 
)