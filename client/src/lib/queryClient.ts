import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authManager } from "./auth";

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = authManager.getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit & { body?: any },
): Promise<Response> {
  let processedBody: BodyInit | undefined;
  let contentType: string | undefined;
  
  if (options?.body) {
    if (options.body instanceof FormData) {
      processedBody = options.body;
    } else if (typeof options.body === 'string') {
      processedBody = options.body;
      contentType = "application/json";
    } else {
      processedBody = JSON.stringify(options.body);
      contentType = "application/json";
    }
  }
  
  const makeRequest = async () => {
    return fetch(endpoint, {
      ...options,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: processedBody,
      credentials: "include",
    });
  };
  
  let res: Response;
  try {
    res = await makeRequest();
  } catch (err) {
    console.log("[apiRequest] Erro de rede (servidor pode estar reiniciando):", err);
    throw new NetworkError("Server temporarily unavailable");
  }
  
  if (res.status === 401) {
    console.log("[apiRequest] 401 recebido, tentando renovar token...");
    const refreshed = await authManager.refreshToken();
    if (refreshed) {
      console.log("[apiRequest] Token renovado, repetindo requisição...");
      res = await makeRequest();
    } else {
      console.log("[apiRequest] Não foi possível renovar token");
      throw new AuthError("Session expired");
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    let res: Response;
    try {
      res = await fetch(url, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          ...getAuthHeaders(),
        }
      });
    } catch (err) {
      console.log("[getQueryFn] Erro de rede (servidor pode estar reiniciando):", url);
      throw new NetworkError("Server temporarily unavailable");
    }

    if (res.status === 401) {
      console.log("[Auth] 401 em query, tentando renovar token...");
      const refreshed = await authManager.refreshToken();
      if (refreshed) {
        try {
          const newRes = await fetch(url, {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache",
              ...getAuthHeaders(),
            }
          });
          if (newRes.ok) {
            return await newRes.json();
          }
        } catch {
          throw new NetworkError("Server temporarily unavailable after token refresh");
        }
      }
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw new AuthError('Unauthorized');
    }
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  };

function isTransientError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof AuthError) return false;
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.startsWith('5') || msg.includes('fetch') || msg.includes('network') || msg.includes('unavailable')) return true;
  }
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        if (error instanceof AuthError) return false;
        if (isTransientError(error) && failureCount < 3) return true;
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
    },
  },
});
