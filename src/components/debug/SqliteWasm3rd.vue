<!--
  Prompt: 'entrypoints/options/pages/debug/SqliteWasm3rd.vue' 请实现使用一个包含sqlte中所有地字段类型的表测试大规模插入的阐述
  简介: 该 Vue 组件用于测试 @subframe7536/sqlite-wasm 库的功能，特别是使用 IndexedDB 作为存储后端时，针对包含所有 SQLite 数据类型的表进行大规模批量插入操作的性能和稳定性。
-->
<script lang="ts" setup>
import { initSQLite, SQLiteDB } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { ref, onMounted } from 'vue' // 确保导入 ref 和 onMounted
import { like, select } from 'sql-bricks'
// optional url
// const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.3/dist/wa-sqlite-async.wasm'
// const url1 = 'https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@v0.5.0/wa-sqlite-fts5/wa-sqlite-async.wasm'
let sqliteDb: SQLiteDB
const ready = ref(false)
const data = ref<any[]>([]) // 用于显示旧表数据
const dataStr = ref('')
const allTypesData = ref<any[]>([]) // 用于显示新表数据
const insertCount = ref(0) // 跟踪插入的记录数
const insertTime = ref(0) // 跟踪插入耗时
const isInserting = ref(false) // 标记是否正在插入
let stopInsertion = false // 停止插入的标志

onMounted(() => {
  // init() // 可以在页面加载时自动初始化，或通过按钮手动初始化
})

/**
 * 初始化 SQLite 数据库实例
 */
async function init() {
  try {
    sqliteDb = await initSQLite(
      useIdbStorage('test.db', {
        url: 'wa-sqlite-async.wasm',
      })
    )
    console.log('SQLite DB initialized successfully.')
    ready.value = true
  } catch (error) {
    console.error('Failed to initialize SQLite DB:', error)
    alert(`Failed to initialize SQLite DB: ${error}`)
  }
}

/**
 * 创建旧的 users 表（示例）
 */
async function createTable() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  try {
    const rs = await sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE);`)
    console.log('Users table created:', rs)
    alert('Users table created successfully.')
  } catch (error) {
    console.error('Failed to create users table:', error)
    alert(`Failed to create users table: ${error}`)
  }
}

/**
 * 查询旧的 users 表数据
 */
async function queryData() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  try {
    const sql = select("*").from('users').where(like("name", 'Alice%')).toString();
    console.log('sql', sql)
    const rs = await sqliteDb.run(sql)
    console.log('Query users data result:', rs)
    data.value = rs
  } catch (error) {
    console.error('Failed to query users data:', error)
    alert(`Failed to query users data: ${error}`)
  }
}

/**
 * 向旧的 users 表插入数据
 */
async function insertData() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  const rand = Date.now() % 1000
  try {
    const rs = await sqliteDb.run(
      'INSERT INTO users (name, email) VALUES (?, ?), (?, ?);',
      [`Alice${rand}`, `alice${rand}@example.com`, `Bob${rand}`, `bob${rand}@example.com`]
    )
    console.log('Insert users data result:', rs)
    await queryData() // 插入后刷新数据
  } catch (error) {
    console.error('Failed to insert users data:', error)
    alert(`Failed to insert users data: ${error}`)
  }
}

/**
 * 创建包含所有 SQLite 数据类型的表
 */
async function createTableWithAllFields() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  try {
    // INTEGER, REAL, TEXT, BLOB, NULL (通过允许 NULL 实现)
    // 添加了 NUMERIC, BOOLEAN, DATE, DATETIME 作为常见类型示例
    const rs = await sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS all_types_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          integer_col INTEGER,
          real_col REAL,
          text_col TEXT,
          blob_col BLOB,
          nullable_text_col TEXT,
          numeric_col NUMERIC, -- NUMERIC 可以存储任何类型
          boolean_col BOOLEAN, -- SQLite 中通常用 INTEGER 0 或 1 表示
          date_col DATE,       -- SQLite 中通常用 TEXT (ISO8601), REAL (Julian day), or INTEGER (Unix time)
          datetime_col DATETIME -- 同上
      );
    `)
    console.log('All types table created:', rs)
    alert('Table with all field types created successfully.')
  } catch (error) {
    console.error('Failed to create all types table:', error)
    alert(`Failed to create all types table: ${error}`)
  }
}


async function createIndex() {
  await sqliteDb.run(`CREATE INDEX idx_integer_col IF NOT EXISTS ON all_types_table (integer_col);`)
}

async function catIndex() {
  const indexInfo = await sqliteDb.run(`PRAGMA index_list(all_types_table);`)
  const explainResult = await sqliteDb.run(`EXPLAIN QUERY PLAN SELECT * FROM all_types_table WHERE integer_col BETWEEN 10000 AND 20000;`)
  console.log('indexInfo', indexInfo, explainResult)
}

async function dropIndex() {
  await sqliteDb.run(`DROP INDEX IF EXISTS idx_integer_col;`)

}

/**
 * 测试大规模批量插入数据到 all_types_table
 * @param {number} count - 要插入的记录数量
 */
