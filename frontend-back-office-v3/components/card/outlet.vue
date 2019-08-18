<template>
  <div class="outlet">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Edit Merchant
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form>
        <v-card-text>
          <v-text-field v-model="edit.idAlias" label="Id Alias"/>
          <v-text-field v-model="edit.name" label="Name"/>
          <v-text-field v-model="edit.status" label="Status"/>
          <v-text-field v-model="edit.email" label="Email"/>
          <v-text-field v-model="edit.website" label="Website"/>
          <v-text-field v-model="edit.phoneNumber" label="Phone Number"/>
          <v-text-field v-model="edit.ownershipType" label="Ownership Type"/>
          <div class="date">Rent Start Date</div>
          <date-picker v-model="edit.rentStartDate" width="100%" lang="en"/>
          <v-text-field v-model="edit.rentDurationMonth" label="Rent Duration Month"/>
          <v-text-field v-model="edit.otherPaymentSystem" label="Other Payment System"/>
          <v-text-field v-model="edit.businessType" label="Business Type"/>
          <v-text-field v-model="edit.businessDurationMonth" label="Business Duration Month"/>
          <v-text-field v-model="edit.businessMonthlyTurnover" label="Business Monthly Turnover"/>
          <v-text-field v-model="merchant.name" label="Merchant Name" readonly/>
          <v-text-field v-model="edit.createdAt" label="Created At"/>
          <v-text-field v-model="edit.updatedAt" label="Updated At"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="putOutlet">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";
import { mapState } from "vuex";
import moment from "moment-mini";

export default {
  props: {
    // outlet: {
    //   type: Object,
    //   default: () => ({
    //     params1: value
    //   })
    // },
    merchant: {
      type: Object,
      required: true
    }
  },
  mixins: [exit],
  watch: {
    outlet: {
      immediate: true,
      handler() {
        this.edit.name = this.outlet.name;
        this.edit.status = this.outlet.status;
        this.edit.email = this.outlet.email;
        this.edit.website = this.outlet.website;
        this.edit.phoneNumber = this.outlet.phoneNumber;
        this.edit.ownerShipType = this.outlet.ownerShipType;
        this.edit.rentStartDate = this.outlet.rentStartDate;
        this.edit.rentDurationMonth = this.outlet.rentDurationMonth;
        this.edit.otherPaymentSystem = this.outlet.otherPaymentSystem;
        this.edit.businessType = this.outlet.businessType;
        this.edit.businessDurationMonth = this.businessDurationMonth;
        this.edit.businessMonthlyTurnover = this.businessMonthlyTurnover;
      }
    }
  },
  data() {
    return {
      rentStartDate: null,
      edit: {
        rentStartDate: null,
        rentDurationMonth: null,
        businessDurationMonth: null,
        businessMonthlyTurnover: null
      }
    };
  },
  computed: {
    ...mapState(["outlet"])
  },
  methods: {
    async putOutlet() {
      await this.$axios
        .$put(`/api/back_office/outlets/${this.$route.params.id}`, {
          name: this.edit.name,
          status: this.edit.status,
          email: this.edit.email,
          website: this.edit.website,
          phoneNumber: this.edit.phoneNumber,
          ownerShipType: this.edit.ownerShipType,
          rentStartDate: this.edit.rentStartDate,
          rentDurationMonth: this.edit.rentDurationMonth,
          otherPaymentSystem: this.edit.otherPaymentSystem,
          businessType: this.edit.businessType,
          businessDurationMonth: this.edit.businessDurationMonth,
          businessMonthlyTurnover: this.edit.businessMonthlyTurnover
        })
        .then(r => {
          this.refresh();
          this.close();
        })
        .catch(e => {
          alert(e);
          this.close();
        });
    }
  }
};
</script>

<style>
.date {
  color: gray;
  font-size: 16px;
  margin-bottom: 5px;
}
</style>
