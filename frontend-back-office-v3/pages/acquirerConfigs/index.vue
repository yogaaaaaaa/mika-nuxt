<template>
  <div>
    <pageTitle title="Acquirer Config List" icon="person"></pageTitle>
    <tableAcquirerConfig />
  </div>
</template>

<script>
import tableAcquirerConfig from '~/components/acquirerConfigs'
import { pageTitle } from '~/components/commons'

export default {
  components: {
    tableAcquirerConfig,
    pageTitle,
  },
}
</script>

<style></style>
