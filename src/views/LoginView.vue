<template>
  <div class="login-container">
    <section class="login-form-section">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" placeholder="Enter your username" required>

        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" placeholder="Enter your password" required>

        <div class="form-options">
          <label>
            <input type="checkbox" v-model="rememberMe"> Remember me
          </label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>

        <button type="submit" class="login-button">Log In</button>
      </form>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/register">Register now</router-link></p>
      </div>
    </section>
  </div>
</template>

<script>
import * as authService from '../auth';

export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false
    };
  },
  methods: {
    async login() {
      try {
        const token = await authService.login(this.username, this.password);
        localStorage.setItem('token', token);
        alert('Logged in!');
        this.$router.push('/');
      } catch (err) {
        alert(err.response?.data?.error || 'Login failed');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  background-color: rgba(220, 210, 200, 0.3);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form-section {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.1);
  text-align: center;
}

h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  border-bottom: 2px solid #2980b9;
  padding-bottom: 10px;
  color: #2c3e50;
}

label {
  text-align: left;
  display: block;
  margin: 15px 0 5px;
  font-weight: 500;
  color: #333;
}

input[type="text"], input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-options {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.login-button {
  margin-top: 25px;
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  color: white;
  border: none;
  background: linear-gradient(to right, #3498db, #2980b9);
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(to right, #2980b9, #2471a3);
}

.login-footer {
  margin-top: 20px;
  font-size: 14px;
}
</style>