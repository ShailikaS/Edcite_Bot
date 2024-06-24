"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/node/index.ts
var node_exports = {};
__export(node_exports, {
  FileCache: () => FileCache
});
module.exports = __toCommonJS(node_exports);

// src/core/cache/FileCache.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var crypto = __toESM(require("crypto"), 1);
var FileCache = class {
  /**
   * The directory where the cache files are stored.
   * @type {string}
   */
  cacheDir;
  /**
   * The default lifespan of a cached item, in milliseconds.
   * Cached items older than this value will be evicted.
   * @type {number}
   */
  expiresIn = 24 * 60 * 60 * 1e3;
  // 1 day in milliseconds
  /**
   * The maximum allowed size of the cache, in bytes.
   * If the cache exceeds this size, some items will be evicted.
   * @type {number}
   */
  maxCacheSize = 0.5 * 1024 * 1024 * 1024;
  // 0.5 GB
  /**
   * Constructor for the FileCache class.
   * It creates the cache directory if it doesn't exist.
   * @param {object} options - The options for the cache.
   * @param {string} options.cacheDir - The directory where the cache files are stored.
   * @param {number} options.expiresIn - The lifespan of a cached item, in milliseconds.
   * @param {number} options.maxCacheSize - The maximum allowed size of the cache, in bytes.
   */
  constructor({
    expiresIn = 24 * 60 * 60 * 1e3,
    // 1 day in milliseconds
    cacheDir = path.resolve(process.cwd(), ".cache"),
    // Default cache directory is './cache'
    maxCacheSize = 0.5 * 1024 * 1024 * 1024
    // Default max cache size is 0.5 GB
  } = {}) {
    this.expiresIn = expiresIn;
    this.cacheDir = cacheDir;
    this.maxCacheSize = maxCacheSize;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  /**
   * Hashes the key for a cache item.
   * The key is an object with properties `functionType`, `functionId`, and `input`.
   * The hash is used as the filename for the cache item.
   * @param {object} key - The key for the cache item.
   * @returns {string} The hash of the key.
   */
  hashKey(key) {
    const keyString = JSON.stringify(key);
    const hash = crypto.createHash("sha256");
    hash.update(keyString);
    return hash.digest("hex");
  }
  /**
   * Looks up a value in the cache.
   * If the value is found and is not expired, it is returned.
   * If the value is not found or is expired, null is returned.
   * @param {object} key - The key for the cache item.
   * @returns {Promise<object|null>} The cached value, or null if the value is not found or is expired.
   */
  async lookupValue(key) {
    const filePath = path.join(this.cacheDir, this.hashKey(key));
    return new Promise((resolve2, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve2(null);
          } else {
            reject(err);
          }
        } else {
          const parsedData = JSON.parse(data);
          if (Date.now() - parsedData.time > this.expiresIn) {
            fs.unlink(filePath, (err2) => {
              if (err2) {
                reject(err2);
              } else {
                resolve2(null);
              }
            });
          } else {
            resolve2(parsedData.value);
          }
        }
      });
    });
  }
  /**
   * Stores a value in the cache.
   * The value is stored with the current time, so it can be expired later.
   * @param {object} key - The key for the cache item.
   * @param {unknown} value - The value to store.
   * @returns {Promise<void>}
   */
  async storeValue(key, value) {
    const filePath = path.join(this.cacheDir, this.hashKey(key));
    const data = { value, time: Date.now() };
    return new Promise((resolve2, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), "utf8", (err) => {
        if (err) {
          reject(err);
        } else {
          this.checkCacheSize().then(resolve2).catch(reject);
        }
      });
    });
  }
  /**
   * Checks the total size of the cache.
   * If the cache is too large, it evicts the oldest items until the total cache size is within the limit.
   *
   * @returns {Promise<void>} A promise that resolves when the cache size check (and possible eviction) is complete.
   */
  async checkCacheSize() {
    const files = await fs.promises.readdir(this.cacheDir);
    let totalSize = 0;
    const fileDetails = [];
    for (const file of files) {
      const stats = await fs.promises.stat(path.join(this.cacheDir, file));
      totalSize += stats.size;
      fileDetails.push({ file, stats });
    }
    if (totalSize > this.maxCacheSize) {
      fileDetails.sort(
        (a, b) => a.stats.mtime.getTime() - b.stats.mtime.getTime()
      );
      for (const { file, stats } of fileDetails) {
        if (totalSize <= this.maxCacheSize) {
          break;
        }
        await fs.promises.unlink(path.join(this.cacheDir, file));
        totalSize -= stats.size;
      }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileCache
});
//# sourceMappingURL=index.cjs.map