import "fake-indexeddb/auto";

import { ShardedDB } from '../src/db';
import { ShardingService } from '../src/index';
import { Item } from '../src/types';

describe('ShardedService', () => {

it('should search for items based on index', async () => {
    const shardedService = new ShardingService<Item>(3, 'tester', { items: 'id' });
    // Create a new ShardedService
    const item1 = { id: "1", name: 'Service 1' };
    const item2 = { id: "2", name: 'Service 2' };
    const item3 = { id: "3", name: 'Service 3' };
    await shardedService.insertItem(item1, 'items');
    await shardedService.insertItem(item2, 'items');
    await shardedService.insertItem(item3, 'items');
    const searchFunction = async (db:ShardedDB<Item>) => {
        const items = await db.tableDefinitions["items"].where('id').equals('1').or('id').equals('2').toArray();
        console.log(items);
        return items;
    }
        
    // Search for items with name 'Service'
    const searchResults = await shardedService.searchItems(searchFunction);

    // Assert that the search results contain the expected items
    expect(searchResults).toContainEqual(item1);
    expect(searchResults).toContainEqual(item2);
    expect(searchResults).not.toContainEqual(item3);

    await shardedService.clearDatabases();
});
});


describe('searchItems', () => {
    it('should search for items based on name', async () => {
        // Arrange
        const shardedService = new ShardingService<Item>(3, 'tester', { items: 'id, name' });
        // Create a new ShardedService
        const item1 = { id: "1", name: 'Service 1' };
        const item2 = { id: "2", name: 'Service 2' };
        const item3 = { id: "3", name: 'Servic 3' };
        await shardedService.insertItem(item1, 'items');
        await shardedService.insertItem(item2, 'items');
        await shardedService.insertItem(item3, 'items');
        const searchFunction = async (db:ShardedDB<Item>) => {
            const items = await db.tableDefinitions["items"].where('name').startsWithIgnoreCase('service').toArray();
            return items;
        }
        
        // Search for items with name 'Service'
        const searchResults = await shardedService.searchItems(searchFunction);

        // Assert that the search results contain the expected items
        expect(searchResults).toContainEqual(item1);
        expect(searchResults).toContainEqual(item2);
        expect(searchResults).not.toContainEqual(item3);
        expect(searchResults.length).toBe(2);
        await shardedService.clearDatabases();
    })
})
