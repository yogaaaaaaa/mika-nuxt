import moment from "moment-mini";

export default {
  data() {
    return {
      max: new Date(),
      shortcuts: [
        {
          text: "Today",
          onClick: () => {
            this.value1 = [
              new moment()
                .subtract("0", "days")
                .startOf("day")
                .toISOString(),
              new moment().toISOString()
            ];
          }
        },
        {
          text: "Yesterday",
          onClick: () => {
            this.value1 = [
              new moment()
                .subtract("1", "days")
                .startOf("day")
                .toISOString(),
              new moment()
                .subtract("1", "days")
                .endOf("day")
                .toISOString()
            ];
          }
        },
        {
          text: "This Month",
          onClick: () => {
            this.value1 = [
              new moment()
                .subtract(0, "months")
                .startOf("month")
                .toISOString(),
              new moment().endOf("day").toISOString()
            ];
          }
        },
        {
          text: "Last Month",
          onClick: () => {
            this.value1 = [
              new moment()
                .subtract(1, "months")
                .startOf("month")
                .toISOString(),
              new moment()
                .subtract(1, "months")
                .endOf("month")
                .toISOString()
            ];
          }
        }
      ]
    };
  }
};
