"use strict";

/*
    CanavarHub API Service Layer
    Backend: http://localhost:5101/api
*/

let API_BASE = "https://localhost:7139/api";
let ALT_API_BASE = "http://localhost:5101/api";

// ============ TOKEN MANAGEMENT ============

const TokenManager = {
  get() {
    return localStorage.getItem("canavarhub_token");
  },

  set(token) {
    localStorage.setItem("canavarhub_token", token);
  },

  remove() {
    localStorage.removeItem("canavarhub_token");
    localStorage.removeItem("canavarhub_user");
  },

  getUser() {
    const raw = localStorage.getItem("canavarhub_user");
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    localStorage.setItem("canavarhub_user", JSON.stringify(user));
  },

  isLoggedIn() {
    return !!this.get();
  },
};

// ============ HTTP HELPERS ============

async function apiRequest(endpoint, options = {}) {
  let url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = TokenManager.get();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // If HTTPS fails (e.g. self-signed certificate untrusted), attempt HTTP fallback port 5101
    try {
      url = `${ALT_API_BASE}${endpoint}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
      // Swap API_BASE so future calls use working port
      const temp = API_BASE;
      API_BASE = ALT_API_BASE;
      ALT_API_BASE = temp;
    } catch (fallbackErr) {
      console.error("API xətası:", fallbackErr);
      return {
        ok: false,
        status: 0,
        data: { message: "Serverlə əlaqə qurulmadı. Backend işləyirmi?" },
      };
    }
  }

  if (response.status === 401) {
    TokenManager.remove();
    return { ok: false, status: 401, data: { message: "Sessiya bitib. Yenidən daxil olun." } };
  }

  const data = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

// ============ AUTH SERVICE ============

const AuthService = {
  async login(email, password) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(fullName, email, password) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  async getMe() {
    return apiRequest("/auth/me");
  },

  logout() {
    TokenManager.remove();
  },

  isLoggedIn() {
    return TokenManager.isLoggedIn();
  },

  getToken() {
    return TokenManager.get();
  },

  getUser() {
    return TokenManager.getUser();
  },

  saveAuth(data) {
    TokenManager.set(data.token);
    TokenManager.setUser({
      email: data.email,
      fullName: data.fullName,
      roles: data.roles,
    });
  },
};

// ============ MODULES SERVICE ============

const ModulesService = {
  async getAll() {
    return apiRequest("/modules");
  },

  async getBySlug(slug) {
    return apiRequest(`/modules/${slug}`);
  },

  async getLevels(slug) {
    return apiRequest(`/modules/${slug}/levels`);
  },
};

// ============ QUESTIONS SERVICE ============

const QuestionsService = {
  async getByModuleAndLevel(slug, levelCode) {
    return apiRequest(`/questions/module/${slug}/level/${levelCode}`);
  },

  async getById(id) {
    return apiRequest(`/questions/${id}`);
  },
};

// ============ PROGRESS SERVICE ============

const ProgressService = {
  async getMyProgress() {
    return apiRequest("/progress");
  },

  async submitAnswer(questionId, selectedOptionIndex) {
    return apiRequest("/progress/answer", {
      method: "POST",
      body: JSON.stringify({ questionId, selectedOptionIndex }),
    });
  },
};
