<template>
  <div class="login-page">
    <h1>Log In</h1>
    <Login @login-success="onLogin" />
  </div>
</template>

<script>
import Login from '../components/Login.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  components: { Login },
  setup() {
    const router = useRouter()
    function onLogin() {
      // no longer takes an unused `user` param
      router.push({ name: 'Home' })
    }
    return { onLogin }
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
</style>
