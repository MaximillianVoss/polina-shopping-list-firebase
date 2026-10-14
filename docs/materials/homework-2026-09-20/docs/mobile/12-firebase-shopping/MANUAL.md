# 12 · Shopping list with Firebase: от начала до сдачи

[Исходное задание целиком](assignment-original.md) · [Папка готового проекта](../../../../../..)

## 1. Требования и результат

Добавление, realtime-список и удаление покупки через remove() в Firebase Realtime Database.

Новая запись появляется в Realtime Database в users/<uid>/shopping/<key>. onValue обновляет интерфейс при изменениях, delete удаляет ровно эту запись. Посторонний пользователь не может читать этот список.

Маршрут: сверить условие → открыть/создать Expo TypeScript → восстановить файлы → установить зависимости → проверить типы и логику → запустить на устройстве → пройти ручные сценарии → подготовить сдачу.

## 2. Минимум теории

Firebase Realtime Database — облачное JSON-дерево, не SQL и не Firestore. ref обозначает путь, push создаёт уникальный ключ, set записывает данные, onValue подписывается на изменения, remove удаляет узел. Доступ контролируется на сервере Database Rules; скрытого API-ключа в клиентском приложении недостаточно. Анонимный вход создаёт auth.uid без формы логина.

Для личного списка добавлена анонимная Authentication и сохранение учётной записи в AsyncStorage. Это улучшение безопасности сверх условия. После удаления данных приложения/переустановки анонимная идентичность может потеряться; прежний список не будет автоматически принадлежать новой. Для переноса между устройствами нужен отдельный нормальный вход/привязка аккаунта, в задание он не включён. Два независимых устройства получают разные UID и разные списки — это намеренно.

## 3. Среда и первый запуск на Mac

Используется согласованная связка Expo SDK 57, React 19.2.3, React Native 0.86.3, TypeScript 6.0.3; точные разрешённые версии зависимостей зафиксированы общим package-lock.json в projects/mobile. Node 24 выбран для одинакового запуска тестов, включая node:sqlite. Случайно обновлять один react-native отдельно от Expo не нужно.

Проверьте:

```bash
node --version
npm --version
# Если NVM уже установлен:
nvm install 24
nvm use 24
```

Нужен Expo Go, совместимый с SDK 57, на телефоне либо iOS Simulator (Xcode, только macOS) / Android Emulator (Android Studio). Компьютер и телефон должны видеть друг друга по сети. Готовые примеры намеренно настроены только на ios/android: браузер не является проверкой карты, GPS, SQLite и RN-персистентности Auth.

### Вариант A — весь комплект

Откройте терминал в корне нового комплекта. У всех четырёх проектов один workspace-lock, поэтому npm ci выполняется в projects/mobile:

```bash
cd projects/mobile
npm ci
cd 12-firebase-shopping
npm run typecheck
npm test
npm start
```

Отсканируйте QR в Expo Go. Для уже настроенного симулятора можно вместо последней команды выполнить npm run ios или npm run android. Не запускайте npm start одновременно в нескольких терминалах для одного проекта.

### Вариант B — только одна папка проекта

Скопируйте целиком projects/mobile/12-firebase-shopping в отдельный учебный каталог, откройте терминал внутри неё и выполните:

```bash
npm install
npm run typecheck
npm test
npm start
```

При отдельном копировании общего lock-файла нет: сначала npm install создаёт собственный package-lock.json. Команда npm ci допустима только после этого. Если уже работали в Classroom-репозитории, сначала сохраните свой исходный вариант; не заменяйте его файлы вслепую.

### Вариант C — восстановить с нуля вручную

