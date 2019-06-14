<template>
  <div id="merchant-staff-detail">
    <main-title 
      :text="'Detail Merchant Staff'"
      :icon="'person'"
      :show="false"
    />
    <card-merchant-staff />
  </div>
</template>

<script>
import mainTitle from "~/components/mainTitle.vue";
import merchantStaffCard from "~/components/card/merchantStaff.vue";

export default {
  layout: "marketing-layout",
  components: {
    "main-title": mainTitle,
    "card-merchant-staff": merchantStaffCard
  }
}
</script>

<style>

</style>
