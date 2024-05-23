# indexeddb-sharding

`indexeddb-sharding` is an open-source JavaScript library that provides sharding capabilities for IndexedDB, enabling efficient data storage and retrieval across multiple database shards. This library is designed to enhance the performance and scalability of web applications by distributing the data.

## Features

- **Sharding Support:** Automatically distributes data across multiple IndexedDB instances.
- **Scalability:** Facilitates the handling of large datasets by dividing them into manageable shards.
- **Easy Integration:** Simple API for integrating sharding into existing IndexedDB operations.


## Installation

You can install `indexeddb-sharding` via npm:

```bash
npm install indexeddb-sharding
```
Or via yarn:
```bash
yarn add indexeddb-sharding
```

# Getting Started
For optimal data distribution it is recommended to use a random identifier.
## Basic Usage
```javascript
import { ShardingService } from 'indexeddb-sharding';

// Define your item type
interface MyItem {
  id: string;
  name: string;
}

// Define table schema
const tableDefinitions = {
  items: 'id,name',
};

// Create an instance of the ShardingService (shards, databasename, tabledefinitions)
const shardingService = new ShardingService<MyItem>(5, 'myDatabase', tableDefinitions);

// Adding data
const newItem: MyItem = { id: '1', name: 'John Doe' };
shardingService.insertItem(newItem, 'items');

// Retrieving data
async function getItem() {
  const data = await shardingService.getItemById('1', 'items');
  console.log(data);
}

getItem();
```
# API Reference
<br>

`getDataBaseInstances()` Returns the initialized database instances.
```typescript
await shardingService.getDataBaseInstances();
```
<br>

`insertItem(item, tableName)`Adds a new item to the appropriate shard table.
```typescript
const newItem: MyItem = { id: '1', name: 'John Doe' };
await shardingService.insertItem(newItem, 'items');
```
<br>

`getItemById(id, tableName)`Retrieves an item by its ID from the appropriate shard table.
```typescript
const data = await shardingService.getItemById('1', 'items');
```
<br>

`putItem(item, tableName)`Updates or inserts an item in the appropriate shard table.
```typescript
const updatedItem: MyItem = { id: '1', name: 'Jane Doe' };
await shardingService.putItem(updatedItem, 'items');
```
<br>

`putItemBatch(items, tableName)`
Inserts or updates a batch of items in the appropriate shard tables.
```typescript
const items: MyItem[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Doe' }
];
await shardingService.putItemBatch(items, 'items');
```
<br>

`deleteItemById(id, tableName)`
Deletes an item by its ID from the appropriate shard table.
```typescript
await shardingService.deleteItemById('1', 'items');
```
<br>

`updateItemById(updatedItem, tableName)`
Updates an item by its ID in the appropriate shard table.
```typescript
const updatedItem: MyItem = { id: '1', name: 'John Smith' };
await shardingService.updateItemById(updatedItem, 'items');
```
<br>

`clearDatabases()`
Clears all shard databases.
```typescript
await shardingService.clearDatabases();
```
<br>

`getAllItems(tableName)`
Retrieves all items from all shards.
```typescript
const allItems = await shardingService.getAllItems('items');
```
<br>

`searchItems(callback, limit?)`
Performs a search on all shards using the provided callback function.
```typescript
const searchCallback = async (dbInstance) => {
  return await dbInstance.tableDefinitions['items'].where('name').equals('John Doe').toArray();
};
const foundItems = await shardingService.searchItems(searchCallback);
```
