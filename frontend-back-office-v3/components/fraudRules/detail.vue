<template>
  <div>
    <div class="title">
      <v-icon class="mb-1">bug_report</v-icon>
      {{ rule.merchant }} Rule
    </div>
    <v-card flat class="mt-5">
      <v-card-title>Recency</v-card-title>
      <v-card-text>
        <recency></recency>
      </v-card-text>

      <frequency :rule="rule"></frequency>
      <monetary :rule="rule"></monetary>
      <velocity :rule="rule"></velocity>
    </v-card>
  </div>
</template>

<script>
import includes from 'lodash/includes'
import frequency from './frequency'
import monetary from './monetary'
import velocity from './velocity'
import recency from './recency'
export default {
  components: { frequency, monetary, velocity, recency },
  data() {
    return {
      notIncludedKeys: ['id_merchant', 'created_at', 'updated_at', 'merchant'],
    }
  },

  methods: {
    notInclude(keys, key) {
      return !includes(keys, key)
    },
  },
}
</script>

<style lang="scss" scoped></style>
