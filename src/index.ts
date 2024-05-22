import { ShardedDB } from './db'; // Import the ShardedDB class
import Dexie, { UpdateSpec } from 'dexie';
import { Item } from './types';

export class ShardingService<T extends Item> {
    public dbInstances: ShardedDB<T>[] = [];

    constructor(
        public shardCount: number,
        public dbName: string,
        public tableDefinitions: Record<string, string>
    ) {
        if (this.shardCount < 1) {
            throw new Error('Shard count must be greater than 0.');
        }
        if (this.dbName ==="") {
            this.dbName = 'ShardedDB';
        }
        // Initialize multiple instances of the database (one for each shard)
        for (let i = 0; i < shardCount; i++) {
            this.dbInstances.push(new ShardedDB<T>(i, this.dbName, this.tableDefinitions));
        }
    }
    async getDataBaseInstances(): Promise<ShardedDB<T>[]> {
        return this.dbInstances;
    }
    public getShardedItemArrays(items: T[]): T[][] {
        // Group items by shard index
        const itemsByShard: T[][] = new Array(this.shardCount).fill(null).map(() => []);
        for (const item of items) {
            if (item.id === undefined) {
                throw new Error('Item id is required. Current item id is '+item.id+ ".");
            }
            const shardIndex = this.getShardIndex(item.id);
            itemsByShard[shardIndex].push(item);
        }
        return itemsByShard.filter((shardItems) => shardItems.length > 0);
    }
    public getShardIndex(id: string): number {
        // Determine the shard index based on the item's ID (e.g., hash it and mod by shard count)
        const hashValue = parseInt(id, 36); // Convert the ID (hex) to an integer
        return hashValue % this.shardCount; // Mod by shard count to determine shard index
    }

    public getShardTable(shardIndex: number, tableName: string): Dexie.Table<T, string> {
        // Return the appropriate table from the specified shard
        return this.dbInstances[shardIndex].tableDefinitions[tableName];
    }

    async insertItem(item: T, tableName: string): Promise<void> {
        // Determine the shard index and table
        const shardIndex = this.getShardIndex(item.id);
        const table = this.getShardTable(shardIndex, tableName);
        // Insert the item into the determined table
        await table.add(item);
    }
    async putItem(item: T, tableName: string): Promise<void> {
        // Determine the shard index and table
        const shardIndex = this.getShardIndex(item.id);
        const table = this.getShardTable(shardIndex, tableName);
        // Insert the item into the determined table
        await table.put(item);
    }
    async putItemBatch(items: T[], tableName: string): Promise<void> {
        // Insert a batch of items into the appropriate shard tables
        const shardItemArrays: T[][]=this.getShardedItemArrays(items);
        const promises = shardItemArrays.map(item => this.putPreparedItems(item, tableName));
        await Promise.all(promises);
    }
    async putPreparedItems(items: T[], tableName: string): Promise<void> {
        // Determine the shard index and table for the first item in the batch
        const shardIndex = this.getShardIndex(items[0].id);
        const table = this.getShardTable(shardIndex, tableName);
        // Bulk insert all items into the determined table
        await table.bulkPut(items);
    }
    // async addPreparedItems(items: T[], tableName: string): Promise<void> {
    //     // Determine the shard index and table for the first item in the batch
    //     const shardIndex = this.getShardIndex(items[0].id);
    //     const table = this.getShardTable(shardIndex, tableName);
    //     // Bulk insert all items into the determined table
    //     await table.bulkAdd(items);
    // }

    async deleteItemById(id: string, tableName: string): Promise<void> {
        // Determine the shard index and table
        const shardIndex = this.getShardIndex(id);
        const table = this.getShardTable(shardIndex, tableName);
        // Delete the item from the determined table
        await table.delete(id);
    }

    async updateItemById(updatedItem: T, tableName: string): Promise<Item> {
        // Determine the shard index and table
        const shardIndex = this.getShardIndex(updatedItem.id);
        const table = this.getShardTable(shardIndex, tableName);
        // Update the item in the determined table
        return await table.update(updatedItem.id , updatedItem as UpdateSpec<T>).then((updated) => {
            if (updated) {
                return updatedItem;
            }
            else {
                throw new Error(`Item with ID ${updatedItem.id} not found.`);
            }
        });
    }
    
    async getItemById(id: string, tableName: string): Promise<T | undefined> {
        // Determine the shard index and table
        const shardIndex = this.getShardIndex(id);
        const table = this.getShardTable(shardIndex, tableName);
        // Retrieve the item from the determined table
        return table.get(id);
    }
    async clearDatabases(): Promise<void> {
        // Clear all shard databases
        for (const dbInstance of this.dbInstances) {
            dbInstance.tables.forEach((table) => table.clear());
        }
    }
    async getAllItems(tableName: string): Promise<T[]> {
        // Retrieve all items from all shards
        const allItems: T[] = [];
        for (const dbInstance of this.dbInstances) {
            const items = await dbInstance.tableDefinitions[tableName].toArray();
            allItems.push(...items);
        }
        return allItems;
    }
   

    async searchItems(callback :  (db:ShardedDB<T>)=>Promise<T[]>, limit?: number ): Promise<T[]> {
        const allItems: T[] = [];
        for (const dbInstance of this.dbInstances) {
            const items = await callback(dbInstance)
            allItems.push(...items);
        }
        return allItems;
    }
    
}

