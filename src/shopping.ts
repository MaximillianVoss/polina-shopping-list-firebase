export type ShoppingInput = { product: string; amount: string };
export type ShoppingItem = ShoppingInput & { id: string };

export function shoppingInput(product: string, amount: string): ShoppingInput {
  const item = { product: product.trim(), amount: amount.trim() };
  if (!item.product || !item.amount) throw new Error('Enter both product and amount.');
  if (item.product.length > 100 || item.amount.length > 40) throw new Error('Product: max 100 characters. Amount: max 40.');
  return item;
}

export function shoppingPath(uid: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(uid)) throw new Error('Invalid user identifier.');
  return 'users/' + uid + '/shopping';
}

export function readItems(value: unknown): ShoppingItem[] {
  if (value === null) return [];
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid shopping data.');
  return Object.entries(value).map(([id, item]: [string, unknown]) => {
    if (!/^[A-Za-z0-9_-]+$/.test(id) || typeof item !== 'object' || item === null ||
        !('product' in item) || !('amount' in item) ||
        typeof item.product !== 'string' || typeof item.amount !== 'string') {
      throw new Error('Invalid shopping item. Check database rules and data.');
    }
    return { id, ...shoppingInput(item.product, item.amount) };
  });
}
