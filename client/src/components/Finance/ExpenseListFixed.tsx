import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ExpenseForm } from './ExpenseForm';

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'venue', label: 'Local' },
  { value: 'catering', label: 'Alimentação' },
  { value: 'decoration', label: 'Decoração' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'photography', label: 'Fotografia' },
  { value: 'transport', label: 'Transporte' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'staff', label: 'Pessoal' },
  { value: 'equipment', label: 'Equipamentos' },
  { value: 'materials', label: 'Materiais' },
  { value: 'contingency', label: 'Contingência' },
  { value: 'other', label: 'Outros' },
];

const getCategoryLabel = (category: string) => {
  const option = categoryOptions.find(opt => opt.value === category);
  return option ? option.label : category || 'Não categorizado';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

interface ExpenseListFixedProps {
  eventId: number;
  onAddSuccess?: () => void;
}

export const ExpenseListFixed: React.FC<ExpenseListFixedProps> = ({ eventId, onAddSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Buscar as despesas do evento
  const { data: expensesResponse = [], isLoading, error } = useQuery({
    queryKey: ['/api/events', eventId, 'expenses'],
    queryFn: async () => {
      console.log(`[ExpenseListFixed] Buscando despesas para evento ${eventId}`);
      try {
        const response = await apiRequest(`/api/events/${eventId}/expenses`);
        console.log(`[ExpenseListFixed] Despesas recebidas:`, response);
        return response;
      } catch (err) {
        console.error('[ExpenseListFixed] Erro ao buscar despesas:', err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Garantir que expenses seja sempre um array
  const expenses = Array.isArray(expensesResponse) ? expensesResponse : [];
  
  // Debug log para verificar os dados
  console.log(`[ExpenseListFixed] Total de despesas: ${expenses.length}`);
  console.log(`[ExpenseListFixed] Estado do formulário: isFormOpen=${isFormOpen}`);

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

  const handleOpenForm = (expense?: any) => {
    console.log('[ExpenseListFixed] handleOpenForm chamado', { expense, isFormOpen });
    setEditingExpense(expense || null);
    setIsFormOpen(true);
    console.log('[ExpenseListFixed] Estado atualizado - isFormOpen agora deve ser true');
    // Forçar re-render
    setTimeout(() => {
      console.log('[ExpenseListFixed] Verificando estado após timeout:', { isFormOpen });
    }, 100);
  };

  const handleCloseForm = () => {
    console.log('[ExpenseListFixed] handleCloseForm chamado');
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleAddSuccess = () => {
    console.log('[ExpenseListFixed] handleAddSuccess chamado');
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

  const handleTogglePaidStatus = async (expense: any) => {
    try {
      const newPaidStatus = !expense.paid;
      console.log(`Alterando status para: ${newPaidStatus ? 'pago' : 'não pago'}, ID: ${expense.id}`);
      
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          paid: newPaidStatus
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na resposta: ${response.status}`, errorText);
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Resposta do servidor:", data);
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      
      toast({
        title: "Status atualizado",
        description: "O status de pagamento foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status de pagamento.",
        variant: "destructive",
      });
    }
  };

  // Filtrar despesas baseado nos filtros
  const filteredExpenses = expenses.filter((expense: any) => {
    const matchesSearch = 
      expense.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'paid' && expense.paid) || 
      (statusFilter === 'pending' && !expense.paid);
    
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'income' && expense.isIncome) || 
      (typeFilter === 'expense' && !expense.isIncome);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Cálculo do total de despesas e despesas pagas
  const totalIncome = expenses
    .filter((expense: any) => expense.isIncome)
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  
  const totalExpenses = expenses
    .filter((expense: any) => !expense.isIncome)
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  
  const totalPaid = expenses
    .filter((expense: any) => expense.paid && !expense.isIncome)
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  
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
      {/* Debug info */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Debug: isFormOpen = {isFormOpen ? 'TRUE' : 'FALSE'}
      </div>
      
      {isFormOpen ? (
        <div className="bg-white border-2 border-green-500 p-4 rounded">
          <div className="text-lg text-green-600 mb-4 font-bold">✅ FORMULÁRIO FUNCIONANDO!</div>
          <div className="text-sm text-gray-600 mb-4">Estado confirmado: isFormOpen = TRUE</div>
          <Button onClick={handleCloseForm} variant="outline">
            Fechar Formulário de Teste
          </Button>
          <div className="mt-4">
            <ExpenseForm 
              eventId={eventId} 
              expense={editingExpense}
              onClose={handleCloseForm}
              onSuccess={handleAddSuccess}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financeiro do Evento</h3>
            <Button 
              onClick={() => {
                console.log('[ExpenseListFixed] Botão clicado!');
                handleOpenForm();
              }} 
              size="sm"
            >
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
                <div className="text-sm text-muted-foreground">Saldo</div>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-600/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Pendente</div>
                <div className="text-2xl font-bold text-amber-500">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Entradas</SelectItem>
                <SelectItem value="expense">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {expenses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <i className="fas fa-receipt text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação financeira</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece adicionando suas primeiras despesas ou recebimentos para este evento.
                  </p>
                  <Button onClick={() => handleOpenForm()}>
                    <i className="fas fa-plus mr-2"></i> Adicionar Primeiro Lançamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense: any) => (
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
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
};