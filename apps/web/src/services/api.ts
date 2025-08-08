import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "/api",
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao obter token:", error);
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado ou inválido
        console.log("Token expirado, redirecionando para login");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
);

export default api;
