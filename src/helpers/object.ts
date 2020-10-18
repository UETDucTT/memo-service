export function pick<T>(object: T, keys: string[]): T | undefined {
  const data: T = {} as T;
  keys.forEach(key => {
    if (object[key] || object[key] === false) {
      data[key] = object[key];
    }
  });
  return data;
}
