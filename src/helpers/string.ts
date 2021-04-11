export const removeAccents = (str: string) => {
  if (!str) return str;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
