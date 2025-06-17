import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authManager } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      // Verificar se temos dados de auth válidos no localStorage
      if (authManager.isAuthenticated()) {
        console.log("[Auth] Token expirado mas temos dados válidos, tentando renovar sessão");
        // Não redirecionar imediatamente, deixar o sistema tentar recuperar
        throw new Error("Token expired - attempting renewal");
      } else {
        console.log("[Auth] Sem dados de autenticação válidos, redirecionando");
        authManager.clearAuthData();
        window.location.href = '/auth';
        throw new Error("Session expired");
      }
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit & { body?: any },
): Promise<Response> {
  // Para uploads, verificar auth primeiro
  if (options?.method === 'POST' && options.body instanceof FormData) {
    const authCheck = await fetch('/api/auth/check', { credentials: 'include' });
    if (!authCheck.ok) {
      window.location.href = '/login';
      throw new Error("Authentication required");
    }
  }
  
  // Check if body is already a string (JSON) or needs to be stringified
  let processedBody: BodyInit | undefined;
  let contentType: string | undefined;
  
  if (options?.body) {
    if (options.body instanceof FormData) {
      // For FormData (file uploads), don't set Content-Type - let browser handle it
      processedBody = options.body;
      // Don't set contentType for FormData
    } else if (typeof options.body === 'string') {
      // Body is already a JSON string
      processedBody = options.body;
      contentType = "application/json";
    } else {
      // Body is an object, stringify it
      processedBody = JSON.stringify(options.body);
      contentType = "application/json";
    }
  }
  
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
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
      console.log(`[Debug] Fazendo requisição para: ${url}`);
      
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      
      // Handle redirects (auth issues) - return empty array instead of throwing
      if (res.status === 302) {
        console.log(`[Debug] Redirecionamento detectado em ${url} - retornando array vazio`);
        return []; // Always return empty array for redirects
      }
      
      console.log(`[Debug] Resposta da requisição ${url}: status=${res.status}`);

      if (res.status === 401) {
        console.log("[Debug] 401 detectado em", url);
        // Só redireciona se não estivermos já na página de auth
        if (!window.location.pathname.includes('/auth')) {
          console.log("[Debug] Redirecionando para /auth");
          window.location.replace('/auth');
          throw new Error('Unauthorized - redirecting to auth');
        }
        console.log("[Debug] Já na página de auth, retornando array vazio");
        return [];
      }
      
      if (!res.ok) {
        console.log(`[Debug] Erro ${res.status} em ${url} - retornando array vazio`);
        return []; // Return empty array for any non-ok status
      }

      const data = await res.json();
      console.log(`[Debug] Dados recebidos de ${url}:`, data);
      return data;
    } catch (error) {
      console.log(`[Debug] Erro de rede em ${queryKey[0]} - retornando array vazio:`, error);
      return []; // Return empty array on any network error
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Changed to returnNull to prevent errors
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
