USE `{{mysqlDatabase}}`;

-- remove card data
ALTER TABLE `transaction` DROP COLUMN `cardPanMasked`;
ALTER TABLE `transaction` DROP COLUMN `cardType`;
ALTER TABLE `transaction` DROP COLUMN `cardAcquirer`;
ALTER TABLE `transaction` DROP COLUMN `cardIssuer`;
ALTER TABLE `transaction` DROP COLUMN `cardNetwork`;
ALTER TABLE `transaction` DROP COLUMN `cardApprovalCode`;
ALTER TABLE `transaction` DROP COLUMN `settlementStatus`;

-- rename reference
ALTER TABLE `transaction` CHANGE COLUMN `referenceNumber` `reference` varchar(255);
ALTER TABLE `transaction` CHANGE COLUMN `referenceNumberName` `referenceName` varchar(255);

-- remove partner id in merchant
ALTER TABLE `merchant` DROP FOREIGN KEY `merchant_ibfk_9`;
ALTER TABLE `merchant` DROP COLUMN `partnerId`;

-- remove apiKey table
DROP TABLE `apiKey`;