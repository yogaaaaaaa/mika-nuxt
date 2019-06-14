<template>
  <div class="admin">
    <v-card>
      <v-card-title>
        Create Admin
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAdmin()" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" />
          <v-text-field 
            v-model="email" 
            label="Email" 
            name="email"
            v-validate="'email'" 
          />
          <v-text-field v-model="username" label="Username" />
          <v-combobox
            v-model="roles"
            :items="roleItem"
            label="Role"
            multiple
            chips
          />
        </v-card-text>
        <v-card-actions>
          <v-btn>Submit</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins"

export default {
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      email: "",
      username: "",
      roles: "",
      userId: "",
      roleItem: [
        'Human Resource',
        'Finance',
        'Marketing',
        'Logistic',
        'Support'
      ]
    }
  },
  methods: {
    async postAdmin() {
      await this.$validator.validateAll().then(() => {
        if(!this.errors.any()) {
          this.$axios.$post("/hr/admin", {
            email: this.email,
            username: this.username,
            name: this.name,
            roles: this.roles
          }).then(response => {
            alert(response)
          }).catch(error => {
            alert(error)
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
