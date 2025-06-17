<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Register New Account</h2>

      <div class="form-group">
        <label>Username:</label>
        <input type="text" v-model="username" placeholder="Enter your username" />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label>Password:</label>
        <input type="password" v-model="password" placeholder="Enter your password" />
      </div>

      <button class="login-button" @click="register">Register</button>
      <p>Already have an account? <router-link to="/auth">Login</router-link></p>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// eslint-disable-next-line no-undef
defineOptions({ name: 'RegisterView' })

const username = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const register = async () => {
  try {
    await axios.post('http://localhost:3000/api/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    alert('Registration successful')
    await router.push('/auth')
  } catch (err) {
    alert(err.response?.data?.error || 'Registration failed')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  width: 350px;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #4a90e2, #357ab8);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
