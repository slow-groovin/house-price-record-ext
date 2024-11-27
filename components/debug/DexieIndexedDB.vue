<script setup lang="ts">
import {db} from '@/utils/client/Dexie'
import {random} from "radash";
import {DexieSampleItem} from "@/types/sample-models";
import {ref, toRaw} from "vue";


const genNewItem = () => ({
  name: 'sample' + Date.now() % 100,
  price: random(10, 100),
  createdAt: new Date(2010 + random(1, 14), random(1, 12), random(1, 28)).getTime()
})


const newItem = ref<DexieSampleItem>(genNewItem());
const query = ref({
  id: null,
  priceMin: 10,
  priceMax: 100,
  createdAtMin: null,
  createdAtMax: null,
  name: ''
});
const items = ref<DexieSampleItem[]>([]);

// Add Item
const addItem = async () => {
  if (newItem.value.name && newItem.value.price && newItem.value.createdAt) {
    console.log(newItem.value)
    await db.items.add(toRaw(newItem.value));
    newItem.value = genNewItem();
    loadItems();
  }
};

// Load all items
const loadItems = async () => {
  items.value = await db.items.toArray();
};

// Delete Item
const deleteItem = async (id?: number | any) => {
  if (typeof id !== 'number') {
    return
  }
  await db.items.delete(id);
  loadItems();
};

// Query Items by ID
const queryItemsById = async () => {
  if (query.value.id != null) {
    items.value = await db.items.where('id').equals(query.value.id).toArray();
  }
};

// Query Items by Price Range
const queryItemsByPrice = async () => {
  if (query.value.priceMin != null && query.value.priceMax != null) {
    items.value = await db.items
        .where('price')
        .between(query.value.priceMin, query.value.priceMax, true, true)
        .toArray();
  }
};

// Query Items by Created At Range
const queryItemsByCreatedAt = async () => {
  if (query.value.createdAtMin != null && query.value.createdAtMax != null) {
    items.value = await db.items
        .where('createdAt')
        .between(query.value.createdAtMin, query.value.createdAtMax, true, true)
        .toArray();
  }
};

// Query Items by Name (fuzzy)
const queryItemsByName = async () => {
  if (query.value.name) {
    items.value = await db.items
        .where('name')
        .startsWithIgnoreCase(query.value.name)
        .toArray();
  }
};

// Load initial items
loadItems();
</script>

<template>
  <div class="c-block">
    <h1>Dexie.js</h1>

    <!-- Add Item -->
    <div>
      <input v-model="newItem.name" placeholder="Name"/>
      <input v-model.number="newItem.price" placeholder="Price" type="number"/>
      <input v-model="newItem.createdAt" placeholder="Created At (timestamp)" type="number"/>
      <button @click="addItem">Add Item</button>
    </div>

    <hr/>

    <!-- Query Item -->
    <div>
      <h2>Query Items</h2>
      <div>
        <input v-model="query.id" placeholder="ID (exact)" type="number"/>
        <button @click="queryItemsById">Query by ID</button>
      </div>

      <div>
        <input v-model.number="query.priceMin" placeholder="Price Min" type="number"/>
        <input v-model.number="query.priceMax" placeholder="Price Max" type="number"/>
        <button @click="queryItemsByPrice">Query by Price</button>
      </div>

      <div>
        <input v-model="query.createdAtMin" placeholder="Created At Min" type="number"/>
        <input v-model="query.createdAtMax" placeholder="Created At Max" type="number"/>
        <button @click="queryItemsByCreatedAt">Query by Created At</button>
      </div>

      <div>
        <input v-model="query.name" placeholder="Name (fuzzy)"/>
        <button @click="queryItemsByName">Query by Name</button>
      </div>
    </div>

    <hr/>

    <!-- Items List -->
    <div>
      <h2>Items List</h2>
      <ul>
        <li v-for="item in items" :key="item.id">
          {{ item.id }} - {{ item.name }} - {{ item.price }} - {{ item.createdAt }}
          <button @click="deleteItem(item.id)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>