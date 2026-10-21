/**
 * Thin API service layer. All HTTP requests go through here so endpoints are
 * not scattered across components. Requests are relative; the Vite dev server
 * proxies /api to the local FastAPI backend.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown = undefined
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }
  return await response.text();
}

async function request<T>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(input.toString(), {
    ...init,
    headers,
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (body as { detail?: string })?.detail || response.statusText || "Request failed",
      body
    );
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};