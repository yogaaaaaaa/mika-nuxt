<template>
  <v-card class="mt-6" flat>
    <v-container fluid>
      <v-row class="mb-6" no-gutters>
        <v-col v-for="n in roles" :key="n" cols="6" md="3" class="mb-3">
          <v-checkbox v-model="selectedRoles" color="primary" :label="n" :value="n"></v-checkbox>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-divider class="mb-4"></v-divider>
      <v-toolbar v-if="checkRoles(permissionRole)" flat>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="submit">
          <v-icon left>save</v-icon>Save
        </v-btn>
      </v-toolbar>
    </v-container>
  </v-card>
</template>

<script>
import { catchError, checkRoles } from '~/mixins'

export default {
  mixins: [catchError, checkRoles],
  data() {
    return {
      url: '/back_office/admins',
      roles: [],
      selectedRoles: [],
      permissionRole: 'adminHead',
    }
  },
  computed: {
    admin() {
      return this.$store.state.currentEdit
    },
  },
  mounted() {
    this.getRoles()
    if (this.admin) {
      this.selectedRoles = this.changeCase(this.admin.user.userRoles)
    }
  },
  methods: {
    async getRoles() {
      try {
        const resp = await this.$axios
          .$get('/utilities/auth_props')
          .then(res => res.data)
        let temp = Object.values(resp.userRoleTypes)
        this.roles = this.changeCase(temp)
      } catch (e) {
        this.catchError(e)
      }
    },
    async submit() {
      try {
        if (this.admin) {
          let selectedRoles = this.changeCamelCase(this.selectedRoles)
          const postData = {
            name: this.admin.name,
            email: this.admin.email,
            description: this.admin.description,
            user: {
              username: this.admin.username,
              userRoles: selectedRoles,
            },
          }
          const response = await this.$axios.$put(
            `${this.url}/${this.admin.id}`,
            postData
          )
          if (response.status !== 'ent-406') {
            this.$store.commit('currentEdit', response.data)
            this.showSnackbar('success', `Data successfuly edited`)
          }
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    changeCase(value) {
      const val = value.map(x => this.$changeCase.titleCase(x))
      return val
    },
    changeCamelCase(value) {
      const val = value.map(x => this.$changeCase.camelCase(x))
      return val
    },
  },
}
</script>

<style lang="scss" scoped></style>
