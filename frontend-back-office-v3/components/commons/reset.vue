<template>
  <div>
    <v-card class="mt-6 pa-4">
      <v-layout align-center justify-center>
        <v-row align="center" class="justify-center">
          <v-col class="text-center" cols="4">
            <div class="my-2">
              <v-btn
                color="warning"
                block
                @click="confirmShowLogin = true"
                :disabled="checkBlocked(currentEdit.user) == true"
              >
                <v-icon left>settings_backup_restore</v-icon>
                <span class="font-weight-black">Buka Blokir</span>
              </v-btn>
            </div>
            <div class="my-2">
              <v-btn color="error" block @click="confirmShowPassword = true">
                <v-icon left>lock_open</v-icon>
                <span class="font-weight-black">Atur ulang kata sandi</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-layout>
    </v-card>
    <confirmation
      :show="confirmShowLogin"
      :title="confirmTitleLogin"
      :text="confirmTextLogin"
      :color="warningColor"
      @onClose="confirmShowLogin = false"
      @onConfirm="loginAttempt"
    />
    <confirmation
      :show="confirmShowPassword"
      :title="confirmTitlePassword"
      :text="confirmTextPassword"
      :color="'error'"
      @onClose="confirmShowPassword = false"
      @onConfirm="setPassword"
    />
    <dialogPassword
      :user="currentEdit.user.username"
      :password="resetPassword"
      :show="showDialogPassword"
      @onCopy="copied"
      @onClose="showDialogPassword = false"
    />
  </div>
</template>

<script>
import confirmation from './confirmation'
import dialogPassword from './dialogPassword'
import { mapState } from 'vuex'
import { catchError } from '~/mixins'

export default {
  props: {
    urlResetPassword: {
      type: String,
      required: true,
    },
    urlLoginAttempt: {
      type: String,
      required: true,
    },
  },
  components: {
    confirmation,
    dialogPassword,
  },
  mixins: [catchError],
  data() {
    return {
      confirmShowPassword: false,
      confirmTitlePassword: 'Atur Ulang Kata Sandi',
      confirmTextPassword:
        'Apakah anda yakin ingin mengatur ulang kata sandi? Perintah ini tidak dapat dibatalkan.',
      confirmShowLogin: false,
      confirmTitleLogin: 'Hapus dari daftar ',
      confirmTextLogin: 'Apakah anda yakin ingin membuka blokir pengguna ini?',
      warningColor: 'warning',
      showDialogPassword: false,
      resetPassword: '',
    }
  },
  watch: {
    user() {
      return this.$store.state.currentEdit
    },
  },
  computed: {
    ...mapState(['currentEdit']),
  },
  methods: {
    checkBlocked(params) {
      if (params.failedLoginAttempt > 5) {
        console.log(params.failedLoginAttempt)
        return false
      }
      return true
    },
    async setPassword() {
      try {
        const resp = await this.$axios.$post(`${this.urlResetPassword}`)
        this.resetPassword = resp.data.password
        this.confirmShowPassword = false
        this.showDialogPassword = true
        if (resp.status == 'auth-204') {
          // this.showSnackbar('success', resp.message)
          this.showSnackbar('success', 'Kata sandi berhasil diatur ulang')
        }
        if (resp.status == 'auth-304') {
          this.showSnackbar('failed', resp.message)
        }
      } catch (e) {
        this.showSnackbar('warning', e.message)
      }
    },
    copied() {
      this.showSnackbar('success', 'Copied !')
    },
    async loginAttempt() {
      try {
        this.confirmShowLogin = false
        const attempt = {
          user: {
            failedLoginAttempt: 0,
          },
        }
        const response = await this.$axios.$put(
          `${this.urlLoginAttempt}`,
          attempt
        )
        if (response.status == 'ent-202') {
          return this.showSnackbar('success', 'User unblocked !')
          this
        }
        this.showSnackbar('warning', response.message)
      } catch (e) {
        this.catchError(e)
      }
    },
  },
}
</script>

<style>
</style>