async function testBatchInsertAbility(count = 10000) {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  if (isInserting.value) {
    alert('Insertion is already in progress.')
    return
  }

  isInserting.value = true
  stopInsertion = false // 重置停止标志
  insertCount.value = 0
  insertTime.value = 0
  const startTime = Date.now()

  try {
    // 开启事务以提高性能
    await sqliteDb.run('BEGIN TRANSACTION;')

    const sql = `
      INSERT INTO all_types_table (
          integer_col, real_col, text_col, blob_col, nullable_text_col,
          numeric_col, boolean_col, date_col, datetime_col
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `


    for (let i = 0; i < count; i++) {
      if (stopInsertion) {
        console.log('Insertion stopped by user.')
        break // 如果用户点击停止，则跳出循环
      }

      const randomSuffix = Math.random().toString(36).substring(2, 10)
      const blobData = new TextEncoder().encode(`blob_data_${randomSuffix}`) // 示例 BLOB 数据

      const params = [
        Math.floor(Math.random() * 1000000), // integer_col
        Math.random() * 1000, // real_col
        `text_data_${randomSuffix}`, // text_col
        blobData, // blob_col
        i % 5 === 0 ? null : `nullable_${randomSuffix}`, // nullable_text_col (每5条插入一个 NULL)
        i % 3 === 0 ? 123 : (i % 3 === 1 ? 45.67 : `num_${randomSuffix}`), // numeric_col (混合类型)
        i % 2 === 0 ? 0 : 1, // boolean_col (0 or 1)
        new Date().toISOString().split('T')[0], // date_col (YYYY-MM-DD)
        new Date().toISOString() // datetime_col (ISO8601 string)
      ]

      // 执行预处理语句
      await sqliteDb.run(sql, params)

      insertCount.value = i + 1

      // 为了避免 UI 卡顿，可以考虑分批提交或使用 Web Worker
      // 这里为了简单起见，暂时不加延时
      if (i % 1000 === 0) {
        console.log(`Inserted ${i + 1} records...`);
        // 可以选择性地在这里提交部分事务，但通常最后一起提交性能更好
        await sqliteDb.run('COMMIT; BEGIN TRANSACTION;');
        await new Promise(resolve => setTimeout(resolve, 0)); // 让出控制权给 UI 线程
      }
    }



    // 提交事务
    await sqliteDb.run('COMMIT;')

    const endTime = Date.now()
    insertTime.value = endTime - startTime
    console.log(`Batch insert completed. Inserted ${insertCount.value} records in ${insertTime.value.toFixed(2)} ms.`)
    alert(`Batch insert completed. Inserted ${insertCount.value} records in ${insertTime.value.toFixed(2)} ms.`)
    await queryDataWithAllFields() // 插入后刷新数据

  } catch (error) {
    console.error('Batch insert failed:', error)
    alert(`Batch insert failed: ${error}`)
    // 如果出错，回滚事务
    try {
      await sqliteDb.run('ROLLBACK;')
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
    }
  } finally {
    isInserting.value = false
    stopInsertion = false // 确保标志被重置
  }
}

/**
 * 停止正在进行的批量插入操作
 */
async function stopTestBatchInsertAbility() {
  if (isInserting.value) {
    stopInsertion = true
    console.log('Stop insertion requested.')
    alert('Stop insertion requested. The process will stop after the current iteration.')
  } else {
    alert('No insertion process is currently running.')
  }
}

/**
 * 查询 all_types_table 中的数据
 */
async function queryDataWithAllFields() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  try {
    // 注意：BLOB 数据可能很大，SELECT * 可能导致性能问题或 UI 卡顿
    // 考虑只查询部分列或限制行数 (LIMIT)
    // 查询 BLOB 长度而不是内容，并限制返回行数
    const rs = await sqliteDb.run('SELECT id, integer_col, real_col, text_col, length(blob_col) as blob_length, nullable_text_col, numeric_col, boolean_col, date_col, datetime_col FROM all_types_table LIMIT 100;')
    console.log('Query all types data result:', rs)
    // 将 BLOB 数据转换为可读格式或提示信息
    allTypesData.value = rs.map(row => ({
      ...row,
      // blob_col: row.blob_col ? `BLOB data (length: ${row.blob_col.length})` : null // 如果直接查询 BLOB
      blob_col: row.blob_length ? `BLOB data (length: ${row.blob_length})` : null // 如果查询的是长度
    }))
  } catch (error) {
    console.error('Failed to query all types data:', error)
    alert(`Failed to query all types data: ${error}`)
  }
}


async function queryDataWithCondition() {
  const start = Date.now()
  const rs = await sqliteDb.run(
    'SELECT * FROM all_types_table WHERE integer_col BETWEEN ? AND ? LIMIT 100;',
    [10000, 20000]
  )
  console.log(`${Date.now() - start}ms`, 'Query all types data result:', rs)
  // 将 BLOB 数据转换为可读格式或提示信息
  allTypesData.value = rs.map(row => ({
    ...row,
    // blob_col: row.blob_col ? `BLOB data (length: ${row.blob_col.length})` : null // 如果直接查询 BLOB
    blob_col: row.blob_length ? `BLOB data (length: ${row.blob_length})` : null // 如果查询的是长度
  }))

}

