import moment from "moment";

const formatNumber = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};
export default (type, items) => {
  let output = [];
  if (type === "merchant") {
    Object.values(items).map(i =>
      output.push({
        id: i.id,
        referenceNumber: i.referenceNumber,
        outlet: i.agent.outlet.name,
        agent: i.agent.name,
        paymentMethod: i.acquirer.acquirerType.name,
        amount: formatNumber(i.amount),
        status: i.status,
        date: moment(i.createdAt).format("YYYY-MM-DD"),
        time: moment(i.createdAt).format("HH:mm:ss")
      })
    );
  }

  return output;
};
