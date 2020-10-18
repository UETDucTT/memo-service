export const getUniqItemArray = (arr: any[]) => {
  return Array.from(new Set<any>(arr));
};
