import { describe, expect } from '@jest/globals';
import "fake-indexeddb/auto";

import { ShardingService } from '../src/index';
interface Item {
    id: string;
    name?: string;
}


let shardedService = new ShardingService<Item>(3, 'tester', { items: 'id' });
describe('ShardedServiceTest', () => {
    it('should delete the item with a correct id', async () => {
        shardedService = new ShardingService<Item>(3, 'tester', { items: 'id' });
        // Create a new ShardedService
        const initialData = { id: "1", name: 'Service 1' };
        await shardedService.insertItem(initialData, 'items');
        await shardedService.deleteItemById("1", 'items');

        const retrievedData = await shardedService.getItemById('1', 'items');
        // Assert that the ShardedService has been updated
        expect(retrievedData).toEqual(undefined);
        await shardedService.clearDatabases();
    });
    it('should not delete an item with a none existing id', async () => {
        shardedService = new ShardingService<Item>(3, 'tester', { items: 'id' });
        // Create a new ShardedService
        const initialData = { id: "1", name: 'Service 1' };
        await shardedService.insertItem(initialData, 'items');

        await shardedService.deleteItemById("2", 'items');

        // Retrieve the updated ShardedService
        const retrievedData = await shardedService.getItemById('1', 'items');
        // Assert that the ShardedService has been updated
        expect(retrievedData).toEqual(initialData);
        await shardedService.clearDatabases();

    });
});