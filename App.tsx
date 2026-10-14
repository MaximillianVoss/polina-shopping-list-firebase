import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { onValue, push, ref, remove, set, type Database, type Unsubscribe } from 'firebase/database';
import { currentUser } from './src/firebase';
import { readItems, shoppingInput, shoppingPath, type ShoppingItem } from './src/shopping';
import { styles } from './src/styles';

export default function App() {
  const session = useRef<{ uid: string; database: Database } | null>(null);
  const mutation = useRef(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let unsubscribe: Unsubscribe | undefined;
    setReady(false);
    setError('');
    setItems([]);
    async function connect() {
      try {
        const next = await currentUser();
        if (!active) return;
        session.current = next;
        unsubscribe = onValue(ref(next.database, shoppingPath(next.uid)), (snapshot) => {
          if (!active) return;
          try {
            setItems(readItems(snapshot.val()));
            setReady(true);
          } catch (cause) {
            setReady(false);
            setError(cause instanceof Error ? cause.message : 'Invalid data received.');
          }
        }, () => {
          if (!active) return;
          setReady(false);
          setError('Database access denied or connection failed. Check Authentication and Rules.');
        });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Firebase connection failed.');
      }
    }
    void connect();
    return () => { active = false; unsubscribe?.(); session.current = null; };
  }, [attempt]);

  async function change(action: (active: { uid: string; database: Database }) => Promise<void>) {
    if (!session.current || !ready || mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setError('');
    try {
      await action(session.current);
    } catch {
      setError('Save/delete failed. Check your network and database rules, then retry.');
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }

  async function save() {
    let input;
    try { input = shoppingInput(product, amount); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid input.');
      return;
    }
    await change(async ({ uid, database }) => {
      const itemRef = push(ref(database, shoppingPath(uid)));
      await set(itemRef, input);
      setProduct('');
      setAmount('');
    });
  }

  async function deleteItem(id: string) {
    await change(async ({ uid, database }) => {
      await remove(ref(database, shoppingPath(uid) + '/' + id));
    });
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Shopping list · Firebase</Text>
          <Text style={styles.hint}>Private list for this anonymous account. Changes arrive in real time.</Text>
          <TextInput accessibilityLabel="Product" placeholder="Product" style={styles.input}
            value={product} onChangeText={setProduct} editable={ready && !busy} maxLength={100} />
          <TextInput accessibilityLabel="Amount" placeholder="Amount, e.g. 5 kg" style={styles.input}
            value={amount} onChangeText={setAmount} editable={ready && !busy} maxLength={40} />
          <Button title={busy ? 'Saving…' : 'Save'} disabled={!ready || busy} onPress={() => { void save(); }} />
          {!ready && !error && <ActivityIndicator accessibilityLabel="Connecting to Firebase" />}
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {!ready && error !== '' && <Button title="Retry" onPress={() => setAttempt((value) => value + 1)} />}
          <FlatList data={items} keyExtractor={(item) => item.id}
            ListEmptyComponent={ready ? <Text style={styles.hint}>Your list is empty.</Text> : null}
            renderItem={({ item }) => (
              <View style={[styles.card, styles.row]}>
                <Text style={styles.label}>{item.product}, {item.amount}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={'Delete ' + item.product}
                  disabled={busy || !ready} onPress={() => { void deleteItem(item.id); }}>
                  <Text style={styles.link}>delete</Text>
                </Pressable>
              </View>
            )} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
