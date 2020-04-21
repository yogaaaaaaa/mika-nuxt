export default {
  methods: {
    catchError(error) {
      if (error.response) {
        if (
          error.response.status === 400 ||
          error.response.status === 403 ||
          error.response.status === 404 ||
          error.response.status === 409 ||
          error.response.status === 500
        ) {
          if (error.response.data.status === 'auth-400') {
            return this.showSnackbar(
              'error',
              'Nama pengguna atau kata sandi yang anda masukkan salah'
            )
          }
          if (error.response.data.status === 'auth-410') {
            return this.showSnackbar('error', error.response.data.message)
          }
          if (error.response.data.status === 'auth-412') {
            return this.showSnackbar(
              'error',
              'Kata sandi baru dan lama tidak boleh sama, silahkan masukkan kata sandi baru'
            )
          }
          if (error.response.data.status === 'auth-411') {
            return this.showSnackbar(
              'error',
              'Pembaharuan kata sandi gagal dikarenakan nama pengguna tidak ditemukan atau kata sandi lama salah atau kata sandi baru menggunakan kata sandi sebelumnya'
            )
          }
          return this.showSnackbar('error', error.response.data.message)
        }
        if (error.response.status === 401) {
          if (error.response.data.status === 'auth-401') {
            this.showSnackbar(
              'error',
              'Sesi anda telah berakhir, mohon untuk login kembali'
            )
            setTimeout(() => {
              this.logout()
            }, 3000)
          }
          if (error.response.data.status === 'auth-421') {
            return this.showSnackbar(
              'error',
              'Akun anda telah terblokir karena salah memasukan nama pengguna atau kata sandi sebanyak 6 kali'
            )
          }
          return this.showSnackbar('error', error.response.data.message)
        }
      } else if (error.request) {
        return this.showSnackbar('error', 'Network Error')
      } else {
        return this.showSnackbar('error', error.message)
      }
    },
    logout() {
      this.$auth.logout()
      this.$router.push('/login')
    },
    showSnackbar(type, message) {
      this.$store.commit('snackbarType', type)
      this.$store.commit('snackbarText', message)
      this.$store.commit('snackbarShow', true)
    },
  },
}
