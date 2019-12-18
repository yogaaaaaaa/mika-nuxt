<template>
  <div>
    <label style="color: #808080;">{{ label }}</label>
    <div class="link" @click="showChoises = true">
      {{ selectedData ? selectedData.name : 'click to change the value' }}
    </div>

    <v-dialog v-model="showChoises" max-width="800">
      <v-card>
        <v-toolbar color="primary" flat dark>
          <v-text-field
            v-model="search"
            hide-details
            prepend-icon="search"
            single-line
            placeholder="Search"
            clearable
          ></v-text-field>
          <v-spacer />
          <v-btn icon dark @click="showChoises = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container grid-list-md>
          <v-row no-gutters>
            <v-col v-for="data in apiData" :key="data.id" cols="6" md="4">
              <v-checkbox
                v-model="selectedData"
                color="primary"
                :label="data.name"
                :value="data"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col>
              <v-pagination v-model="page" :length="pageCount"></v-pagination>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import debounce from 'lodash/debounce'
export default {
  mixins: [catchError],
  props: {
    label: {
      type: String,
      required: true,
    },
    apiUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      apiData: [],
      selectedData: null,
      showChoises: false,
      page: 1,
      pageCount: 0,
      search: '',
    }
  },
  watch: {
    selectedData() {
      if (this.selectedData) {
        this.showChoises = false
        this.$emit('onChange', this.selectedData)
      }
    },
    search: {
      handler: debounce(function() {
        if (this.search == null) this.search = ''
        this.page = 1
        this.populateData()
      }, 500),
    },
    page() {
      this.populateData()
    },
  },
  mounted() {
    this.populateData()
  },
  methods: {
    async populateData() {
      try {
        const search = this.search !== '' ? `f[name]=like,%${this.search}%` : ''
        const url =
          this.apiUrl +
          `?get_count=1&page=${this.page}&order_by=name&order=asc&${search}`
        const resp = await this.$axios.$get(url)
        this.pageCount = resp.meta.ofPages
        this.apiData = resp.data
        this.selectedData = null
      } catch (e) {
        this.catchError(e)
      }
    },
  },
}
</script>
