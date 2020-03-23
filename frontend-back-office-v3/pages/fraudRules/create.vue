<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/fraudRules" exact>
          Fraud Rules
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item>Create</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-stepper v-model="e1">
      <v-stepper-header>
        <template v-for="n in steps.length">
          <v-stepper-step
            :key="n"
            :step="n"
            :complete="e1 === steps[n]"
            editable
            >{{ $changeCase.titleCase(steps[n - 1]) }}</v-stepper-step
          >

          <v-divider v-if="n !== steps.length" :key="`d${n}`"></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <h3>Recency</h3>
          <formAdd
            :form-field="formField.recency"
            :permission-role="permissionRole"
            save-btn-text="Next"
            save-btn-icon="navigate_next"
            :props-data="{ merchants }"
            @onSubmit="recencySubmit"
          ></formAdd>
        </v-stepper-content>

        <v-stepper-content v-for="n in 3" :key="steps[n]" :step="n + 1">
          <subStepper
            :step-for="steps[n]"
            :form-field="formField[steps[n]]"
            :permission-role="permissionRole"
            @onNext="stepNext"
          ></subStepper>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>
<script>
import { catchError } from "~/mixins";
import formAdd from "~/components/commons/formAdd";
import formField from "~/components/fraudRules/formField";
import subStepper from "~/components/fraudRules/subStepper";
export default {
  components: { formAdd, subStepper },
  mixins: [catchError],
  data() {
    return {
      steps: ["recency", "frequency", "monetary", "velocity"],
      e1: 1,
      formField: formField,
      permissionRole: "adminMarketing",
      merchants: [],
      form: {
        id_merchant: "",
        recency: {},
        frequency: [],
        monetary: [],
        velocity: []
      }
    };
  },
  mounted() {
    this.getMerchants();
  },
  methods: {
    async getMerchants() {
      try {
        const resp = await this.$axios.$get(
          "/back_office/merchants?per_page=50&order_by=name&order=asc"
        );
        resp.data.map(r =>
          this.merchants.push({
            value: r.id,
            text: r.name
          })
        );
      } catch (e) {
        this.catchError(e);
      }
    },
    recencySubmit(data) {
      this.form.id_merchant = data.id_merchant.toString();
      delete data["id_merchant"];
      let result = {};
      Object.keys(data).map(key => {
        const splitKey = key.split(".");
        if (!result[splitKey[0]]) result[splitKey[0]] = {};
        if (!result[splitKey[0]][splitKey[1]])
          result[splitKey[0]][splitKey[1]] = {};
        result[splitKey[0]][splitKey[1]] = parseInt(data[key]);
      });
      this.form.recency = result;
      this.e1++;
    },
    stepNext(data) {
      const key = Object.keys(data);
      this.form[key] = data[key];
      if (this.e1 > 3) {
        this.submit();
      } else {
        this.e1++;
      }
    },
    async submit() {
      try {
        await this.$axios.$post(
          "/back_office/fraud_detection/merchant_rules",
          this.form
        );
        this.$router.push("/fraudRules");
      } catch (e) {
        this.e1 = 1;
        this.catchError(e);
      }
    }
  }
};
</script>
