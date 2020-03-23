<template>
  <v-img :src="imageBackground" cover class="background-image">
    <v-container fill-height>
      <v-layout align-center justify-center>
        <v-card class="card-login">
          <v-layout>
            <v-flex lg6>
              <div class="logo">
                <v-img
                  src="/img/logonew.png"
                  max-height="6vh"
                  position="center"
                  contain
                  aspec-ratio="1"
                />
                <span class="title-backoffice text-blue">Mika Backoffice System</span>
              </div>
              <!-- </v-flex> -->
              <!-- <v-flex lg6 md6 sm12> -->
              <div class="right-side pa-10 mb-5">
                <div>
                  <h1 class="welcome text-blue">Selamat Datang</h1>
                  <h3>Silahkan login terlebih dahulu</h3>
                </div>
                <v-form class="mt-5">
                  <v-text-field
                    v-model="username"
                    prepend-inner-icon="person"
                    outlined
                    placeholder="username"
                    single-line
                    autofocus
                  />
                  <v-text-field
                    v-model="password"
                    prepend-inner-icon="lock"
                    outlined
                    single-line
                    placeholder="password"
                    :type="show1 ? 'text' : 'password'"
                    :append-icon="show1 ? 'visibility' : 'visibility_off'"
                    @click:append="show1 = !show1"
                  />
                  <span class="text-blue">Lupa password ?</span>
                  <div class="mt-2">
                    <v-btn color="primary" block x-large :loading="loading" @click="login">Login</v-btn>
                    <confirmationBox
                      :show="confirmShowExpired"
                      :title="confirmTitleExpired"
                      :text="confirmTextExpired"
                      :color="'warning'"
                      @onClose="confirmShowExpired = false"
                      @onConfirm="toExpired"
                    />
                  </div>
                </v-form>
                <div class="section-copy-right">
                  <div class="copyright">
                    <span>Copyright © 2019 PT. Mika Informatika Indonesia. All Right Reserved</span>
                  </div>
                </div>
              </div>
            </v-flex>
            <v-flex class="hidden-md-and-down" lg6 md7>
              <v-img :src="imageLogin" class="login-right" aspect-ratio="1">
                <v-img :src="imageCard" cover></v-img>
              </v-img>
            </v-flex>
          </v-layout>
        </v-card>
        <confirmationBox
          :show="countdownShow"
          :title="countdownTitle"
          :text="countdownText"
          :color="'warning'"
          @onConfirm="countdownShow = false"
          @onClose="countdownShow = false"
        />
      </v-layout>
    </v-container>
  </v-img>
</template>

<script>
import { catchError } from '~/mixins'
import confirmationBox from '~/components/commons/confirmation'

export default {
  layout: 'login',
  $_veeValidate: {
    validator: 'new',
  },
  components: {
    confirmationBox,
  },
  mixins: [catchError],
  data: () => ({
    username: '',
    password: '',
    show1: false,
    loading: false,
    confirmShowExpired: false,
    imageLogin: require('~/static/img/login_bg_illustration.png'),
    imageCard: require('~/static/img/login-illustration.svg'),
    imageBackground: require('~/static/img/Login-bg.png'),
    confirmTitleExpired: 'Kata Sandi Kadaluarsa',
    confirmTextExpired:
      'Kata sandi yang dimasukan telah kadaluarsa. Anda harus mengubah kata sandi anda sekarang untuk bisa login!',
    countError: 6,
    countdownText:
      'Anda dapat login lagi 30 menit kedepan atau silakan hubungi admin',
    countdownTitle: '',
    countdownShow: false,
  }),
  mounted() {
    const nodenv = process.env.NODE_ENV
    if (nodenv === 'development') {
      this.username = 'admin'
      this.password = 'admin'
    }
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
    async login() {
      try {
        this.loading = true
        await this.$auth.loginWith('local', {
          data: {
            username: this.username,
            password: this.password,
          },
        })
        this.$router.push('/')
      } catch (e) {
        this.loading = false
        if (e.response.data.status == 'auth-420') {
          this.confirmShowExpired = true
          this.loading = false
        }
        this.catchError(e)
        this.countError--
        if (this.countError <= 0) {
          console.log('countdown', this.countError)
          this.countdownShow = true
        }
      }
    },
    toExpired() {
      this.confirmShowExpired = false
      this.$router.push('/changePassword')
    },
  },
}
</script>
<style lang="scss">
.right-side {
  // padding: 20px;
  // display: flex;
  // flex-direction: column;
  // min-height: 70vh;
  // justify-content: center;
  /* align-items: center; */
  color: #767f8b;
  font-family: Nunito;
}
.card-login {
  // height: 80;
  width: 60%;
}
.login-right {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.background-image {
  width: 100%;
  height: 100vh;
}
.title-backoffice {
  width: 312px;
  height: 38px;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.36;
  text-align: center;
  margin-top: 0.5em;
}
.text-blue {
  color: #27a3dd;
}
.logo {
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  padding-top: 20px;
}
.section-copy-right {
  min-height: 7vh;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.copyright {
  font-size: 0.8em;
  font-weight: 600;
  text-align: center;
  color: #767f8b;
  display: flex;
  align-items: flex-end;
}
</style>
