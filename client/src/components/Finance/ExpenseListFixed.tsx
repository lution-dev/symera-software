import React, { useState, useEffect } from 'react';
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

interface ExpenseListProps {
  eventId: number;
  onAddSuccess?: () => void;
}

export const ExpenseListFixed: React.FC<ExpenseListProps> = ({ eventId, onAddSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar as despesas do evento diretamente
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!eventId) return;
      
      try {
        setIsLoading(true);
        console.log(`[ExpenseListFixed] Buscando despesas para evento ${eventId}`);
        const response = await apiRequest(`/api/events/${eventId}/expenses`);
        console.log(`[ExpenseListFixed] Despesas recebidas:`, response);
        
        // Garantir que sempre temos um array
        const validExpenses = Array.isArray(response) ? response : [];
        setExpenses(validExpenses);
        console.log(`[ExpenseListFixed] Total de despesas: ${validExpenses.length}`);
      } catch (err) {
        console.error('[ExpenseListFixed] Erro ao buscar despesas:', err);
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [eventId]);

  const handleOpenForm = (expense?: any) => {
    setEditingExpense(expense || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleAddSuccess = () => {
    handleCloseForm();
    // Recarregar despesas
    const fetchExpenses = async () => {
      try {
        const response = await apiRequest(`/api/events/${eventId}/expenses`);
        const validExpenses = Array.isArray(response) ? response : [];
        setExpenses(validExpenses);
      } catch (err) {
        console.error('Erro ao recarregar despesas:', err);
      }
    };
    fetchExpenses();
    
    if (onAddSuccess) {
      onAddSuccess();
    }
  };

  const getCategoryLabel = (categoryValue: string | undefined): string => {
    if (!categoryValue) return 'Não categorizado';
    const category = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Função para filtrar as despesas conforme os filtros aplicados
  const filteredExpenses = expenses.filter((expense: any) => {
    // Filtro por texto de busca
    const matchesSearch = searchTerm === '' || 
      expense.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenForm(expense)}
                            className="h-8 px-2"
                          >
                            <i className="fas fa-edit mr-1"></i> Editar
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

export default ExpenseListFixed;