<template>
  <div>
    <h3 class="mb-3">{{ $changeCase.titleCase(stepFor) }}</h3>
    <v-stepper v-model="e2">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="e2 > 1" editable
          >Day</v-stepper-step
        >
        <v-stepper-step step="2" :complete="e2 > 2" editable
          >Month</v-stepper-step
        >
        <v-stepper-step step="3" :complete="e2 > 3" editable
          >Year</v-stepper-step
        >
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content v-for="n in 3" :key="n" :step="n">
          <formAdd
            :form-field="formField"
            :permission-role="permissionRole"
            sm6
            save-btn-text="Next"
            save-btn-icon="navigate_next"
            @onSubmit="next"
          ></formAdd>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
import formAdd from '../commons/formAdd'
export default {
  components: { formAdd },
  props: {
    stepFor: {
      type: String,
      required: true,
    },
    formField: {
      type: Array,
      required: true,
    },
    permissionRole: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      e2: 1,
      stepsResult: [],
    }
  },
  methods: {
    next(data) {
      let result = {}
      Object.keys(data).map(key => {
        const splitKey = key.split('.')
        if (!result[splitKey[0]]) result[splitKey[0]] = {}
        if (!result[splitKey[0]][splitKey[1]])
          result[splitKey[0]][splitKey[1]] = {}
        result[splitKey[0]][splitKey[1]] = parseInt(data[key])
      })
      const ranges = ['day', 'month', 'year']
      result.range = ranges[this.e2 - 1]
      this.stepsResult.push(result)
      if (this.e2 > 2) {
        this.e2 = 1
        this.$emit('onNext', { [this.stepFor]: this.stepsResult })
      } else {
        this.e2++
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
