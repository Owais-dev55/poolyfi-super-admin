export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (
    data?.message === "Token expired" ||
    data?.message === "User logged out"
  ) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return data;
};
