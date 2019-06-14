import moment from "moment-mini";

export default {
  data() {
    return {
      value: 12000,
      current: [],
      max: "",
      min: ""
    };
  },
  methods: {
    formatDate(time) {
      if (!time) {
        return "-";
      }
      return moment(time).format("ddd, D MMM YYYY");
    },
    formatDateToHours(time) {
      if (!time) {
        return "-";
      }
      return moment(time).format("ddd, D MMM YYYY, h:mm:ss a");
    },
    toCurrency(value) {
      return new Intl.NumberFormat("IDR", {
        style: "currency",
        currency: "IDR"
      }).format(value);
    },
    changeColor(color) {
      if (color == 1) {
        return "green";
      } else if (color == 2) {
        return "red";
      }
    }
  }
};
