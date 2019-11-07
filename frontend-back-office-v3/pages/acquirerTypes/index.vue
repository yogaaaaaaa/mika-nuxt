<template>
  <div>
    <pageTitle title="Acquirer Type List" icon="person"></pageTitle>
    <tableAgent />
  </div>
</template>

<script>
import tableAgent from '~/components/acquirerTypes'
import { pageTitle } from '~/components/commons'

export default {
  components: {
    tableAgent,
    pageTitle,
  },
}
</script>

<style></style>
