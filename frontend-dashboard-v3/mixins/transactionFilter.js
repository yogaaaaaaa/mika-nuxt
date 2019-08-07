import includes from "lodash/includes";
import { COMBO_DATA_URL } from "~/lib/apis";
import catchError from "./catchError";
const allowedLinks = ["agents", "acquirers", "outlets"];
export default {
  mixins: [catchError],
  methods: {
    getTransactionFilter(f) {
      let data = [];
      if (includes(allowedLinks, f)) {
        data = this.getData(f);
      }
      return data;
    },
    async getData(f) {
      try {
        const resp = await this.$axios
          .$get(COMBO_DATA_URL + f)
          .then(res => res.data);
        let data = [];
        resp.map(r => data.push({ value: r.id, text: r.name }));
        return data;
      } catch (e) {
        this.catchError(e);
      }
    }
  }
};
