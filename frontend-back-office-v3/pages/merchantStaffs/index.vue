<template>
  <div>
    <pageTitle
      title="Merchant Staff List"
      icon="perm_contact_calendar"
    ></pageTitle>
    <tableMerchantStaff />
  </div>
</template>

<script>
import tableMerchantStaff from '~/components/merchantStaffs'
import { pageTitle } from '~/components/commons'

export default {
  components: {
    tableMerchantStaff,
    pageTitle,
  },
}
</script>

<style></style>