[create-expo-app](https://docs.expo.dev/more/create-expo/) поддерживает blank-typescript и --no-install. Создавайте в новой пустой папке, не внутри существующего проекта:

```bash
npx create-expo-app@latest 12-firebase-shopping --template blank-typescript --no-install
cd 12-firebase-shopping
```

Затем замените package.json, app.json, tsconfig.json, index.ts и App.tsx полными версиями ниже, добавьте src/ и tests/, после чего npm install. Версии готового package.json возвращают пример к проверенной связке SDK57 даже если текущий шаблон уже обновился. Не переносите node_modules с Windows на Mac.

## 4. Реализация по этапам

### Этап 1. Каркас

Восстановите корневые файлы Expo, App.tsx, src/styles.ts, src/shopping.ts, src/firebase.ts и src/firebase-native.d.ts. Строго Realtime Database; не заменяйте её Firestore для этого задания.

### Этап 2. Собственный Firebase

В Firebase Console создайте отдельный учебный проект либо выберите свой учебный проект. Добавьте Web app: используется Firebase JS SDK. Не включайте Analytics, если оно не нужно. Условия тарифа/квоты проверьте в своей консоли; оплачиваемые ресурсы этот комплект автоматически не создаёт.

### Этап 3. Authentication

В разделе Authentication → Sign-in method разрешите Anonymous. Приложение сначала получает пользователя, только потом подписывается на его список.

### Этап 4. Realtime Database

Создайте Realtime Database в выбранном регионе в закрытом/production режиме. Скопируйте реальный URL из консоли: домен зависит от региона, его нельзя угадывать по projectId.

### Этап 5. Конфигурация

В папке 12-firebase-shopping выполните cp .env.example .env. Откройте .env в редакторе и замените все пять YOUR_ значений конфигурацией Web app. databaseURL берите именно из Realtime Database. Перезапустите Expo с npm start -- --clear. Файл .env не коммитьте.

### Этап 6. Правила

В Rules только своей отдельной учебной БД перенесите полный database.rules.json и нажмите Publish вручную. Не заменяйте этим файлом правила существующей рабочей базы с другими приложениями. В корне .read/.write=false; чтение списка и запись элемента разрешены только auth.uid === $uid. Validation ограничивает форму и длину данных, неизвестные поля запрещены.

### Этап 7. Проверка потока

Запустите приложение, дождитесь входа, добавьте Potatoes / 5 kg. В консоли найдите users/<uid>/shopping/<ключ>. Измените amount у этой записи в своей консоли: подписка onValue должна обновить экран. Затем delete — узел исчезает.

### Этап 8. Доказательство доступа

В Rules Playground/эмуляторе проверьте чтение без auth, другого uid, своего uid, невалидную запись и удаление. В этом комплекте автоматический тест Rules только статический: реальные Rules в Firebase/эмуляторе ещё нужно прогнать отдельно.

## 5. Что использовано и почему

| Функция / приём | Что делает | Почему здесь |
|---|---|---|
| services | Проверяет .env и инициализирует Firebase App/Auth/Database. | Ошибка конфигурации видна на экране, не как молчаливый пустой список. |
| initializeAuth / getReactNativePersistence | Сохраняет анонимную сессию в AsyncStorage. | Повторный обычный запуск использует тот же uid. |
| authStateReady / signInAnonymously | Ждёт восстановления старого входа либо создаёт нового пользователя. | Не создаём новый аккаунт на каждом рендере. |
| shoppingPath(uid) | Собирает users/<uid>/shopping и проверяет UID. | Путь не зависит от произвольного ввода. |
| onValue + unsubscribe | Слушает изменения и отписывается при unmount/retry. | Нет дублирующихся слушателей. |
| push + set | Получает ключ и записывает product/amount. | Ключ используется для стабильного удаления. |
| remove(ref(.../id)) | Удаляет конкретную запись из Realtime Database. | Это прямо запрошенная в задании функция. |
| readItems | Проверяет снимок unknown и сохраняет ключи. | Неверные данные не маскируются под рабочий список. |
| firebase-native.d.ts | Дополняет один отсутствующий RN-экспорт в типах Firebase12.19. | Реальный RN runtime экспортирует getReactNativePersistence; типы umbrella-пакета его не показывают. Здесь нет any/ts-ignore. |

Общие элементы: useState изменяет отображаемые данные; типы TypeScript обнаруживают несоответствия до запуска; SafeAreaView защищает содержимое от выреза экрана; StyleSheet.create описывает нативные стили; disabled не даёт отправить повторную операцию во время обработки. Promise возвращает будущий результат, поэтому нажатия вызывают void handler(), а ошибки обрабатываются внутри async-функции.

## 6. Проверка и ручные сценарии

```bash
npm run typecheck
npm test
npm run bundle:android
npm run bundle:ios
```

Экспорт создаёт JavaScript/Hermes bundle, **не APK/IPA и не готовую установку**. Он подтверждает совместимость импортов и сборки, но не работу физических датчиков/сервиса на телефоне.

4 теста: валидация формы, безопасный путь пользователя, чтение snapshot с ключами, статическая проверка закрытых Rules. Ни чужая, ни собственная облачная база не создавалась и не изменялась; Firebase Emulator Suite здесь не запускался. Реальный auth/realtime/offline/device сценарий остаётся ручным.

| Сценарий | Ожидаемый результат |
|---|---|
| Нет .env | Понятное Configure your own Firebase, приложение не падает. |
| Anonymous отключён | Ошибка входа; включить провайдер и Retry. |
| Save Milk / 3 litres | Запись видна в своём узле базы и в приложении. |
| Редактирование этой записи в своей консоли | onValue обновляет экран без кнопки перезагрузки. |
| Delete | Удалён правильный ключ, остальные записи сохранены. |
| Перезапуск без очистки приложения | Сохраняется анонимный uid и список. |
| Новый независимый клиент | Новый uid, пустой личный список, чужие покупки не доступны. |
| Rules: без auth / чужой uid | Чтение и запись запрещены. |
| Rules: свой uid, корректные поля / лишнее поле | Корректная запись разрешена, лишнее поле отклонено. |
| Отключить интернет | Не считать локальное изменение доказательством серверной записи; дождаться подтверждения после восстановления сети. |

## 7. Частые ошибки

permission-denied: проверьте путь users/<uid>/shopping, Anonymous и опубликованные Rules; не исправляйте проблему .read=true/.write=true. auth/operation-not-allowed: не включён Anonymous. Новая пустая база после reinstall: потерян старый анонимный UID; это не пропажа серверной записи. EXPO_PUBLIC_* входят в клиентский bundle и не являются серверными секретами. Service-account JSON, private_key и чужие ключи сюда запрещены. После изменения .env остановите Metro Ctrl+C и запустите снова.

Если «react/jsx-runtime not found»: убедитесь, что терминал открыт в нужном проекте, выполните установку зависимостей, выберите workspace TypeScript в редакторе и перезапустите TS Server. Если JSX содержит незакрытый тег — установка зависимостей это не исправит; сравните файл с полным листингом. Если Metro показывает старый вариант, остановите его Ctrl+C и выполните npm start -- --clear. Обычный Expo при Ctrl+C останавливает сервер, а не удаляет проект; старые скрипты создания здесь не используются.

## 8. Что показать при сдаче

1. Прочитать своё исходное условие и перечислить обязательные пункты.
2. Показать реальные исходники и объяснить поток данных по таблице выше.
3. Выполнить typecheck и тесты; не называть их телефонной проверкой.
4. Продемонстрировать основной сценарий и хотя бы одну обработанную ошибку на устройстве.
5. В репозиторий/архив включить исходники, конфигурацию и свой lock-файл, но не node_modules, .expo, dist и .env. Действия публикации/отправки выполняет сам ученик по правилам курса.

## 9. Полные авторские файлы

Далее приведено полное содержимое, без многоточий. package-lock.json не перепечатан: это автоматически сгенерированный файл фиксации зависимостей. Весь необходимый авторский код, конфигурация и тесты перечислены.

### package.json

```json
{
  "name": "homework-12-firebase-shopping",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-strip-types --test tests/*.test.ts",
    "bundle:android": "expo export --platform android --output-dir dist-android",
    "bundle:ios": "expo export --platform ios --output-dir dist-ios"
  },
  "dependencies": {
    "expo": "~57.0.24",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0",
    "firebase": "12.19.0",
    "@react-native-async-storage/async-storage": "2.2.0"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "engines": {
    "node": ">=24 <25"
  }
}
```

### app.json

```json
{
  "expo": {
    "name": "Shopping Firebase",
    "slug": "homework-12-firebase-shopping",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "platforms": [
      "ios",
      "android"
    ]
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "customConditions": [
      "react-native"
    ],
    "allowImportingTsExtensions": true
  },
  "include": [
    "App.tsx",
    "index.ts",
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
}
```

### index.ts

```ts
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

### App.tsx

```tsx
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
```

### .gitignore

```text
node_modules/
.expo/
dist*/
.env
.env.*
!.env.example
.DS_Store
```

### .nvmrc

```text
24
```

### .env.example

```text
# Copy to .env and fill from YOUR Firebase project's web-app settings.
# Client Firebase config is bundled into the app: it is not an access-control secret.
# Never put service-account JSON or private server credentials here.
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://YOUR_DATABASE_URL
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### database.rules.json

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "users": {
      "$uid": {
        "shopping": {
          ".read": "auth != null && auth.uid === $uid",
          "$itemId": {
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChildren(['product', 'amount'])",
            "product": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
            },
            "amount": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 40"
            },
            "$other": { ".validate": false }
          }
        }
      }
    }
  }
}
```

### src/firebase-native.d.ts

```ts
import type AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';

