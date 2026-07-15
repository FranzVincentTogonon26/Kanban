import axios from "axios";

const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors to a readable message; bounce to login on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (!location.pathname.startsWith("/login")) location.assign("/login");
    }
    return Promise.reject(error.response?.data);
  },
);

export const authApi = {
  login: (data) =>
    api.post("/auth/login", data).then((response) => response.data),
  register: (data) =>
    api.post("/auth/register", data).then((response) => response.data),
  me: () => api.get("/auth/me").then((response) => response.data.user),
};

export const boardApi = {
  list: () => api.get("/boards").then((response) => response.data.boards),
  create: (data) =>
    api.post("/boards", data).then((response) => response.data.board),
  get: (id) => api.get(`/boards/${id}`).then((response) => response.data),
  activity: (id, limit = 30) =>
    api
      .get(`/boards/${id}/activity`, { params: { limit } })
      .then((response) => response.data.activities),
  addMember: (id, data) =>
    api
      .post(`/boards/${id}/members`, data)
      .then((response) => response.data.member),
  removeMember: (id, userId) =>
    api
      .delete(`/boards/${id}/members/${userId}`)
      .then((response) => response.data),
};
