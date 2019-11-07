<template>
  <div>
    <pageTitle title="Outlet List" icon="store"></pageTitle>
    <tableOutlet />
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
}
</script>

<style></style>
