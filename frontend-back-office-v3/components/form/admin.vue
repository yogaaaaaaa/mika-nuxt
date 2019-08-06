<template>
  <div id="admin" v-show="show" persistent>
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Admin
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAdmin()" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" required/>
          <v-text-field v-model="email" label="Email" name="email" v-validate="'email|required'"/>
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field
            v-model="username"
            label="Username"
            name="username"
            v-validate="'required'"
          />
          <span class="message-form">{{ errors.first('username') }}</span>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            name="password"
            v-validate="'password|required'"
          />
          <span class="message-form">{{ errors.first('password') }}</span>
          <v-combobox
            v-model="roles"
            :items="roleItem"
            label="Role"
            name="role"
            v-validate="'required'"
            multiple
            chips
          />
          <span class="message-form">{{ errors.first('role') }}</span>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  mixins: [exit],
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      email: "",
      username: "",
      password: "",
      roles: [],
      userId: "",
      roleItem: [
        "adminHead",
        "adminFinance",
        "adminMarketing",
        "adminLogistic",
        "adminSupport"
      ]
    };
  },
  methods: {
    async postAdmin() {
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/admins", {
              name: this.name,
              email: this.email,
              user: {
                username: this.username,
                password: this.password,
                userRoles: this.roles
              }
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(error => {
              alert(error);
            });
        }
        return this.errors;
      });
    }
  }
};
</script>

<style>
</style>
