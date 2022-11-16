<template>
  <div>
    <b-navbar id="mainNav" class="fixed-top">
      <b-container>
        <b-navbar-brand class="p-0" href="/"><img src="/img/gisanda_logo.svg"/></b-navbar-brand>
      </b-container>  
    </b-navbar>

    <header class="masthead d-flex position-relative top-offset-padding">	
      <div id="waves-bg">        
      </div>
    
      <div class="masttitle container my-auto">
        <!-- Заголовок страницы -->
        <b-row>
          <b-col cols="12" md="8" offset-md="2" lg="6" offset-lg="4">
              <h1 class="text-uppercase">Вход в систему</h1>
          </b-col>
        </b-row>
        <!-- Приветственная надпись -->
        <b-row>
          <b-col cols="12" md="8" offset-md="2" lg="6" offset-lg="4">
            <p>Вас приветствует Веб-сервис ГИСАНДА {{ $axios.defaults.baseURL }}</p>
          </b-col>
        </b-row>  
        <!-- Форма авторизации -->
        <b-row>
          <b-col cols="12" md="8" offset-md="2" lg="6" offset-lg="4" style="margin-top: 25px;">
            <b-card class="px-1 py-1 px-md-2 px-lg-3 px-xl-5 py-xl-3" style="box-shadow: 0px 8px 20px 0rem #2e323626; max-width: 600px">
                  <b-card-text style="margin-bottom: 25px;">Для продолжения работы введите свои учётные данные:</b-card-text>
                  <b-form @submit.prevent="userLogin">
                  <b-form-group
                    id="username-group"
                    label="Имя пользователя"
                    label-for="username-input"
                  >
                    <b-form-input
                      id="username-input"
                      v-model="login.username"
                      placeholder="Логин"
                      required
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    id="password-group"
                    label="Пароль"
                    label-for="password-input"
                  >
                    <b-form-input
                      id="password-input"
                      v-model="login.password"
                      placeholder="Пароль"
                      type="password"
                      required
                    ></b-form-input>
                  </b-form-group>
                  <b-button type="submit" variant="primary">Войти</b-button>
                </b-form>
            </b-card>
          </b-col>
        </b-row>
      </div>      
    </header>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
    }
  },
  methods: {
    async userLogin() {
      try {
        // const tokens = await this.$axios.post('/api/v1/auth/api-token-auth/', this.login)
        // await this.$auth.setUserToken(tokens.data.access, tokens.data.refresh)
        // const user = await this.$axios.get('/api/v1/auth/user/')
        // this.$auth.setUser(user)
        // this.$axios.redirect('home')
        await this.$auth.loginWith('local', {
          data: this.login,
        }).then(() => { this.$auth.redirect('home') })
      } catch (err) {

      }
    },
  },
  auth: false,
}
</script>

<style>
.center-form {
  padding-top: 10%;
}
</style>
