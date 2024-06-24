interface Cache {
    lookupValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }): Promise<object | null>;
    storeValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }, value: unknown): Promise<void>;
}

/**
 * FileCache class implements the Cache interface.
 * It provides a file-based cache with TTL and size-based eviction strategies.
 */
declare class FileCache implements Cache {
    /**
     * The directory where the cache files are stored.
     * @type {string}
     */
    cacheDir: string;
    /**
     * The default lifespan of a cached item, in milliseconds.
     * Cached items older than this value will be evicted.
     * @type {number}
     */
    expiresIn: number;
    /**
     * The maximum allowed size of the cache, in bytes.
     * If the cache exceeds this size, some items will be evicted.
     * @type {number}
     */
    maxCacheSize: number;
    /**
     * Constructor for the FileCache class.
     * It creates the cache directory if it doesn't exist.
     * @param {object} options - The options for the cache.
     * @param {string} options.cacheDir - The directory where the cache files are stored.
     * @param {number} options.expiresIn - The lifespan of a cached item, in milliseconds.
     * @param {number} options.maxCacheSize - The maximum allowed size of the cache, in bytes.
     */
    constructor({ expiresIn, // 1 day in milliseconds
    cacheDir, // Default cache directory is './cache'
    maxCacheSize, }?: {
        expiresIn?: number | undefined;
        cacheDir?: string | undefined;
        maxCacheSize?: number | undefined;
    });
    /**
     * Hashes the key for a cache item.
     * The key is an object with properties `functionType`, `functionId`, and `input`.
     * The hash is used as the filename for the cache item.
     * @param {object} key - The key for the cache item.
     * @returns {string} The hash of the key.
     */
    private hashKey;
    /**
     * Looks up a value in the cache.
     * If the value is found and is not expired, it is returned.
     * If the value is not found or is expired, null is returned.
     * @param {object} key - The key for the cache item.
     * @returns {Promise<object|null>} The cached value, or null if the value is not found or is expired.
     */
    lookupValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }): Promise<object | null>;
    /**
     * Stores a value in the cache.
     * The value is stored with the current time, so it can be expired later.
     * @param {object} key - The key for the cache item.
     * @param {unknown} value - The value to store.
     * @returns {Promise<void>}
     */
    storeValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }, value: unknown): Promise<void>;
    /**
     * Checks the total size of the cache.
     * If the cache is too large, it evicts the oldest items until the total cache size is within the limit.
     *
     * @returns {Promise<void>} A promise that resolves when the cache size check (and possible eviction) is complete.
     */
    private checkCacheSize;
}

export { FileCache };
