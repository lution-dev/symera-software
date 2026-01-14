import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authManager } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      console.log("[Auth] Não autorizado, redirecionando...");
      authManager.clearAuthData();
      window.location.href = '/auth';
      throw new Error("Session expired");
    }
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
  
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...getAuthHeaders(),
      ...options?.headers,
    },
    body: processedBody,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          ...getAuthHeaders(),
        }
      });

      if (res.status === 401) {
        if (!window.location.pathname.includes('/auth')) {
          authManager.clearAuthData();
          window.location.replace('/auth');
          throw new Error('Unauthorized - redirecting to auth');
        }
        return [];
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
