<template>
  <div id="basket-app">
    <!-- 1) Show login form if not logged in -->
    <LoginForm v-if="!user" @login-success="handleLogin" />

    <!-- 2) Once logged in, show the rest of the app -->
    <template v-else>
      <HeaderComponent />
      <HamburgerMenu />

      <BasketDropdown
        ref="basketDropdown"
        :basketItems="basketItems"
        :totalItems="totalItems"
        :totalPrice="totalPrice"
        :isBasketOpen="isBasketOpen"
        :lastAddedItem="lastAddedItem"
        @toggleBasket="toggleBasket"
        @removeFromBasket="removeFromBasket"
        @updateQuantity="updateQuantity"
      />

      <BannerSection />
      <CatalogGrid />

      <main id="inventory-app">
        <InventoryForm @add-to-inventory="addToInventory" />

        <section>
          <CurrentInventory
            :items="inventoryItems"
            :key="inventoryKey"
            @add-to-basket="addToBasket"
            @delete-from-inventory="deleteFromInventory"
            @basket-updated="refreshBasket"
          />
        </section>
      </main>

      <FooterComponent />
    </template>
  </div>
</template>

<script>
import {computed, ref} from 'vue';
import axios from 'axios';

import HeaderComponent   from '../components/HeaderComponent.vue';
import HamburgerMenu     from '../components/HamburgerMenu.vue';
import BasketDropdown    from '../components/BasketDropdown.vue';
import BannerSection     from '../components/BannerSection.vue';
import CatalogGrid       from '../components/CatalogGrid.vue';
import InventoryForm     from '../components/InventoryForm.vue';
import CurrentInventory  from '../components/CurrentInventory.vue';
import FooterComponent   from '../components/FooterComponent.vue';
import LoginForm         from '../components/Login.vue';

// eslint-disable-next-line no-unused-vars
import { loadToken, setAuthToken } from '../auth';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    HamburgerMenu,
    BasketDropdown,
    BannerSection,
    CatalogGrid,
    InventoryForm,
    CurrentInventory,
    FooterComponent,
    LoginForm
  },
  setup() {
    // ——— Authentication state ———
    // Load any saved token into axios on startup
    loadToken();
    const user = ref(null);

    async function handleLogin(loggedInUser) {
      // Save user and start loading data
      user.value = loggedInUser;
      await refreshEverything();
    }

    // ——— Basket & Inventory state ———
    const basketItems    = ref([]);
    const inventoryItems = ref([]);
    const isBasketOpen   = ref(false);
    const lastAddedItem  = ref(null);
    const inventoryKey   = ref(Date.now());
    let hideTimeout      = null;

    // ——— Fetchers ———
    async function fetchBasket() {
      const res = await axios.get('http://localhost:3000/api/basket');
      const cleaned = res.data.filter(e => e.item !== null);
      basketItems.value = cleaned.map(e => ({
        _id:      e._id,
        item:     e.item,
        size:     e.size,
        quantity: e.quantity,
        price:    e.price
      }));
    }

    async function fetchInventory() {
      const res = await axios.get('http://localhost:3000/api/items');
      inventoryItems.value = res.data;
    }

    const refreshBasket     = () => fetchBasket();
    const refreshEverything = () => Promise.all([fetchBasket(), fetchInventory()]);

    // ——— Computeds ———
    const totalItems = computed(() =>
      basketItems.value.reduce((sum, i) => sum + i.quantity, 0)
    );
    const totalPrice = computed(() =>
      basketItems.value
        .reduce((sum, i) => sum + (parseFloat(i.price)||0) * i.quantity, 0)
        .toFixed(2)
    );

    // ——— UI actions ———
    function toggleBasket() {
      isBasketOpen.value = !isBasketOpen.value;
    }

    async function addToBasket(item) {
      await axios.post('http://localhost:3000/api/basket', {
        item: item._id,
        size: item.size
      });
      lastAddedItem.value = item;
      isBasketOpen.value = true;
      await fetchBasket();
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        isBasketOpen.value = false;
        lastAddedItem.value = null;
      }, 2000);
    }

    async function removeFromBasket(index) {
      const bi = basketItems.value[index];
      await axios.delete(`http://localhost:3000/api/basket/${bi._id}`, {
        data: { item: bi.item._id, size: bi.size }
      });
      await fetchBasket();
    }

    async function updateQuantity(index, change) {
      const bi = basketItems.value[index];
      const newQty = bi.quantity + change;
      if (newQty <= 0) return removeFromBasket(index);
      await axios.put(
        `http://localhost:3000/api/basket/${bi._id}`,
        { quantity: newQty }
      );
      await fetchBasket();
    }

    async function addToInventory(payload) {
      const res = await axios.post('http://localhost:3000/api/items', payload);
      inventoryItems.value.push(res.data);
      inventoryKey.value = Date.now();
    }

    async function deleteFromInventory(id) {
      await axios.delete(`http://localhost:3000/api/items/${id}`);
      inventoryItems.value = inventoryItems.value.filter(i => i._id !== id);
      // also sweep basket
      const toRemove = basketItems.value.filter(b => b.item._id === id);
      for (const b of toRemove) {
        await axios.delete(`http://localhost:3000/api/basket/${b._id}`, {
          data: { item: id, size: b.size }
        });
      }
      await fetchBasket();
    }

    return {
      // auth
      user,
      handleLogin,

      // data & UI
      basketItems,
      inventoryItems,
      isBasketOpen,
      lastAddedItem,
      inventoryKey,
      totalItems,
      totalPrice,

      // actions
      toggleBasket,
      addToBasket,
      removeFromBasket,
      updateQuantity,
      addToInventory,
      deleteFromInventory,
      refreshBasket,
      refreshEverything
    };
  }
};
</script>


