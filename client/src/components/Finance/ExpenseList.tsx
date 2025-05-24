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
      return await apiRequest(`/api/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ paid }),
      });
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

  const handleTogglePaidStatus = (expense: Expense) => {
    updatePaidStatusMutation.mutate({ id: expense.id, paid: !expense.paid });
  };

  const getCategoryLabel = (categoryValue: string | undefined): string => {
    if (!categoryValue) return 'Não categorizado';
    const category = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Cálculo do total de despesas e despesas pagas
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = expenses
    .filter(expense => expense.paid)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = totalExpenses - totalPaid;

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total de Despesas</div>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Pago</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Pendente</div>
                <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</div>
              </CardContent>
            </Card>
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
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
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
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={expense.paid ? "default" : "outline"}
                          className={expense.paid ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}
                        >
                          {expense.paid ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant={expense.paid ? "outline" : "default"} 
                            size="sm"
                            className={expense.paid ? "border-green-200 text-green-700 hover:bg-green-50" : "bg-green-100 text-green-700 hover:bg-green-200 border-0"}
                            onClick={() => handleTogglePaidStatus(expense)}
                          >
                            <i className={`fas fa-${expense.paid ? 'times' : 'check'} mr-1`}></i>
                            {expense.paid ? "Desmarcar" : "Marcar pago"}
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