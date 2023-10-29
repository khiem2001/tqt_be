export const sortDataByIds = <T>(
  data: T[],
  keys: string[],
  property = '_id',
) => {
  const mapData = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    mapData[item[property].toString()] = item;
  }
  return keys.map((k) => {
    return mapData[k] as T;
  });
};
