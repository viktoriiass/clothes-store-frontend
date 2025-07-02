<template>
  <header>
    <h1><a href="/" style="text-decoration: none; color: #2c3e50;">Clothes Store Admin</a></h1>

    <div class="header-divider"></div>

    <div class="mobile-icons">
      <a href="#" class="cart-icon" @click="emit('toggleBasket')">🛒</a>
      <a href="#" class="login-icon">👤</a>
    </div>

    <nav class="site-nav">
      <div class="nav-container">
        <div class="nav-links">
          <a href="#inventory">Inventory dashboard</a>
          <a href="/">Main page</a>
          <a href="/order_page.html">Customer order page</a>
        </div>
      </div>
    </nav>

    <div class="top-nav">
      <a href="#">Search</a>
      <a href="#">Hello</a>

      <template v-if="user && user.username">
        👋 {{ user.username }}
        <button @click="logout">Logout</button>
      </template>
      <template v-else>
        <a href="/auth">Log in</a>
      </template>

      <a href="#">Help</a>

      <div class="basket-icon" @click="emit('toggleBasket')">
        <span class="basket-icon-text">Basket</span>
        <span v-if="totalItems > 0" class="basket-count">({{ totalItems }})</span>
      </div>
    </div>
  </header>

</template>

<script setup>
import { inject } from 'vue';

// правильно: user — это уже ref
const user = inject('user');
const logout = inject('logout');

// eslint-disable-next-line no-undef
const emit = defineEmits(['toggleBasket']);
// eslint-disable-next-line no-undef
defineProps(['totalItems']);
</script>

<style scoped>
.user-info {
  font-weight: bold;
  margin-left: 10px;
  color: #2c3e50;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
}
</style>
