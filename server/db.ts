import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSockets for Neon serverless
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Otimizando as configurações do pool para reduzir problemas de limite de conexão
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // limite máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo para fechar conexões inativas (30s)
  connectionTimeoutMillis: 5000, // tempo máximo para estabelecer conexão (5s)
  maxUses: 100, // número máximo de vezes que uma conexão pode ser usada antes de ser fechada
});

// Create a Drizzle ORM instance
export const db = drizzle({ client: pool, schema });

// Função auxiliar para executar queries com retry
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Se for um erro de rate limit, aguarde antes de tentar novamente
      if (error.message?.includes('rate limit') || error.message?.includes('Control plane request failed')) {
        if (attempt < maxRetries) {
          console.log(`Retrying database operation after error: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
          continue;
        }
      } else {
        // Se não for um erro de rate limit, não tente novamente
        break;
      }
    }
  }
  
  throw lastError;
}
