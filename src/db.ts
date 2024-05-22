import Dexie from 'dexie';
import { Item } from './types';

/**
 * ShardedDB is a class that extends Dexie to create sharded databases.
 * It allows creating multiple instances of a database with different names and indexes.
 *
 * @template T - The type of items stored in the database.
 */
export class ShardedDB<T extends Item> extends Dexie {
    // Define the tableDefinitions property
    tableDefinitions: Record<string, Dexie.Table<T, any>> = {};

    /**
     * Constructor for ShardedDB.
     *
     * @param databaseNumber - A unique number for the database instance.
     * @param name - The base name of the database. Defaults to "ShardedDB".
     * @param tableDefinitions - An object defining the tables to be created in the database.
     *                           The keys are table names and the values are store definitions.
     */
    constructor(
        databaseNumber: number,
        name: string,
        tableDefinitions: Record<string, string>
    ) {
        // Define the database name
        super(`${name}${databaseNumber}`);

        // Configure the database version
        this.version(1).stores(tableDefinitions);

        // Initialize tables based on provided definitions
        for (const tableName in tableDefinitions) {
                // Access tables according to provided definitions
                const table = this.table<T, any>(tableName);
                this.tableDefinitions[tableName] = table;
            
        }
    }
}
