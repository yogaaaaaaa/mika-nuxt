<template>
  <div>
    <pageTitle title="Agent List" icon="person"></pageTitle>
    <tableAgent :show-add-btn="showAddBtn"/>
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
  data() {
    return {
      showAddBtn: false,
    }
  },
}
</script>

<style></style>
