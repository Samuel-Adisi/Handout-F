import axios from "axios";

const api = axios.create({
  baseURL: "https://handout.pythonanywhere.com/api",
});

// attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Don't intercept auth endpoints — let errors reach the component
    if (
      original.url.includes("/accounts/login/") ||
      original.url.includes("/accounts/register/")
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        const { data } = await axios.post(
          "https://handout.pythonanywhere.com/api/accounts/refresh/",
          { refresh }
        );
        localStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axios(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;