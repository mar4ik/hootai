🧠 PRD: Hoot.ai — Core MVP
🎯 Цель продукта
Автоматический UX/AI-аудит сайтов и продуктовых CSV-файлов без кода. Пользователь получает понятные улучшения для своего интерфейса.

🧩 Основные фичи для MVP
1. 📂 Загрузка данных
CSV, PDF, или URL сайта

Валидация файла/ссылки

Поддержка drag & drop (позже)

2. 🔍 AI-Анализ
Анализ CSV или сайта через ai-sdk

Извлечение:

UX паттернов

проблем (навигация, иерархия, clarity)

AI-подсказки на базе best practices

3. 📊 Отображение результатов
Summary → Key issues

Структурированные блоки: Observation + Impact

Возможность «Start over»

4. 💾 Авторизация и история
Supabase auth

История загрузок и анализов (по желанию)

🏗 Архитектура и стек
Компонент	Инструменты/Библиотеки
Frontend	Next.js, Tailwind (v0.dev стилистика), React 19
Backend	API Routes (Edge/Node), ai-sdk
Auth/Storage	Supabase
Деплой	Vercel
AI-интеграция	ai-sdk
Анализ CSV/URL	Внутренние функции с fetch / csv-parser
Память (опционально)	Supabase KV или Zep

📋 Задачи (Vertical Slice)
📦 Блок 1: UI + Upload
 Страница загрузки (в стиле v0.dev)

 Компонент загрузки файла / ввода URL

 Состояние загрузки (pending, success, error)

🧠 Блок 2: AI Pipeline
 Хендлер загрузки файла

 Обработка CSV → JSON

 Анализ URL (fetch + parse DOM)

 Вызов ai-sdk с промптом анализа

 Ответ в виде структурированного summary

📈 Блок 3: Вывод результатов
 Страница с результатами

 Компоненты под заголовки, issues

 Кнопка «Start over»

🔐 Блок 4: Авторизация
 Supabase auth (email + magic link)

 Сохранение истории загрузок (opt-in)