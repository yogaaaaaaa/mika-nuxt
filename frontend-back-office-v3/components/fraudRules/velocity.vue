<template>
  <div v-if="velocity" class="px-3 py-3">
    <div v-for="item in velocity" :key="item.range">
      <h4 class="subtitle mb-3">{{ $changeCase.titleCase(item.range) }}</h4>
      <formAdd
        :form-field="formField"
        :permission-role="permissionRole"
        save-btn-text="Update"
        save-btn-icon="save"
        :initial-data="item"
        sm6
        @onSubmit="submit"
      ></formAdd>
    </div>
  </div>
</template>

<script>
import { catchError } from "~/mixins";
import formField from "./formField";
import formAdd from "../commons/formAdd";
import {
  convertToFormField,
  revertToDbData,
  prepareUpdateData
} from "./helper";
export default {
  components: { formAdd },
  mixins: [catchError],
  data() {
    return {
      formField: formField.velocity,
      permissionRole: "adminMarketing",
      velocity: null
    };
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit;
    }
  },
  mounted() {
    this.setvelocity();
  },
  methods: {
    setvelocity() {
      if (this.currentEdit) {
        this.velocity = convertToFormField(this.currentEdit.velocity);
      }
    },
    async submit(data) {
      try {
        this.$store.commit("globalLoading", true);
        const result = revertToDbData(data);
        const putData = prepareUpdateData(this.currentEdit, "velocity", result);
        const resp = await this.$axios.$put(
          `/back_office/fraud_detection/merchant_rules/${putData.id_merchant}`,
          putData
        );
        this.$store.commit("currentEdit", resp.data);
        this.showSnackbar("success", "velocity rule updated");
        this.$store.commit("globalLoading", false);
      } catch (e) {
        this.$store.commit("globalLoading", false);
        this.catchError(e);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
