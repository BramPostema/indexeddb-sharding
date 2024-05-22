import { describe, expect, beforeEach } from "@jest/globals";
import "fake-indexeddb/auto";
import { ShardingService } from "../src/index";

interface Item {
	id: string;
	userId: number;
	postId: number;
}
let shardingService = new ShardingService<Item>(3, "items", {
	items: "id,userId,postId",
});

beforeEach(async () => {
	// Clears the database before each test.
	shardingService = new ShardingService<Item>(3, "items", {
		items: "id,userId,postId",
	});

	await shardingService.clearDatabases();
});
afterEach(async () => {
	await shardingService.clearDatabases();
});
describe("ShardingService", () => {
	describe("insertItem", () => {
		it("should insert an item into the database", async () => {
			// Arrange
			const item: Item = {
				id: "1",
				userId: 123,
				postId: 456,
			};
			// Act
			await shardingService.insertItem(item, "items");
			const item_response = await shardingService.getItemById(
				"1",
				"items"
			);
			// Assert
			expect(item_response).toEqual(item);
			expect(item_response).toBeTruthy();
		});
	});

	describe("getItemById", () => {
		it("should return null when getting a non-existent item", async () => {
			// Arrange
			// Act
			const item_response = await shardingService.getItemById(
				"999",
				"items"
			);
			// Assert
			expect(item_response).toBeUndefined();
		});
	});

	describe("insertMultipleItems", () => {
		it("should insert multiple items into the database", async () => {
			// Arrange
			const items: Item[] = [
				{ id: "1", userId: 123, postId: 456 },
				{ id: "2", userId: 456, postId: 789 },
				{ id: "3", userId: 789, postId: 123 },
			];
			// Act
			for (const item of items) {
				await shardingService.insertItem(item, "items");
			}
			// Assert
			for (const item of items) {
				const item_response = await shardingService.getItemById(
					item.id,
					"items"
				);
				expect(item_response).toEqual(item);
			}
		});
	});

	describe("putItemBatch", () => {
		it("should insert 30000 items into the database using insertItemBatch", async () => {
			// Arrange
			const items: Item[] = [];
			for (let i = 0; i < 1000; i++) {
				items.push({ id: `${i}`, userId: i, postId: i });
			}
			// Act
			await shardingService.putItemBatch(items, "items");
			// Assert
			const item_response = (await shardingService.getAllItems(
				"items"
			)).sort((a, b) => a.id.localeCompare(b.id));
			for (const item of items) {
				expect(item_response).toContainEqual(item);
			}
		}, 1000000);
	});
	describe("putItems", () => {
		it("should insert 30000 items into the database using putItems", async () => {
			// Arrange
			const items: Item[] = [];
			for (let i = 0; i < 10; i++) {
				items.push({ id: `${i}`, userId: i, postId: i });
			}
			// Act
			for (const item of items) {
				await shardingService.putItem(item, "items");
			}
			// Assert
			const item_response = (await shardingService.getAllItems(
				"items"
			)).sort((a, b) => a.id.localeCompare(b.id));
			for (const item of items) {
				expect(item_response).toContainEqual(item);
			}
		}, 1000000);
	});
	describe("getShardedItemArrays", () => {
		it("should return an array of arrays of items", async () => {
			// Arrange
			const items: Item[] = [];
			for (let i = 0; i < 10; i++) {
				items.push({ id: `${i}`, userId: i, postId: i });
			}
			// Act
			const shardedItems = shardingService.getShardedItemArrays(items);
			// Assert
			expect(shardedItems.length).toBe(3);
			expect(shardedItems[0].length).toBe(4);
			expect(shardedItems[1].length).toBe(3);
			expect(shardedItems[2].length).toBe(3);
		});
		it("should not contain any empty arrays", async () => {
			// Arrange
			const items: Item[] = [{ id: `${1}`, userId: 1, postId: 1 }];
			// Act
			const shardedItems = shardingService.getShardedItemArrays(items);
			// Assert
			expect(shardedItems).not.toContain([]);
		});
		it("should not contain any undefined arrays", async () => {
			// Arrange
			const items: Item[] = [{ id: `${1}`, userId: 1, postId: 1 }];
			// Act
			const shardedItems = shardingService.getShardedItemArrays(items);
			// Assert
			expect(shardedItems).not.toContain(undefined);
		});
		it("should not contain any null arrays", async () => {
			// Arrange
			const items: Item[] = [{ id: `${1}`, userId: 1, postId: 1 }];
			// Act
			const shardedItems = shardingService.getShardedItemArrays(items);
			// Assert
			expect(shardedItems).not.toContain(null);
		});
		it("should only contian arrays of items", async () => {
			// Arrange
			const items: Item[] = [{ id: `${1}`, userId: 1, postId: 1 }];
			// Act
			const shardedItems = shardingService.getShardedItemArrays(items);
			// Assert
			for (const item of shardedItems) {
				expect(item).toEqual(expect.arrayContaining(items));
			}
      console.log(shardedItems);
			for (const item of shardedItems) {
				for (const i of item) {
					expect(typeof i).toEqual("object");
				}
			}
		});
	});
});
