import moment from "moment";
export default (type, items) => {
  let output = [];
  if (type === "merchant") {
    Object.values(items).map(i =>
      output.push({
        agent: i.agent.name,
        acquirer: i.acquirer.name,
        outlet: i.agent.outlet.name,
        amount: i.amount,
        status: i.status,
        date: moment(i.createdAt).toISOString()
      })
    );
  }

  return output;
};
