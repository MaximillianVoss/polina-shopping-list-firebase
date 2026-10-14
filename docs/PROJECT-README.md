# 12 · Shopping list with Firebase

Добавление, realtime-список и удаление покупки через remove() в Firebase Realtime Database.

- [Исходное задание](materials/homework-2026-09-20/docs/mobile/12-firebase-shopping/assignment-original.md)
- [Полная инструкция, теория, листинги, проверки](materials/homework-2026-09-20/docs/mobile/12-firebase-shopping/MANUAL.md)

Это Expo TypeScript, запуск на телефоне/нативном симуляторе, не Vite и не обычная web-страница.

Если взят весь комплект: `cd projects/mobile && npm ci`, затем `cd 12-firebase-shopping`.
Если скопирована только эта папка: `npm install` (создаст локальный lock).

```bash
npm run typecheck
npm test
npm start
```

Для Android/iOS bundle: npm run bundle:android / npm run bundle:ios. Это не APK/IPA.

Перед запуском подключите свою Firebase через .env.example и закрытые database.rules.json; полный порядок в инструкции. Реальное облако и эмулятор Firebase ещё не проверены.
