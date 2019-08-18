import moment from "moment";

export default {
  methods: {
    generateShortcut() {
      const days = [
        "today",
        "yesterday",
        "this week",
        "this month",
        "last week",
        "last month"
      ];
      let shortcut = [];
      days.map(d => {
        shortcut.push({
          text: d,
          onClick: () => {
            this.date1 = this.generateData(d);
          }
        });
      });
      return shortcut;
    },
    generateData(type) {
      switch (type) {
        case "today":
          return [moment().startOf("day"), moment().endOf("day")];

        case "yesterday":
          return [
            moment()
              .startOf("day")
              .subtract(1, "days"),
            moment().startOf("day")
          ];

        case "this week":
          return [moment().startOf("week"), moment().endOf("week")];

        case "this month":
          return [moment().startOf("month"), moment().endOf("month")];

        case "last week":
          return [
            moment()
              .startOf("week")
              .subtract(1, "weeks"),
            moment().startOf("week")
          ];

        case "last month":
          return [
            moment()
              .startOf("month")
              .subtract(1, "months"),
            moment().startOf("month")
          ];

        default:
          return null;
      }
    }
  }
};
