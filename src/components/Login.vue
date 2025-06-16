<template>
  <form @submit.prevent="submit">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button>Log In</button>
    <p v-if="err">{{ err }}</p>
  </form>
</template>

<script>
import { ref } from 'vue';
import { login, setToken } from '../auth';

export default {
  name: 'LoginForm',           // ← add a multi-word name
  emits: ['login-success'],
  setup(_, { emit }) {
    const email = ref(''),
          password = ref(''),
          err = ref('');

    const submit = async () => {
      try {
        const { data } = await login(email.value, password.value);
        setToken(data.token);
        emit('login-success', data.user);
      } catch (e) {
        err.value = e.response?.data?.error || 'Login failed';
      }
    };

    return { email, password, err, submit };
  }
};
</script>
