
import type { Student, StudentFormData } from "../types/student";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(
      result.message ?? `Request failed (${response.status})`,
    );
  }

  if (result.data === undefined) {
    throw new Error("Unexpected API response");
  }

  return result.data;
}

export const studentApi = {
  getAll: () => request<Student[]>("/students"),

  create: (data: StudentFormData) =>
    request<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<StudentFormData>) =>
    request<Student>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/students/${id}`, {
      method: "DELETE",
    }),
};