// Firebase 12.19 exports this function in its React Native runtime, but the
// umbrella firebase/auth declaration selects the platform-neutral type file.
// Describe that one missing public RN export without disabling type checking.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>,
  ): Persistence;
}
```

### src/firebase.ts

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Expo substitutes EXPO_PUBLIC_* at bundle time. These client values are not server secrets.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function services() {
  if (Object.values(config).some((value) => !value || value.includes('YOUR_'))) {
    throw new Error('Configure your own Firebase web app in .env, then restart Expo.');
  }
  if (!config.databaseURL?.startsWith('https://')) {
    throw new Error('Use the HTTPS Realtime Database URL from your Firebase console.');
  }
  const existing = getApps()[0];
  const app = existing ?? initializeApp(config);
  const auth = existing ? getAuth(app) : initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  return { auth, database: getDatabase(app) };
}

export async function currentUser() {
  const { auth, database } = services();
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return { uid: user.uid, database };
}
```

### src/shopping.ts

```ts
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
```

### src/styles.ts

```ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7fb' },
  content: { padding: 20, gap: 14, flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#14243b' },
  hint: { fontSize: 14, color: '#475569', lineHeight: 21 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#8a9cb4', borderRadius: 8, padding: 12, fontSize: 17 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 17, color: '#14243b', flexShrink: 1 },
  strong: { fontSize: 17, fontWeight: '700', color: '#14243b' },
  error: { color: '#a21b24', fontSize: 15, lineHeight: 21 },
  link: { color: '#1256aa', fontSize: 17, padding: 10 },
  map: { flex: 1, minHeight: 250, borderRadius: 12 },
});
```

### tests/shopping.test.ts

```ts
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
```
