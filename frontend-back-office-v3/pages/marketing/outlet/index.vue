<template>
  <div class="outlet-marketing">
    <main-title :text="'List Outlets'" :icon="'store'" :show="false" />
    <v-card style="padding:2em">
      <table-outlet :outlets="outlets" />
      <download :data="outlets" />
    </v-card>
    <button-add @dialog="form = !form" />
    <v-dialog v-model="form" width="700">
      <form-outlet @close="dialog = false" />
    </v-dialog>
  </div>
</template>

<script>
import tableOutlet from "~/components/table/outlets.vue";
import download from "~/components/download.vue";
import formOutlet from "~/components/form/outlet.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue"

export default {
  layout: "marketing-layout",
  components: {
    "table-outlet": tableOutlet,
    "download": download,
    "form-outlet": formOutlet,
    "button-add": addButton,
    "main-title": mainTitle
  },
  data(){
    return {
      outlets: [
        {
          name: "Lotte Bandung",
          description: "",
          email: "lottebdg@gmail.com",
          website: "lottebdg.com",
          phoneNumber: "0222768990",
          ownershipType: "",
          rentStartDate: "",
          rentDurationMonth: "5 month",
          otherPaymentSystem: "",
          outletPhotoResourceId: "",
          businessType: "",
          businessDurationMonth: "",
          businessMonthlyTurnOver: "",
          merchantId: "1"
        }
      ],
      form: false
    }
  }
}
</script>

<style>
.float {
  position: fixed;
  bottom: 0;
  left: 10px;
  margin-bottom: 10px;
}
</style>
