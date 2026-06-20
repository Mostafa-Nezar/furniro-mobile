const API_BASE_URL = "https://furniro-back-production.up.railway.app/api";

export const fetchInstance = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData
    ? {}
    : {
      "Content-Type": "application/json",
    };

  const finalOptions = {
    ...options,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.msg || "Unknown error");
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
};
