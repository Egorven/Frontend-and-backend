import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";


export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshInFlight = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    // 401 от защищённых маршрутов (accessToken протух/битый/отсутствует)
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Нечем обновлять → пользователь должен залогиниться заново
        clearTokens();
        return Promise.reject(error);
      }

      try {
        // Чтобы не стрелять refresh-запросами параллельно, используем один общий промис
        if (!refreshInFlight) {

          refreshInFlight = api
 .post("/auth/refresh", { refreshToken })  // ← Токен в теле запроса
  .then((r) => r.data)
  .finally(() => {
    refreshInFlight = null;
  });
        }

        // tokens = { accessToken, refreshToken }
        const tokens = await refreshInFlight;
        setTokens(tokens);

        // Повторяем исходный запрос уже с новым accessToken
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // refresh не сработал → чистим токены и "отдаём" ошибку наверх
        clearTokens();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);