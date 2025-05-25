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
      // Solução: Não enviar diretamente o objeto, mas sim enviar o corpo como string JSON
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paid }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status de pagamento foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      // Também invalidar o evento para atualizar o valor total de despesas
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

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleAddSuccess = () => {
    handleCloseForm();
    if (onAddSuccess) {
      onAddSuccess();
    }
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta despesa?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const updatePaidStatusMutation = useMutation({
    mutationFn: async ({ id, paid }: { id: number; paid: boolean }) => {
      return await apiRequest(`/api/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ paid }),
      });
    },
    onSuccess: () => {
      // Importante: invalidar as consultas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      
      toast({
        title: "Status atualizado",
        description: "O status de pagamento foi atualizado com sucesso."
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status de pagamento.",
        variant: "destructive"
      });
    },
  });

  const handleTogglePaidStatus = (expense: Expense) => {
    updatePaidStatusMutation.mutate({ id: expense.id, paid: !expense.paid });
  };

  const getCategoryLabel = (categoryValue: string | undefined): string => {
    if (!categoryValue) return 'Não categorizado';
    const category = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Função para filtrar as despesas conforme os filtros aplicados
  const filteredExpenses = expenses.filter((expense) => {
    // Filtro por texto de busca
    const matchesSearch = searchTerm === '' || 
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por status (pago/pendente)
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'paid' && expense.paid) || 
      (statusFilter === 'pending' && !expense.paid);
    
    // Filtro por tipo (entrada/saída)
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'income' && expense.isIncome) || 
      (typeFilter === 'expense' && !expense.isIncome);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Cálculo do total de despesas e despesas pagas
  const totalIncome = expenses
    .filter(expense => expense.isIncome)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalExpenses = expenses
    .filter(expense => !expense.isIncome)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalPaid = expenses
    .filter(expense => expense.paid && !expense.isIncome)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalPending = totalExpenses - totalPaid;
  
  const balance = totalIncome - totalExpenses;

  if (isLoading) {
    return <div className="p-4 text-center">Carregando despesas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro ao carregar despesas.</div>;
  }

  return (
    <div className="space-y-4">
      {isFormOpen ? (
        <ExpenseForm 
          eventId={eventId} 
          expense={editingExpense}
          onClose={handleCloseForm}
          onSuccess={handleAddSuccess}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financeiro do Evento</h3>
            <Button onClick={() => handleOpenForm()} size="sm">
              <i className="fas fa-plus mr-2"></i> Novo Lançamento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-600/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Entradas</div>
                <div className="text-2xl font-bold text-green-500">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-600/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Saídas</div>
                <div className="text-2xl font-bold text-red-500">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-600/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Pendente</div>
                <div className="text-2xl font-bold text-amber-500">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-600/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Saldo</div>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Entradas</SelectItem>
                  <SelectItem value="expense">Saídas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Nenhuma despesa registrada para este evento.</p>
              <Button onClick={() => handleOpenForm()} variant="outline" className="mt-4">
                <i className="fas fa-plus mr-2"></i> Adicionar Primeira Despesa
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="font-medium">{expense.name}</div>
                        {expense.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {expense.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                      <TableCell>{expense.dueDate ? new Date(expense.dueDate).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          className={expense.isIncome ? 
                            "bg-transparent text-green-500 border border-green-500 rounded-full hover:bg-green-500 hover:text-white" : 
                            "bg-transparent text-red-500 border border-red-500 rounded-full hover:bg-red-500 hover:text-white"
                          }
                        >
                          {expense.isIncome ? 
                            <><i className="fas fa-arrow-up mr-1"></i> Entrada</> : 
                            <><i className="fas fa-arrow-down mr-1"></i> Saída</>
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={expense.paid ? 
                            "bg-green-500 text-white rounded-full hover:bg-green-600" : 
                            "bg-transparent text-amber-500 border border-amber-500 rounded-full hover:bg-amber-500 hover:text-white"
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
                            <i className={`fas fa-${expense.paid ? 'times' : 'check'} mr-1`}></i>
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