/**
 * 获取数据库中所有表的结构信息
 */
async function describeAllTables() {
  if (!sqliteDb) {
    alert('Please initialize the database first.')
    return
  }
  try {
    // 首先获取所有表名
    const tablesResult = await sqliteDb.run("SELECT name FROM sqlite_master WHERE type='table';")
    const tableNames = tablesResult.map(t => t.name)

    if (tableNames.length === 0) {
      console.log('No tables found in the database.')
      alert('No tables found in the database.')
      return
    }

    console.log(`Found tables: ${tableNames.join(', ')}. Describing structure...`)
    const results: any[] = []
    // 遍历每个表并获取其结构
    for (const tableName of tableNames) {
      // 使用 PRAGMA table_info 获取表结构
      const tableInfo = await sqliteDb.run(`PRAGMA table_info(${tableName});`)
      const rs = await sqliteDb.run(`SELECT count(*) as count FROM ${tableName}`)

      let result = `${tableName} ${rs[0]['count']}`
      tableInfo.forEach(item => {
        const { name, type, pk, not_null } = item
        result += `\n  ${name} ${type} not_null: ${not_null} pk: ${pk}`
      })
      result += '\n'
      results.push(result)

      console.log(tableInfo)
    }
    dataStr.value = results.join('\n')

  } catch (error) {
    console.error('Failed to describe tables:', error)
    alert(`Failed to describe tables: ${error}`)
  }
}

async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const result = await navigator.storage.persist();
      if (result) {
        console.log("存储已设置为持久性存储");
      } else {
        console.log("无法设置为持久性存储");
      }
    } else {
      console.log("存储已经是持久性的");
    }
  } else {
    console.log("浏览器不支持持久存储 API");
  }
}


</script>

<template>
  <div>
    <h1>@subframe7536/sqlite-wasm Test Page</h1>
    <p>Testing SQLite WASM with IDB storage.</p>

    <!-- 初始化和旧表示例 -->
    <section>
      <h2>Initialization & Basic Operations (Users Table)</h2>
      <button @click="init()">Initialize DB</button>
      <button @click="requestPersistentStorage()">requestPersistentStorage</button>
      <button @click="createTable" :disabled="!ready">Create Users Table</button>
      <button @click="insertData" :disabled="!ready">Insert User Data</button>
      <button @click="queryData" :disabled="!ready">Query User Data</button>
      <button @click="describeAllTables" :disabled="!ready">describe all tables</button>
      <pre v-if="data.length">{{ JSON.stringify(data, null, 2) }}</pre>
      <pre v-if="dataStr">{{ dataStr }}</pre>
    </section>

    <hr style="margin: 20px 0;">

    <!-- 包含所有类型的表的操作 -->
    <section>
      <h2>Advanced Operations (All Types Table)</h2>
      <!-- 创建包含所有字段类型的表 -->
      <button @click="createTableWithAllFields" :disabled="!ready">Create All Types Table</button>
      <button @click="createIndex" :disabled="!ready">CREATE INDEX</button>
      <button @click="catIndex" :disabled="!ready">CAT INDEX</button>
      <button @click="dropIndex" :disabled="!ready">DROP INDEX</button>
      <!-- 批量插入测试 -->
      <div>
        <button @click="testBatchInsertAbility(10000)" :disabled="!ready || isInserting">
          Test Batch Insert (10k rows)
        </button>
        <button @click="stopTestBatchInsertAbility" :disabled="!isInserting">
          Stop Insertion
        </button>
        <!-- 显示插入状态和结果 -->
        <span v-if="isInserting"> Inserting... {{ insertCount }} rows inserted.</span>
        <span v-if="!isInserting && insertTime > 0">
          Last insertion took: {{ (insertTime / 1000).toFixed(2) }} seconds for {{ insertCount }} rows.
        </span>
      </div>
      <!-- 查询包含所有字段类型的数据 -->
      <button @click="queryDataWithAllFields" :disabled="!ready">Query All Types Data (Limit 100)</button>
      <button @click="queryDataWithCondition" :disabled="!ready">Query With Condition (Limit 100)</button>
      <!-- 显示查询结果 -->
      <pre
        v-if="allTypesData.length">All Types Data (showing first 100):\n{{ JSON.stringify(allTypesData, null, 2) }}</pre>
      <p v-else-if="sqliteDb">No data in all_types_table yet or query failed.</p>
    </section>

  </div>
</template>

<style scoped>
button {
  margin: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
}

button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

pre {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  /* Allows wrapping */
  word-wrap: break-word;
  /* Breaks long words */
  font-family: monospace;
}

section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
}

h1,
h2 {
  color: #333;
}

h2 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

hr {
  border: 0;
  height: 1px;
  background-color: #ccc;
}

span {
  margin-left: 10px;
  font-style: italic;
  color: #555;
}
</style>
