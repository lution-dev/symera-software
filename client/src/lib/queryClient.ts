import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authManager } from "./auth";

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
  
  let res = await makeRequest();
  
  // Se receber 401, tentar renovar token e repetir
  if (res.status === 401) {
    console.log("[apiRequest] 401 recebido, tentando renovar token...");
    const refreshed = await authManager.refreshToken();
    if (refreshed) {
      console.log("[apiRequest] Token renovado, repetindo requisição...");
      res = await makeRequest();
    } else {
      console.log("[apiRequest] Não foi possível renovar token");
      // Não redirecionar aqui - deixar ProtectedRoute cuidar do redirect
      throw new Error("Session expired");
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
        console.log("[Auth] 401 em query, tentando renovar token...");
        const refreshed = await authManager.refreshToken();
        if (refreshed) {
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
        }
        
        // Não redirecionar aqui - deixar ProtectedRoute cuidar
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new Error('Unauthorized');
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
