import moment from "moment";
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
        amount: i.amount,
        status: i.status,
        date: moment(i.createdAt).format("HH:mm:ss"),
        time: moment(i.createdAt).format("HH:mm:ss")
      })
    );
  }

  return output;
};
