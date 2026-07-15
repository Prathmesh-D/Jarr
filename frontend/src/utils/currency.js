export const getCurrencySymbol = (currencyCode = 'USD') => {
  try {
    return (0).toLocaleString('en', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
  } catch (e) {
    return '$';
  }
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  } catch (e) {
    return `$${Number(amount).toFixed(2)}`;
  }
};
