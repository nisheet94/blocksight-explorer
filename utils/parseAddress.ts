export const parseAddress = (address: string): string => {
  if (!address) return '';

  const _address = address.split('x')[1];
  const firstThree = _address.substring(0, 3);
  const lastFour = _address.substr(-4);

  const end = firstThree.concat('...', lastFour);
  const start = '0x';

  return start.concat(end);
};
