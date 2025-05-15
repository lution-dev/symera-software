import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to display in a human-readable format
export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format task due date with relative time indicator
export function formatTaskDueDate(date: string | Date | undefined) {
  if (!date) return '';
  
  const dueDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format the date
  const formattedDate = dueDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // Add relative time indicator
  if (diffDays < 0) {
    return `${formattedDate} (Atrasado há ${Math.abs(diffDays)} dias)`;
  } else if (diffDays === 0) {
    return `${formattedDate} (Hoje)`;
  } else if (diffDays === 1) {
    return `${formattedDate} (Amanhã)`;
  } else if (diffDays <= 7) {
    return `${formattedDate} (Em ${diffDays} dias)`;
  }
  
  return formattedDate;
}

// Format timestamp for activity feeds
export function formatActivityTimestamp(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min atrás`;
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`;
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  }
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short'
  });
}

// Calculate progress percentage based on completed tasks
export function calculateTaskProgress(tasks: Array<{ status: string }>) {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === 'completed');
  return Math.round((completedTasks.length / tasks.length) * 100);
}

// Format currency values
export function formatCurrency(value: number | undefined) {
  if (value === undefined) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Get color class for task priority
export function getTaskPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-500 bg-red-100';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100';
    case 'low':
      return 'text-green-700 bg-green-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
}

// Get color class for task status
export function getTaskStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-700 bg-green-100';
    case 'in_progress':
      return 'text-blue-700 bg-blue-100';
    case 'todo':
      return 'text-gray-700 bg-gray-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
}

// Get event type display label
export function getEventTypeLabel(type: string) {
  const types: Record<string, string> = {
    'wedding': 'Casamento',
    'birthday': 'Aniversário',
    'corporate': 'Corporativo',
    'conference': 'Conferência',
    'social': 'Social',
    'other': 'Outro'
  };
  
  return types[type] || 'Evento';
}

// Get initials from name for avatars
export function getInitials(name: string) {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Gerar URL de imagem de perfil para usuários que não possuem foto
export function generateProfileImageUrl(name: string) {
  // Usar o serviço UI Avatars para gerar uma imagem
  if (!name || name.trim() === '') {
    return 'https://ui-avatars.com/api/?name=User&background=random';
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}
