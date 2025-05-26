import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit & { body?: any },
): Promise<Response> {
  // Check if body is already a string (JSON) or needs to be stringified
  let processedBody: BodyInit | undefined;
  let contentType: string | undefined;
  
  if (options?.body) {
    if (typeof options.body === 'string') {
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
      
      console.log(`[Debug] Resposta da requisição ${url}: status=${res.status}`);

      if (res.status === 401) {
        console.error("[Debug] Unauthorized access:", url);
        if (unauthorizedBehavior === "returnNull") {
          console.log("[Debug] Retornando null devido a política 'returnNull' para 401");
          return null;
        } else {
          console.log("[Debug] Lançando erro devido a política 'throw' para 401");
          throw new Error("Unauthorized: Sessão expirada ou usuário não autenticado");
        }
      }
      
      if (!res.ok) {
        console.error(`[Debug] Erro na requisição ${url}: status=${res.status}`);
        // Clone de resposta para ler o corpo
        const clonedRes = res.clone();
        try {
          const errorBody = await clonedRes.text();
          console.error(`[Debug] Corpo do erro: ${errorBody}`);
        } catch (e) {
          console.error(`[Debug] Não foi possível ler corpo do erro: ${e}`);
        }
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`[Debug] Dados recebidos de ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`[Debug] Erro ao processar ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
