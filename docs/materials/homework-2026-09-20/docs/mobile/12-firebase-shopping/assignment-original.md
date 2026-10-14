# Assignment 12 (Shopping list with Firebase)

Источник: [скриншот задания](../../../sources/mobile/Screenshot 2026-09-18 at 14.13.01.png).

## Original assignment — English

Create shopping list app using Firebase realtime database. Implement also delete functionality.

The simplest way to delete data is to call **remove()** on a reference (contains key of an item) to the location of that data. See more from the firebase documentation.

На картинке поля Product, Amount, кнопка SAVE и список Shopping list с delete у каждой строки.

## Что требуется

1. Shopping list на React Native/Expo.
2. Использовать именно **Firebase Realtime Database**, не Firestore.
3. Добавлять и отображать покупки.
4. Удалять покупку по её уникальному ключу, вызвав `remove()` для ссылки на эту запись.

Анонимная аутентификация, личный путь пользователя и закрытые Rules — защитные улучшения этого решения. Их нет в исходном минимальном условии, но открывать общую базу всему интернету для задания не требуется.

Готовый исходник не содержит чужих ключей или действующего проекта Firebase. Ученик подключает собственный проект вручную; внешняя база автоматически не создаётся и не изменяется.

[Подробное решение](MANUAL.md) · [Код](../../../../../..)
