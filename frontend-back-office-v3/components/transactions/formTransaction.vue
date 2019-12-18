<template>
  <div>
    <form>
      <v-card flat>
        <v-toolbar v-if="withTopToolbar" flat>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submit">
            <v-icon left>save</v-icon>Save
          </v-btn>
        </v-toolbar>
        <v-divider v-if="withTopToolbar" class="mb-4"></v-divider>
        <v-container fluid grid-list-md>
          <v-layout wrap>
            <v-flex
              v-for="field in formField"
              :key="field.key"
              :sm6="sm6"
              xs12
              class="px-4 py-0"
            >
              <v-row class="mr-2 align-center body-2 pa-0">
                <v-col class="d-flex align-center">
                  <span>{{ field.caption }}</span>
                </v-col>
                <v-text-field
                  v-if="field.fieldType == 'text'"
                  v-model="formData[field.key]"
                  v-validate="field.rules"
                  readonly
                  class="body-2 text pa-0"
                  :type="field.type"
                  :error-messages="errors.collect(field.key)"
                  :name="field.key"
                  :data-vv-name="field.key"
                  :data-vv-as="field.caption"
                />
                <v-text-field
                  v-if="field.fieldType == 'textAmount'"
                  v-model="amount"
                  v-validate="field.rules"
                  readonly
                  class="body-2 pa-0"
                  :type="field.type"
                  :error-messages="errors.collect(field.key)"
                  :name="field.key"
                  :data-vv-name="field.key"
                  :data-vv-as="field.caption"
                />
                <v-text-field
                  v-if="field.fieldType == 'date'"
                  v-model="updatedDate"
                  v-validate="field.rules"
                  readonly
                  class="body-2 pa-0"
                  :type="field.type"
                  :error-messages="errors.collect(field.key)"
                  :name="field.key"
                  :data-vv-name="field.key"
                  :data-vv-as="field.caption"
                />
              </v-row>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </form>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import Filters from 'vue2-filters'

export default {
  $_veeValidate: {
    validator: 'new',
  },
  mixins: [catchError, Filters],
  props: {
    formField: {
      type: Array,
      required: true,
    },
    initialData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    sm6: {
      type: Boolean,
      default: false,
    },
    withTopToolbar: {
      type: Boolean,
      default: false,
    },
    propsData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      formData: {},
      loading: false,
      amount: null,
      updatedDate: null,
    }
  },

  watch: {
    initialData() {
      if (Object.keys(this.initialData).length > 0) {
        this.formData = Object.assign({}, this.initialData)
        this.amount = this.thousandSeparator(this.formData.amount)
        this.updatedDate = this.$moment(this.formData.date).format(
          'YYYY-MM-DD, HH:mm:ss'
        )
      }
    },
  },
  mounted() {
    this.formField.map(f => (this.formData[f.key] = f.value))
  },
  methods: {
    thousandSeparator(value) {
      let amount = parseInt(value).toLocaleString()
      return amount
    },
    async submit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.$emit('onSubmit', this.formData)
          this.close()
        }
      })
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
