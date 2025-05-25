import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from './ExpenseForm';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define as categorias de despesas
export const EXPENSE_CATEGORIES = [
  { value: 'venue', label: 'Local' },
  { value: 'catering', label: 'Buffet' },
  { value: 'decoration', label: 'Decoração' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'photography', label: 'Fotografia' },
  { value: 'staff', label: 'Equipe' },
  { value: 'transportation', label: 'Transporte' },
  { value: 'gifts', label: 'Brindes' },
  { value: 'other', label: 'Outros' },
];

interface Expense {
  id: number;
  eventId: number;
  name: string;
  amount: number;
  category?: string;
  dueDate?: string;
  paymentDate?: string;
  paid: boolean;
  notes?: string;
  vendorId?: number;
  isIncome?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseListProps {
  eventId: number;
  onAddSuccess?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ eventId, onAddSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Buscar as despesas do evento
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}/expenses`],
    enabled: !!eventId,
  });

  // Mutação para excluir uma despesa
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      // Também invalidar o evento para atualizar o valor total de despesas
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir despesa",
        description: "Ocorreu um erro ao excluir a despesa.",
        variant: "destructive",
      });
      console.error("Erro ao excluir despesa:", error);
    },
  });

  // Mutação para marcar despesa como paga/não paga
  const updatePaidStatusMutation = useMutation({
    mutationFn: async ({ id, paid }: { id: number; paid: boolean }) => {
      console.log(`Alterando status: ID=${id}, paid=${paid}`);
      // Fazer uma requisição direta sem usar apiRequest para evitar problemas de formatação
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paid }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status de pagamento foi atualizado com sucesso.",
      });
      // Forçar recarregar os dados para atualizar a UI
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status de pagamento.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar status:", error);
    },
  });

  const handleDeleteExpense = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta despesa?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const handleTogglePaidStatus = (expense: Expense) => {
    updatePaidStatusMutation.mutate({ id: expense.id, paid: !expense.paid });
  };

  const getCategoryLabel = (categoryValue: string | undefined): string => {
    if (!categoryValue) return 'Não categorizado';
    const category = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : 'Não categorizado';
  };

  const handleOpenForm = (expense: Expense | null = null) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    if (onAddSuccess) {
      onAddSuccess();
    }
  };

  // Filtrar despesas com base nos filtros aplicados
  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => {
    // Filtrar por termo de busca
    const matchesSearchTerm = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrar por status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && expense.paid) || 
      (statusFilter === 'pending' && !expense.paid);
    
    // Filtrar por tipo (despesa/receita)
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'expense' && !expense.isIncome) || 
      (typeFilter === 'income' && expense.isIncome);
    
    return matchesSearchTerm && matchesStatus && matchesType;
  }) : [];

  // Calcular totais
  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, expense) => 
    !expense.isIncome ? sum + expense.amount : sum, 0) : 0;
  
  const totalIncome = Array.isArray(expenses) ? expenses.reduce((sum, expense) => 
    expense.isIncome ? sum + expense.amount : sum, 0) : 0;
  
  const totalPending = Array.isArray(expenses) ? expenses.reduce((sum, expense) => 
    !expense.paid ? sum + expense.amount : sum, 0) : 0;

  return (
    <div className="space-y-4">
      {isFormOpen ? (
        <Card>
          <CardContent className="pt-6">
            <ExpenseForm 
              eventId={eventId} 
              expense={editingExpense}
              onCancel={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Buscar despesas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="paid">Pagos/Recebidos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => handleOpenForm()}>Novo Lançamento</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="bg-emerald-50 dark:bg-emerald-950">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Receitas</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-rose-50 dark:bg-rose-950">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Despesas</div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 dark:bg-amber-950">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Pendente</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalPending)}</div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando despesas...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Erro ao carregar despesas.</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">Nenhuma despesa encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="font-medium">{expense.name}</div>
                        {expense.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-[250px]">{expense.notes}</div>
                        )}
                      </TableCell>
                      <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                      <TableCell>
                        <span className={expense.isIncome ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-600 dark:text-rose-400 font-medium"}>
                          {expense.isIncome ? "+" : "-"}{formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={expense.paid ? "outline" : "default"}
                          className={expense.paid 
                            ? (expense.isIncome ? "border-emerald-500 text-emerald-500" : "border-blue-500 text-blue-500") 
                            : (expense.isIncome ? "bg-emerald-500 text-white" : "bg-orange-500 text-white")
                          }
                        >
                          {expense.paid ? 
                            (expense.isIncome ? "Recebido" : "Pago") : 
                            (expense.isIncome ? "A receber" : "A pagar")
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant={expense.paid ? "outline" : "default"} 
                            size="sm"
                            className={expense.paid ? "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white" : "bg-green-500 text-white hover:bg-green-600 border-0"}
                            onClick={() => handleTogglePaidStatus(expense)}
                          >
                            {expense.paid ? 
                              "Desmarcar" : 
                              (expense.isIncome ? "Marcar recebido" : "Marcar pago")
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenForm(expense)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            title="Excluir"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};