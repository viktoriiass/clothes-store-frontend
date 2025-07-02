<template>
  <div id="basket-app">
    <HeaderComponent
      :basketItems="basketItems"
      :isBasketOpen="isBasketOpen"
      :lastAddedItem="lastAddedItem"
      :totalPrice="totalPrice"
      @toggleBasket="toggleBasket"
      @removeFromBasket="removeFromBasket"
      @updateQuantity="updateQuantity"
    />
    <HamburgerMenu />
    <BasketDropdown
       ref="basketDropdown"
      :basketItems="basketItems"
      :totalItems="totalItems"
      :totalPrice="totalPrice"
      :isBasketOpen="isBasketOpen"
      :lastAddedItem="lastAddedItem"
      @toggleBasket="toggleBasket"
      @removeFromBasket="(index) => removeFromBasket(index)"
      @updateQuantity="updateQuantity"
    />

    <BannerSection />
    <CatalogGrid />
    <router-view></router-view>
    <main id="inventory-app">
      <InventoryForm @add-to-inventory="addToInventory" />
      <section>
      <CurrentInventory
        :items="inventoryItems"
        @add-to-basket="addToBasket"
        @delete-from-inventory="deleteFromInventory"
        @basket-updated="refreshBasket"
        @inventory-deleted="handleInventoryDeletion"
      />
      </section>
    </main>

  </div>
</template>

<script>
import { ref, provide, reactive, getCurrentInstance, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from 'axios';
import socket from '@/socket';


import HeaderComponent from '@/components/HeaderComponent.vue';
import HamburgerMenu from '@/components/HamburgerMenu.vue';
import BasketDropdown from '@/components/BasketDropdown.vue';
import BannerSection from '@/components/BannerSection.vue';
import CatalogGrid from '@/components/CatalogGrid.vue';
import InventoryForm from '@/components/InventoryForm.vue';
import CurrentInventory from '@/components/CurrentInventory.vue';


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

  },
  setup() {
    const basketItems = ref([]);
    const isBasketOpen = ref(false);
    const lastAddedItem = ref(null);
    const inventoryItems = ref([]);
    const inventoryKey = ref(Date.now());
    let hideTimeout = null;
    const user = reactive({
        username: null,
        email: null
      });
    const logout = () => {
      localStorage.removeItem('user');
      user.username = null;
      user.email = null;
    };

    provide('user', user);
    provide('logout', logout);

    async function fetchBasket() {
      try {
        const res = await axios.get('http://localhost:3000/api/basket');
        const cleaned = res.data.filter(entry => entry.item !== null);
        basketItems.value = cleaned.map(entry => ({
          _id:      entry._id,
          item:     entry.item,
          size:     entry.size,
          quantity: entry.quantity,
          price:    entry.price
        }));
      } catch (err) {
        console.error('Failed to load basket:', err);
      }
    }

    async function fetchInventory() {
      try {
        const res = await axios.get('http://localhost:3000/api/items');
        inventoryItems.value = res.data;
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    }


    const refreshBasket = () => fetchBasket();
    const refreshEverything = () => {
      fetchBasket();
      fetchInventory();
    };

    onMounted(() => {
      refreshEverything();

    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(storedUser);
        user.username = parsed.username;
        user.email = parsed.email;
      } catch (err) {
        console.warn(' error pars user:', err);
      }
    }

      socket.on('inventoryUpdated', (newItem) => {
        inventoryItems.value.push(newItem);
      });

      socket.on('basketUpdated', (entries) => {
        const cleaned = entries.filter(entry => entry.item !== null);
        basketItems.value = cleaned.map(entry => ({
          _id: entry._id,
          item: entry.item,
          size: entry.size,
          quantity: entry.quantity,
          price: entry.price
        }));
      });
    });

    onBeforeUnmount(() => {
      socket.off('inventoryUpdated');
      socket.off('basketUpdated');
    });
    const handleInventoryDeletion = (itemId) => {
      inventoryItems.value = inventoryItems.value.filter(item => item._id !== itemId);
      inventoryKey.value = Date.now();
    };

    const totalItems = computed(() =>
      basketItems.value.reduce((total, item) => total + item.quantity, 0)
    );

    const totalPrice = computed(() =>
      basketItems.value.reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + (isNaN(price) ? 0 : price * item.quantity);
      }, 0).toFixed(2)
    );

    const toggleBasket = () => {
      isBasketOpen.value = !isBasketOpen.value;
    };

    const addToBasket = async (item) => {
      try {
        const payload = {
          item: item._id,
          size: item.size
        };

        // Send that minimal payload to the server
        await axios.post('http://localhost:3000/api/basket', payload);

        // Refresh the basket contents
        await fetchBasket();

        //Show the toast (+ open dropdown) for 2 seconds
        lastAddedItem.value = item;
        isBasketOpen.value  = true;
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          lastAddedItem.value = null;
          isBasketOpen.value  = false;
          hideTimeout = null;
        }, 2000);

      } catch (error) {
        console.error('Failed to add to basket:', error.response?.data || error.message);
      }
    };

    const removeFromBasket = async (index) => {
      const item = basketItems.value[index];
      try {
        await axios.delete(`http://localhost:3000/api/basket/${item._id}?size=${item.size}`);
        await fetchBasket();
      } catch (error) {
        console.error(' Failed to remove from basket:', error);
      }
    };

    const updateQuantity = async (index, change) => {
    const item = basketItems.value[index];
    const newQty = item.quantity + change;

    console.log(' updateQuantity()', item, '→ new qty:', newQty); // Debug

    if (newQty <= 0) {
      await removeFromBasket(index);
    } else {
      try {
        const cleanSize = String(item.size).split(':')[0];
        await axios.put(
          `http://localhost:3000/api/basket/${item._id}?size=${cleanSize}`,
          { quantity: newQty }
        );
        await fetchBasket();
      } catch (err) {
        console.error(' Failed to update quantity:', err.response?.data || err.message);
      }
    }
    onBeforeUnmount(() => {
      socket.off('inventoryUpdated');
    });

    const app = getCurrentInstance();
      if (app) {
        app.appContext.app.config.globalProperties.$user = user;
      }
  };

    const addToInventory = async (item) => {
      try {
        const res = await axios.post('http://localhost:3000/api/items', item);
        inventoryItems.value.push(res.data);
        inventoryKey.value = Date.now();
      } catch (err) {
        console.error('Failed to add to inventory:', err);
      }
    };

    const deleteFromInventory = async (id) => {
      try {
        await axios.delete(`http://localhost:3000/api/items/${id}`);

        inventoryItems.value = inventoryItems.value.filter(item => item._id !== id);

        const itemsToRemove = basketItems.value.filter(bi => bi.item && bi.item._id === id);

        for (const bi of itemsToRemove) {
          await axios.delete(`http://localhost:3000/api/basket/${bi._id}`, {
            data: { item: id, size: bi.size }
          });
        }

        await fetchBasket();


        alert(' Items added!');
      } catch (error) {
        console.error(' Failed to delete item:', error);
        alert(' Failed to delete item');
      }
    };

    return {
      basketItems,
      inventoryItems,
      isBasketOpen,
      lastAddedItem,
      totalItems,
      totalPrice,
      toggleBasket,
      addToBasket,
      removeFromBasket,
      updateQuantity,
      addToInventory,
      deleteFromInventory,
      refreshBasket,
      refreshEverything,
      handleInventoryDeletion,
      user,
      logout
    };
  }
};
</script>



