[English version](README.md)

# Radiova — Збірки браузерного розширення

Radiova — це браузерне розширення, яке [короткий опис — має додати власник проєкту].

Цей репозиторій містить **готові до встановлення, зібрані та підписані** пакети браузерного розширення Radiova для Chromium-браузерів і Firefox.

> **Увага:** Цей репозиторій містить **тільки готові збірки**. Вихідний код знаходиться в приватному репозиторії.

---

## Статус проєкту

**Активна розробка.** Інформацію про останній стабільний реліз дивіться в [releases](releases/).

---

## Підтримувані браузери

| Браузер   | На основі     | Пакет                                       |
|-----------|---------------|---------------------------------------------|
| Chrome    | Chromium      | `radiova-chrome-v*.zip`                     |
| Edge      | Chromium      | `radiova-edge-v*.zip`                       |
| Brave     | Chromium      | `radiova-brave-v*.zip`                      |
| Opera     | Chromium      | `radiova-opera-v*.zip`                      |
| Vivaldi   | Chromium      | `radiova-vivaldi-v*.zip`                    |
| Firefox   | Gecko         | `radiova-firefox-v*.zip`                    |

---

## Останній реліз

| Браузер | Завантаження | SHA-256 контр. сума |
|---------|--------------|---------------------|
| Chrome  | —            | —                   |
| Edge    | —            | —                   |
| Brave   | —            | —                   |
| Opera   | —            | —                   |
| Vivaldi | —            | —                   |
| Firefox | —            | —                   |

> Повний список версій дивіться в [releases/](releases/).

---

## Ручне встановлення

### Chrome, Edge, Brave, Opera, Vivaldi

1. Завантажте ZIP-файл для вашого браузера зі сторінки [releases](releases/).
2. Розпакуйте архів у локальну теку.
3. Відкрийте браузер і перейдіть на сторінку розширень:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
   - Vivaldi: `vivaldi://extensions`
4. Увімкніть **Режим розробника** (перемикач у правому верхньому куті).
5. Натисніть **Завантажити розпаковане** й оберіть теку з розпакованими файлами.
6. Розширення встановлено.

### Firefox

1. Завантажте `radiova-firefox-v*.zip` зі сторінки [releases](releases/).
2. Перейдіть на `about:addons` у Firefox.
3. Натисніть на іконку шестірні → **Встановити доповнення з файлу...**
4. Виберіть ZIP-файл.
5. Підтвердьте встановлення.

Також можна встановити підписану версію з [Firefox Add-ons (AMO)](https://addons.mozilla.org) (посилання буде додано після публікації).

---

## Перевірка контрольної суми

Кожен реліз містить файл `SHA256SUMS.txt`. Щоб перевірити цілісність:

### Windows (PowerShell)
```powershell
Get-FileHash -Algorithm SHA256 radiova-chrome-v1.0.0.zip
```
Порівняйте результат із контрольною сумою у `SHA256SUMS.txt`.

### Linux / macOS
```sh
sha256sum -c SHA256SUMS.txt
```

---

## Структура директорій

```
radiova-extension-builds/
├── releases/                  # Версійні пакети релізів
├── checksums/                 # Архіви контрольних сум
├── browsers/                  # Метадані для кожного браузера
├── assets/                    # Іконки, скріншоти, брендинг
├── scripts/                   # Інструменти автоматизації та валідації
│   ├── prepare-release.mjs    # Повний пайплайн підготовки релізу
│   ├── generate-checksums.mjs # Генерація SHA-256 контрольних сум
│   ├── validate-release.mjs   # Валідація релізу
│   ├── update-latest.mjs      # Оновлення latest.json
│   └── release-utils.mjs      # Спільні утиліти
├── latest.json                # Метадані останньої версії (використовує radiova-app.github.io)
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Оновлення

Нові версії публікуються в папці [releases/](releases/). Слідкуйте за оновленнями через цей репозиторій.

---

## Підтримка

Якщо ви знайшли помилку або маєте пропозицію, будь ласка, створіть issue у [трекері](https://github.com/radiova-app/radiova-extension-builds/issues) (посилання буде створено).

---

## Безпека

Дивіться [SECURITY.md](SECURITY.md) для інструкцій щодо повідомлення про вразливості.

---

## Ліцензія

Вміст цього репозиторію поширюється згідно з ліцензією, визначеною у файлі [LICENSE](LICENSE). Власник проєкту має визначити відповідну ліцензію перед першим публічним релізом.

---

## Підготовка релізу

### Як створити новий реліз

1. Зберіть розширення в приватному проєкті:
   ```sh
   cd ../radiova-platform-private
   pnpm build:extension
   ```

2. Підготуйте реліз у цьому репозиторії:
   ```sh
   cd ../radiova-extension-builds
   npm run prepare:release -- v1.0.0
   ```

3. Перегляньте release notes у `releases/v1.0.0/release-notes.md` і `releases/v1.0.0/release-notes.uk.md`.

4. Перевірте `latest.json` — він має містити нову версію.

5. Створіть Git tag і GitHub Release.

### Повторна перевірка існуючого релізу

```sh
npm run release:check -- releases/v1.0.0
```

### Створення GitHub Release

Після підготовки релізу та коміту:

1. Tag: `git tag v1.0.0`
2. Push: `git push --tags`
3. На GitHub створіть новий Release:
   - **Tag:** `v1.0.0`
   - **Title:** `Radiova v1.0.0`
   - **Опис:** використовуйте вміст `releases/v1.0.0/release-notes.md`
   - Додайте посилання на українські нотатки: `[Українські нотатки](releases/v1.0.0/release-notes.uk.md)`
4. Прикріпіть до Release:
   - Усі `radiova-*-v1.0.0.zip` з директорій браузерів
   - Файли `SHA256SUMS.txt` з кожної директорії браузера
5. Опублікуйте Release.
