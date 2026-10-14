import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shoppingInput, shoppingPath, readItems } from '../src/shopping.ts';

test('validates and trims new shopping input', () => {
  assert.deepEqual(shoppingInput(' Milk ', ' 3 litres '), { product: 'Milk', amount: '3 litres' });
  assert.throws(() => shoppingInput('', '1'));
  assert.throws(() => shoppingInput('Milk', 'x'.repeat(41)));
});
test('uses the authenticated user as the owner of the list', () => {
  assert.equal(shoppingPath('user_123'), 'users/user_123/shopping');
  for (const id of ['', '../another', 'user/x', 'user.id']) assert.throws(() => shoppingPath(id));
});
test('reads realtime snapshots without losing Firebase item keys', () => {
  assert.deepEqual(readItems(null), []);
  assert.deepEqual(readItems({ '-Ab12': { product: 'Milk', amount: '3 litres' } }),
    [{ id: '-Ab12', product: 'Milk', amount: '3 litres' }]);
  assert.throws(() => readItems({ broken: { product: 15, amount: '1' } }));
});
test('rules deny public access and scope reads/writes to auth.uid (static check only)', () => {
  const rules = JSON.parse(readFileSync(new URL('../database.rules.json', import.meta.url), 'utf8')).rules;
  assert.equal(rules['.read'], false);
  assert.equal(rules['.write'], false);
  const shopping = rules.users.$uid.shopping;
  assert.equal(shopping['.read'], 'auth != null && auth.uid === $uid');
  assert.equal(shopping.$itemId['.write'], 'auth != null && auth.uid === $uid');
  assert.equal(shopping.$itemId.$other['.validate'], false);
});
