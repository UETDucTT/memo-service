export function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}
export function mapObject(value, fn) {
  if (!isObject(value)) {
    return [];
  }
  return Object.keys(value).map(key => fn(value[key], key));
}

export class IoRedisCacheStore {
  private client: any;
  private HASH_KEY: string;
  constructor(client, HASH_KEY = 'axios-cache') {
    this.client = client;
    this.HASH_KEY = HASH_KEY;
  }

  async getItem(key) {
    const item = (await this.client.hget(this.HASH_KEY, key)) || null;

    return JSON.parse(item);
  }

  async setItem(key, value) {
    await this.client.hset(this.HASH_KEY, key, JSON.stringify(value));
    return value;
  }

  async removeItem(key) {
    await this.client.hdel(this.HASH_KEY, key);
  }

  async clear() {
    await this.client.del(this.HASH_KEY);
  }

  async length() {
    return this.client.hlen(this.HASH_KEY);
  }

  async iterate(fn) {
    const hashData = await this.client.hgetallAsync(this.HASH_KEY);
    return Promise.all(mapObject(hashData, fn));
  }
}