<template>
  <div>
    <v-dialog v-model="dialog" width="500" persistent>
      <v-card>
        <v-card-title class="light-blue white--text">
          <v-icon color="white">lock_open</v-icon>
          <span class="ml-3">Change Password</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation class="mt-3 mb-3">
            <v-text-field
              v-model="oldPassword"
              rounded
              prepend-inner-icon="lock"
              outlined
              single-line
              placeholder="old password"
              :type="show1 ? 'text' : 'password'"
              :append-icon="show1 ? 'visibility' : 'visibility_off'"
              @click:append="show1 = !show1"
            />
            <v-text-field
              v-model="newPassword"
              v-validate="rules"
              rounded
              prepend-inner-icon="lock"
              outlined
              single-line
              placeholder="new password"
              :error-messages="errors.collect(key)"
              :type="show2 ? 'text' : 'password'"
              :append-icon="show2 ? 'visibility' : 'visibility_off'"
              :name="key"
              :data-vv-name="key"
              :data-vv-as="caption"
              @click:append="show2 = !show2"
            />
            <v-text-field
              v-model="confirmPassword"
              v-validate="`required|confirmed:${newPassword}`"
              rounded
              prepend-inner-icon="lock"
              outlined
              single-line
              placeholder="confirm password"
              :error-messages="errors.collect(key2)"
              :type="show3 ? 'text' : 'password'"
              :append-icon="show3 ? 'visibility' : 'visibility_off'"
              :name="key2"
              :data-vv-name="key2"
              :data-vv-as="caption2"
              @click:append="show3 = !show3"
            />
          </v-form>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-btn text color="primary" @click="close">Close</v-btn>
          <v-spacer/>
          <v-btn color="primary" :disabled="!valid" :loading="loading" @click="validate">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog2" width="500" persistent>
      <v-card>
        <v-card-title class="light-blue white--text">Change Password Success</v-card-title>
        <v-card-text>
          <p class="headline mt-5">
            <v-icon large color="primary" class="mr-3">info</v-icon>You need to
            login to continue
          </p>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn text color="primary" @click="toLogin">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

// password for nicorobin: SRY3rx15R8
<script>
import { catchError } from '~/mixins'
export default {
  mixins: [catchError],
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      dialog2: false,

      oldPassword: '',
      password: '',
      passwordConfirmation: '',

      valid: false,

      show1: false,
      show2: false,
      show3: false,
      loading: false,
      newPassword: '',
      confirmPassword: '',
      expiredPassword: true,
      message: '',
      rules:
        'required|min:8|max:50|regex:(?=.*?[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)',
      key: 'new password',
      key2: 'confirmPassword',
      value: '',
      caption: '',
      caption2: 'password',
    }
  },
  watch: {
    show() {
      this.dialog = this.show
    },
  },
  mounted() {
    this.$validator.localize('en', {
      messages: {
        regex:
          'new password must containing both numeric and alphabetic characters',
      },
    })
  },
  methods: {
    close() {
      this.reset()
      this.$emit('onClose')
    },
    async validate() {
      try {
        if (this.$refs.form.validate()) {
          this.loading = true
          await this.$axios.$post('/auth/change_password', {
            oldPassword: this.oldPassword,
            password: this.newPassword,
          })
          this.close()
          this.dialog2 = true
          this.loading = false
        }
      } catch (e) {
        this.loading = false
        this.catchError(e)
      }
    },
    reset() {
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
    },
    toLogin() {
      this.dialog2 = false
    },
  },
}
</script>

<style lang="scss" scoped></style>
