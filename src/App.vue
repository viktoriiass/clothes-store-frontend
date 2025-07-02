<template>
  <HeaderComponent
    :basket-items="basketItems"
    :last-added-item="lastAddedItem"
    :total-price="totalPrice"
    :user="user"
    :is-basket-open="isBasketOpen"
    @toggle-basket="toggleBasket"
    @remove-from-basket="removeFromBasket"
    @update-quantity="updateQuantity"
    @logout="logout"
    @toggle-menu="toggleMenu"
  />

  <router-view />

  <FooterComponent />
</template>

<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'
</script>
