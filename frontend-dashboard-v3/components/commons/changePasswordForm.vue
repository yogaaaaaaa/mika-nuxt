<template>
  <v-dialog v-model="dialog" width="500" persistent>
    <v-card>
      <v-card-title class="light-blue white--text">Change Password</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation class="mt-3 mb-3">
          <v-text-field
            v-model="oldPassword"
            :rules="oldPasswordRules"
            label="Old password"
            required
            :append-icon="show1 ? 'visibility' : 'visibility_off'"
            :type="show1 ? 'text' : 'password'"
            @click:append="show1 = !show1"
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Password"
            ref="passwordInput"
            required
            :append-icon="show2 ? 'visibility' : 'visibility_off'"
            :type="show2 ? 'text' : 'password'"
            @click:append="show2 = !show2"
          ></v-text-field>
          <v-text-field
            v-model="passwordConfirmation"
            :rules="passwordConfirmationRules"
            label="Password confirmation"
            required
            :append-icon="show3 ? 'visibility' : 'visibility_off'"
            :type="show3 ? 'text' : 'password'"
            @click:append="show3 = !show3"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="close" text color="secondary">Close</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="validate" color="primary" :disabled="!valid" :loading="loading">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { catchError } from "~/mixins";
import { CHANGE_PASSWORD_URL } from "~/lib/apis";
export default {
  mixins: [catchError],
  data() {
    return {
      dialog: false,
      oldPassword: "",
      oldPasswordRules: [v => !!v || "Old password is required"],
      password: "",
      passwordRules: [
        v => !!v || "Password is required",
        v =>
          (v && v.length >= 8) || "Password must be greater than 8 characters"
      ],
      passwordConfirmation: "",
      passwordConfirmationRules: [
        v => !!v || "Password confirmation is required",
        v => (v && v === this.password) || "Password not match"
      ],

      valid: false,

      show1: false,
      show2: false,
      show3: false,
      loading: false
    };
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    show() {
      this.dialog = this.show;
    }
  },
  methods: {
    close() {
      this.reset();
      this.$emit("onClose");
    },
    async validate() {
      try {
        if (this.$refs.form.validate()) {
          this.loading = true;
          const resp = await this.$axios.$post(CHANGE_PASSWORD_URL, {
            oldPassword: this.oldPassword,
            password: this.password
          });
          this.close();
          this.showSnackbar("success", resp.message);
          this.logout();
          this.loading = false;
        }
      } catch (e) {
        this.loading = false;
        this.catchError(e);
      }
    },
    reset() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
