<template>
  <div id="basket-app">
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
      @removeFromBasket="(index) => removeFromBasket(index)"
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

import HeaderComponent from './components/HeaderComponent.vue';
import HamburgerMenu from './components/HamburgerMenu.vue';
import BasketDropdown from './components/BasketDropdown.vue';
import BannerSection from './components/BannerSection.vue';
import CatalogGrid from './components/CatalogGrid.vue';
import InventoryForm from './components/InventoryForm.vue';
import CurrentInventory from './components/CurrentInventory.vue';
import FooterComponent from './components/FooterComponent.vue';

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
    FooterComponent
  },
  setup() {
    const basketItems = ref([]);
    const isBasketOpen = ref(false);
    const lastAddedItem = ref(null);
    const inventoryItems = ref([]);
    const inventoryKey = ref(Date.now());
    let hideTimeout = null;

    async function fetchBasket() {
      try {
        const res = await axios.get('http://localhost:3000/api/basket');
        // If res.data looks like [{ _id, item: {...}, size, quantity, price }, ...]
        // Filter out any entry where `entry.item` is null, just in case:
        const cleaned = res.data.filter(entry => entry.item !== null);
        // Now map to the shape that your BasketDropdown expects:
        basketItems.value = cleaned.map(entry => ({
          _id:      entry._id,
          item:     entry.item,        // nested Item object
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
    });

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
        // 1) Build _only_ what the controller needs:
        const payload = {
          item: item._id,   // YOUR item must have an `_id` field (the Mongo ObjectId string)
          size: item.size   // YOUR item must have a `size` field (e.g. "M" or "L")
        };

        // 2) Send that minimal payload to the server:
        await axios.post('http://localhost:3000/api/basket', payload);

        // 3) Refresh the basket contents (so you see the new entry)
        await fetchBasket();

        // 4) Show the toast (+ open dropdown) for 2 seconds
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
        const cleanSize = String(item.size).split(':')[0]; // Clean size (e.g., 'S')
        await axios.put(
          `http://localhost:3000/api/basket/${item._id}?size=${cleanSize}`,
          { quantity: newQty }
        );
        await fetchBasket();
      } catch (err) {
        console.error(' Failed to update quantity:', err.response?.data || err.message);
      }
    }
  };

    const addToInventory = async (item) => {
      try {
        // item = { name: "Foo", price: "12.50", … }
        const res = await axios.post('http://localhost:3000/api/items', item);
        inventoryItems.value.push(res.data);
        inventoryKey.value = Date.now();
      } catch (err) {
        console.error('Failed to add to inventory:', err);
      }
    };

    const deleteFromInventory = async (id) => {
      try {
        // 1) Delete the item itself from /api/items
        await axios.delete(`http://localhost:3000/api/items/${id}`);

        // 2) Remove it immediately from the local inventory array
        inventoryItems.value = inventoryItems.value.filter(item => item._id !== id);

        // 3) Find any basket entries whose referenced item._id equals this id
        const itemsToRemove = basketItems.value.filter(bi => bi.item._id === id);

        // 4) Delete each matching basket entry by its own _id,
        //    sending { item: <itemId>, size: <size> } in the body
        for (const bi of itemsToRemove) {
          await axios.delete(`http://localhost:3000/api/basket/${bi._id}`, {
            data: {
              item: id,       // the Item’s _id
              size: bi.size   // e.g. "M" or "L"
            }
          });
        }

        // 5) Optionally re-fetch the entire basket so the UI re-renders
        await fetchBasket();

        console.log(`Item ${id} and its basket entries were removed.`);
      } catch (error) {
        console.error('❌ Failed to delete item:', error);
        alert('❌ Failed to delete item');
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
      refreshEverything
    };
  }
};
</script>

<style>
@import './assets/stylesheet.css';
</style>

