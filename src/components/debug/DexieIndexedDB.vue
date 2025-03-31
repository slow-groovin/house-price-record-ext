<script setup lang="ts">
import { db } from '@/entrypoints/db/Dexie'
import { random } from "radash";
import { DexieSampleItem } from "@/types/sample-models";
import { ref, toRaw } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


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
  createdAtMin: 0,
  createdAtMax: Infinity,
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
  items.value = await db.items.limit(10).toArray();
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
      .limit(10)
      .toArray();
  }
};

// Query Items by Created At Range
const queryItemsByCreatedAt = async () => {
  if (query.value.createdAtMin != null && query.value.createdAtMax != null) {
    items.value = await db.items
      .where('createdAt')
      .between(query.value.createdAtMin, query.value.createdAtMax, true, true)
      .limit(10)
      .toArray();
  }
};

// Query Items by Name (fuzzy)
const queryItemsByName = async () => {
  if (query.value.name) {
    items.value = await db.items
      .where('name')
      .startsWithIgnoreCase(query.value.name)
      .limit(10)
      .toArray();
  }
};

/**
 * select * from TABLE where a='a' and b between 1 and 10 实验
 */
async function queryByEqualAndBetween(name: string, begin: number, end: number) {
  items.value = await db.items
    .where({ 'name': name })
    .and(x => x.createdAt > begin && x.createdAt < end)
    .limit(10)
    .toArray()
}


let START_INDEX = 100
let SIZE = 100_000
const BATCH_SIZE = 1000

async function genBatchData() {
  await deleteGenData()
  for (let i = START_INDEX; i < START_INDEX + SIZE; i += BATCH_SIZE) {
    const data: DexieSampleItem[] = []
    for (let j = i; j < i + BATCH_SIZE; j++) {
      data.push({
        createdAt: Date.now() - random(0, 1000) * 24 * 60 * 60 * 1000, id: j, name: "gen-" + j, price: random(0, 100)
      })
    }
    await db.items.bulkAdd(data)
  }
  alert(`insert ${SIZE} data suc.`)
}

async function deleteGenData() {
  await db.items.where('id').between(START_INDEX, START_INDEX + SIZE).delete()
}

async function costWrapper(name: string, fn: () => Promise<any>) {
  const start = Date.now()
  const rs = await fn()

  console.log(name, 'cost:', Date.now() - start, 'ms')
}

/**
 * price=55
 */
async function queryCostTest() {
  const randPrice = () => random(1, 100)
  await costWrapper('[price=].count', () => db.items.where('price').equals(randPrice()).count())
  await costWrapper('[price=].limit(10)', () => db.items.where('price').equals(randPrice()).limit(10).toArray())
  await costWrapper('[price=].limit(1000)', () => db.items.where('price').equals(randPrice()).limit(1000).toArray())
  await costWrapper('[price=].limit(10000)', () => db.items.where('price').equals(randPrice()).limit(10000).toArray())
  await costWrapper('where().between().count()', async () => {
    const begin = random(0, 80)
    return db.items.where('price').between(begin, begin + 10).count()
  })
  await costWrapper('where().between().limit(10)', async () => {
    const begin = random(0, 80)
    return db.items.where('price').between(begin, begin + 10).limit(10).toArray()
  })
  await costWrapper('where().between().sort(createdAt)', async () => {
    const begin = random(0, 80)
    return db.items.where('price').between(begin, begin + 10).limit(100).sortBy('createdAt')
  })

  await costWrapper('where().between().filter().sort(createdAt)', async () => {
    const begin = random(0, 80)
    return db.items
      .where('price')
      .between(begin, begin + 10)
      .filter(x => x.id < 50000)
      .limit(100)
      .reverse()
      .sortBy('createdAt')
  })
}


// Load initial items
loadItems();

</script>

<template>
  <div class="c-block">
    <h1>Dexie.js</h1>

    <!-- Add Item -->
    <div>
      <input v-model="newItem.name" placeholder="Name" />
      <input v-model.number="newItem.price" placeholder="Price" type="number" />
      <input v-model="newItem.createdAt" placeholder="Created At (timestamp)" type="number" />
      <button @click="addItem">Add Item</button>
    </div>

    <hr />

    <!-- Query Item -->
    <div class="flex flex-col gap-y-4">
      <div>
        <h2>Query Items</h2>

        <input v-model="query.id" placeholder="ID (exact)" type="number" />
        <button @click="queryItemsById">Query by ID</button>
      </div>

      <div>
        <input v-model.number="query.priceMin" placeholder="Price Min" type="number" />
        <input v-model.number="query.priceMax" placeholder="Price Max" type="number" />
        <button @click="queryItemsByPrice">Query by Price</button>
      </div>

      <div>
        <input v-model="query.createdAtMin" placeholder="Created At Min" type="number" />
        <input v-model="query.createdAtMax" placeholder="Created At Max" type="number" />
        <button @click="queryItemsByCreatedAt">Query by Created At</button>
      </div>

      <div>
        <input v-model="query.name" placeholder="Name (fuzzy)" />
        <button @click="queryItemsByName">Query by Name</button>
      </div>


      <div>
        <input v-model="query.name" placeholder="Name (fuzzy)" />
        <input v-model="query.createdAtMin" placeholder="Created At Min" type="number" />
        <input v-model="query.createdAtMax" placeholder="Created At Max" type="number" />
        <button @click="queryByEqualAndBetween(query.name, query.createdAtMin, query.createdAtMax)">Query as "select from
          TABLE where name={name} and createdAt between {begin} and {end}
        </button>
      </div>
    </div>

    <hr />

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


    <div>
      <h2>BULK Insert/Delete size:{{ SIZE }}</h2>
      <Button @click="genBatchData">genBatchData</Button>
      <Button @click="deleteGenData">deleteGenData</Button>
    </div>

    <div>
      <h2>Query Cost Test</h2>
      <Button @click="queryCostTest">queryCostTest</Button>
    </div>
  </div>
</template>

<style scoped></style>