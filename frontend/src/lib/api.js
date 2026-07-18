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

export const userApi = {
  list: () => api.get("/users/list").then((response) => response.data.users),
  update: (userId, data) =>
    api
      .patch(`/users/${userId}`, { params: { data } })
      .then((response) => response.data.users),
  delete: (userId) =>
    api.delete(`/users/${userId}`).then((response) => response.data.users),
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
  update: (id, data) =>
    api.patch(`/boards/${id}`, data).then((response) => response.data.board),
  addMember: (id, data) =>
    api
      .post(`/boards/${id}/members`, data)
      .then((response) => response.data.member),
  removeMember: (id, userId) =>
    api
      .delete(`/boards/${id}/members/${userId}`)
      .then((response) => response.data),
  remove: (boardId) =>
    api.delete(`/boards/${boardId}`).then((response) => response.data),
};

export const aiApi = {
  generateTasks: (boardId, data) =>
    api
      .post(`/boards/${boardId}/ai/generate-tasks`, data)
      .then((response) => response.data),
  breakdown: (boardId, data) =>
    api
      .post(`/boards/${boardId}/ai/breakdown`, data)
      .then((response) => response.data.subtasks),
  summary: (boardId) =>
    api
      .post(`/boards/${boardId}/ai/summary`)
      .then((response) => response.data.summary),
};

export const columnApi = {
  create: (boardId, data) =>
    api
      .post(`/boards/${boardId}/columns`, data)
      .then((response) => response.data.column),
  update: (boardId, columnId, data) =>
    api
      .patch(`/boards/${boardId}/columns/${columnId}`, data)
      .then((response) => response.data.column),
  remove: (boardId, columnId) =>
    api
      .delete(`/boards/${boardId}/columns/${columnId}`)
      .then((response) => response.data),
};

export const taskApi = {
  list: (boardId, params) =>
    api
      .get(`/boards/${boardId}/tasks`, { params })
      .then((response) => response.data.tasks),
  create: (boardId, data) =>
    api
      .post(`/boards/${boardId}/tasks`, data)
      .then((response) => response.data.task),
  update: (boardId, taskId, data) =>
    api
      .patch(`/boards/${boardId}/tasks/${taskId}`, data)
      .then((response) => response.data.task),
  move: (boardId, taskId, data) =>
    api
      .patch(`/boards/${boardId}/tasks/${taskId}/move`, data)
      .then((response) => response.data.task),
  remove: (boardId, taskId) =>
    api
      .delete(`/boards/${boardId}/tasks/${taskId}`)
      .then((response) => response.data),
};
