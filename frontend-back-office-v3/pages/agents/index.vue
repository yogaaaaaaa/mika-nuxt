<template>
  <div>
    <pageTitle title="Agent List" icon="person"></pageTitle>
    <tableAgent />
  </div>
</template>

<script>
import tableAgent from '~/components/agents'
import { pageTitle } from '~/components/commons'

export default {
  components: {
    tableAgent,
    pageTitle,
  },
}
</script>

<style></style>
