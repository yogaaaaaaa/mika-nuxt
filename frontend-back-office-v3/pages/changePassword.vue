<template>
  <v-container fill-height>
    <v-layout align-center justify-center>
      <v-card max-height="70vh" min-width="60vw">
        <v-layout>
          <v-flex lg6 md6 class="hidden-sm-and-down">
            <v-img
              max-height="70vh"
              src="https://images.unsplash.com/photo-1541560052-5e137f229371?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
            />
          </v-flex>
          <v-flex lg6 md6 sm12>
            <div class="right-side">
              <h1 class="title text-center mb-5 grey--text">CHANGE EXPIRED PASSWORD</h1>
              <v-img
                src="/img/logo_horizontal_biru.png"
                max-height="10vh"
                position="center"
                contain
              />
              <v-form class="mt-5">
                <v-text-field
                  v-model="username"
                  rounded
                  prepend-inner-icon="person"
                  outlined
                  placeholder="username"
                  single-line
                  autofocus
                />
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
                  v-validate="`confirmed:${newPassword}`"
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
                <div class="mt-2">
                  <v-btn
                    color="primary"
                    rounded
                    block
                    x-large
                    :loading="loading"
                    @click="changePassword"
                  >Change Password</v-btn>
                  <div class="text-center">
                    <a href="/login" class="text-center caption">back to login</a>
                  </div>
                  <confirmationBox
                    :confirm-show="confirmShowSuccess"
                    :confirm-title="confirmTitleSuccess"
                    :confirm-text="confirmTextSuccess"
                    @onClose="confirmShowSuccess = false"
                    @onConfirm="toLogin"
                  />
                </div>
              </v-form>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { catchError } from '~/mixins'
import confirmationBox from '~/components/commons/confirmation'

export default {
  layout: 'login',
  auth: false,
  $_veeValidate: {
    validator: 'new',
  },
  components: {
    confirmationBox,
  },
  mixins: [catchError],
  data: () => ({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    show1: false,
    show2: false,
    show3: false,
    loading: false,
    // expiredPassword: true,
    message: '',
    rules:
      'required|min:8|max:50|regex:(?=.*?[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)',
    key: 'new password',
    key2: 'confirmPassword',
    value: '',
    caption: '',
    caption2: 'password',
    confirmShowSuccess: false,
    confirmTitleSuccess: 'Berhasil merubah kata sandi',
    confirmTextSuccess:
      'Silahkan login kembali menggunakan kata sandi baru anda',
  }),
  mounted() {
    const nodenv = process.env.NODE_ENV
    if (nodenv === 'development') {
      this.username = 'woohyun'
    }
    this.$validator.localize('en', {
      messages: {
        required: 'Kolom ini harus diisi',
        min: 'Kata sandi minimal 8 karakter ',
        regex: 'Kata sandi harus kombinasi huruf dan angka',
        confirmed: 'Kata sandi harus sama dengan kata sandi sebelumnya',
        // 'The new password must containing both numeric and alphabetic characters',
      },
    })
  },
  methods: {
    submit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.login()
          return
        }
      })
    },
    async changePassword() {
      try {
        const resp = await this.$axios.post(`/auth/change_expired_password`, {
          username: this.username,
          oldPassword: this.oldPassword,
          password: this.newPassword,
        })
        this.message = resp
        this.confirmShowSuccess = true
      } catch (e) {
        this.catchError(e)
      }
      return
    },
    toLogin() {
      this.$router.push('/login')
    },
  },
}
</script>
<style lang="scss">
.right-side {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  justify-content: center;
  /* align-items: center; */
}
</style>
