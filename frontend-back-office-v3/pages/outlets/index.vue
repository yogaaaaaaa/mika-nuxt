<template>
  <div>
    <pageTitle title="Outlet List" icon="store"></pageTitle>
    <tableOutlet :show-add-btn="showAddBtn" />
  </div>
</template>

<script>
import tableOutlet from '~/components/outlets'
import { pageTitle } from '~/components/commons'

export default {
  components: {
    tableOutlet,
    pageTitle,
  },
  data() {
    return {
      showAddBtn: false
    }
  }
}
</script>

<style></style>
