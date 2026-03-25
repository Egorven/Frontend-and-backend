Тема проекта: Создание магазина музыкальных инструментов с системой аутентификации и авторизации

Практическое занятие №7: Базовые методы аутентификации

Расположение:
Backend: backend/src/store/users.store.js, backend/src/routes/auth.js

Для чего используется в проекте:
1. Хеширование паролей (bcrypt)
2. Безопасное хранение паролей пользователей
3. Одностороннее шифрование с солью
4. Проверка паролей
5. Верификация учётных данных при входе
6. Регистрация пользователей
7. Вход в систему

Практическое занятие №8: JSON Web Token (JWT)

Для чего используется в проекте:
1. Генерация JWT токенов
2. Подпись токенов секретным ключом
3. Установка времени жизни (expiresIn)
4. Проверка токенов
5. Защищённые маршруты

Практическое занятие №9: Refresh-токены

Расположение:
Backend: backend/src/middleware/authJwt.js, backend/src/routes/auth.js
Frontend: frontend/src/api/apiClient.js

Для чего используется в проекте:
1. Разделение токенов:
Access token: короткоживущий (15 минут) - для доступа к API
Refresh token: долгоживущий (7 дней) - для обновления access token
2. Хранение refresh-токенов (backend/src/routes/auth.js - refreshTokens = new Set())
3. Серверное хранилище активных refresh-токенов
4. Обновление пары токенов

Практическое занятие №10: Хранение токенов на фронтенде

Расположение:
Frontend: frontend/src/api/apiClient.js, frontend/src/context/AuthContext.jsx

Для чего используется в проекте:
1. localStorage для токенов
frontend/src/context/AuthContext.jsx - сохранение токенов после логина
localStorage.setItem('accessToken', token)
localStorage.setItem('refreshToken', refreshToken)

2. Axios Interceptors
Request interceptor: автоматическая подстановка access token
Response interceptor: обработка 401 ошибок и авто-рефреш

3. Безопасность
Очистка localStorage при выходе
Проверка токенов при загрузке приложения
Обработка истечения срока действия токенов

Практическое занятие №11: RBAC (Role-Based Access Control)
Расположение:
Backend: backend/src/middleware/checkRole.js, backend/src/store/users.store.js
Frontend: frontend/src/context/AuthContext.jsx, frontend/src/components/ProtectedRoute.jsx, frontend/src/components/RoleGuard.jsx

Для чего используется в проекте:
1. Система ролей
backend/src/store/users.store.js - константа ROLES = { USER, SELLER, ADMIN }

2. Middleware проверки ролей
backend/src/middleware/checkRole.js - функция checkRole(...allowedRoles)
Проверка роли пользователя перед доступом к маршруту
Возврат 403 Forbidden при недостаточных правах

3. Защита маршрутов на бэкенде/фронтенде

4. Управление пользователями (Admin)
GET /api/users - список всех пользователей
PUT /api/users/:id - редактирование данных и роли
DELETE /api/users/:id - блокировка пользователя

5. Контекст авторизации
Глобальный доступ к данным текущего пользователя
Проверка прав в любом компоненте