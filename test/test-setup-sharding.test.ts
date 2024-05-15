import { describe, expect } from "@jest/globals";
import "fake-indexeddb/auto";
import { ShardingService } from "../src/index";

interface Item {
    id: string;
    userId: number;
    postId: number;
}
let shardingService = new ShardingService<Item>(1, "placeholder", {
});
afterEach(async () => {
    await shardingService.clearDatabases();
});

describe("createWithoutName", () => {
    it("should test if the name if correct when not passing a name with only one digit max shards", async () => {
        // Arrange
        const shards = 6;
        shardingService = new ShardingService<Item>(shards, "", {
            items: "id",
        });

        // Act
        // Assert
        let counter = 0;
        for (let instance of (
            await shardingService.getDataBaseInstances()
        ).sort((a, b) => Number(a.name.slice(9)) - Number(b.name.slice(9)))) {
            expect(instance.name).toMatch("ShardedDB" + counter);
            counter++;
        }
        expect((await shardingService.getDataBaseInstances()).length).toBe(
            shards
        );
        await shardingService.clearDatabases();

    });
    it("should test if the name if correct when not passing a name with multiple digit max shards", async () => {
        // Arrange
        const shards = 30;
        shardingService = new ShardingService<Item>(shards, "", {
            items: "id",
        });
        // Act
        // Assert
        let counter = 0;
        for (let instance of (
            await shardingService.getDataBaseInstances()
        ).sort((a, b) => Number(a.name.slice(9)) - Number(b.name.slice(9)))) {
            expect(instance.name).toMatch("ShardedDB" + counter);
            counter++;
        }
        expect((await shardingService.getDataBaseInstances()).length).toBe(
            shards
        );    await shardingService.clearDatabases();

    });
});
describe("createWithName", () => {
    it("should test if the name if correct when passing a name with one digit shards", async () => {
        // Arrange
        const shards = 6;
        shardingService = new ShardingService<Item>(shards, "testing", {
            items: "id",
        });

        // Act
        // Assert
        let counter = 0;
        for (let instance of (
            await shardingService.getDataBaseInstances()
        ).sort((a, b) => Number(a.name.slice(9)) - Number(b.name.slice(9)))) {
            expect(instance.name).toMatch("testing" + counter);
            counter++;
        }
        expect((await shardingService.getDataBaseInstances()).length).toBe(
            shards
        );    await shardingService.clearDatabases();

    });
    it("should test if the name if correct when passing a name with multiple digit shards", async () => {
        // Arrange
        const shards = 30;
        shardingService = new ShardingService<Item>(shards, "testing", {
            items: "id",
        });
        // Act
        // Assert
        let counter = 0;
        for (let instance of (
            await shardingService.getDataBaseInstances()
        ).sort((a, b) => Number(a.name.slice(9)) - Number(b.name.slice(9)))) {
            expect(instance.name).toMatch("testing" + counter);
            counter++;
        }
        expect((await shardingService.getDataBaseInstances()).length).toBe(
            shards
        );    await shardingService.clearDatabases();

    });
});
describe("createWithNegativeShards", () => {
    it("should throw an error when passing a negative number of shards", async () => {
        // Arrange
        const shards = -1;
        // Act
        // Assert
        expect(
            () =>
                new ShardingService<Item>(shards, "testing", {
                    items: "id",
                })
        ).toThrowError("Shard count must be greater than 0.");    await shardingService.clearDatabases();

    });
});
describe("insertPreparedItems", () => {

    it("should insert a batch of items into the database", async () => { 
        shardingService = new ShardingService<Item>(3, "insertPreparedItems", {
            items: "id",
        });
        // Arrange
        const items: Item[][] = [
            [
                {
                    id: "1",
                    userId: 123,
                    postId: 456,
                },
                { id: "4", userId: 123, postId: 456 },
            ],
            [
                {
                    id: "2",
                    userId: 123,
                    postId: 456,
                },
                { id: "5", userId: 123, postId: 456 },
            ],
            [
                {
                    id: "3",
                    userId: 123,
                    postId: 456,
                },
                { id: "6", userId: 123, postId: 456 },
            ],
        ];

        // Act
        for (let item of items) {
            await shardingService.putPreparedItems(item, "items");
        }
        const item_response = await shardingService.getAllItems("items");
        const sorted_item_response = item_response.sort((a, b) =>
            a.id.localeCompare(b.id)
        );
        // Assert

        expect(sorted_item_response).toEqual([
            { id: "1", userId: 123, postId: 456 },
            { id: "2", userId: 123, postId: 456 },
            { id: "3", userId: 123, postId: 456 },
            { id: "4", userId: 123, postId: 456 },
            { id: "5", userId: 123, postId: 456 },
            { id: "6", userId: 123, postId: 456 },
        ]);    
    });
});
describe("shardedArray", () => {
    it("should return the correct sharded array", async () => {
        // Arrange
        const items: Item[] = [
            { id: "1", userId: 123, postId: 456 },
            { id: "2", userId: 456, postId: 789 },
            { id: "3", userId: 789, postId: 123 },
        ];
        shardingService = new ShardingService<Item>(3, "shardedArray", {
            items: "id",
        });
        // Act
        const shardedArray = shardingService.getShardedItemArrays(items);
        // Assert
        expect(shardedArray).toEqual([
            [{ id: "3", userId: 789, postId: 123 }],
            [{ id: "1", userId: 123, postId: 456 }],
            [{ id: "2", userId: 456, postId: 789 },],
        ]);    
        await shardingService.clearDatabases();

    });
});
describe("shardedArray", () => {
    it("should throw error when id is undefined", async () => {
        shardingService = new ShardingService<Item>(3, "shardedarray",{
            items: "id",
        });
        // Arrange
        const items = [
            { userId: 123, postId: 456 },
            { userId: 456, postId: 789 },
            { userId: 789, postId: 123 },
        ];
        shardingService = new ShardingService<Item>(3, "shardedArray", {
            items: "id",
        });
        // Act
        
        // Assert
        // @ts-ignore
        expect(() => shardingService.getShardedItemArrays(items)).toThrowError("Item id is required. Current item id is undefined.");    
        await shardingService.clearDatabases();
    });
});