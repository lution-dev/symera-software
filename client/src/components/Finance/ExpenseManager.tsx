import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ExpenseFormWorking } from './ExpenseFormWorking';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseManagerProps {
  eventId: number;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ eventId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados do componente - usando useCallback para evitar re-renders
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Query para buscar despesas
  const { data: expensesResponse = [], isLoading, isError, error } = useQuery({
    queryKey: [`/api/events/${eventId}/expenses`],
    enabled: !!eventId,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Garantir que expenses seja sempre um array
  const expenses = Array.isArray(expensesResponse) ? expensesResponse : [];
  
  // Debug: verificar dados recebidos
  console.log('[ExpenseManager] Dados recebidos:', { 
    expensesResponse, 
    expenses, 
    isLoading, 
    isError,
    length: expenses.length 
  });

  // Handlers com useCallback para evitar re-renders
  const handleOpenForm = useCallback((expense?: any) => {
    console.log('[ExpenseManager] Abrindo formulário', { expense });
    setEditingExpense(expense || null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    console.log('[ExpenseManager] Fechando formulário');
    setIsFormOpen(false);
    setEditingExpense(null);
  }, []);

  const handleAddSuccess = useCallback(() => {
    console.log('[ExpenseManager] Despesa adicionada com sucesso');
    queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
    handleCloseForm();
    toast({
      title: "Sucesso!",
      description: "Lançamento financeiro salvo com sucesso.",
    });
  }, [queryClient, eventId, toast, handleCloseForm]);

  // Mutação para excluir despesa
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/events/${eventId}/expenses/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir despesa:", error);
      toast({
        title: "Erro!",
        description: "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
    },
  });

  // Filtros
  const filteredExpenses = expenses.filter((expense: any) => {
    const matchesSearch = expense.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && expense.paid) ||
                         (statusFilter === 'pending' && !expense.paid);
    const matchesType = typeFilter === 'all' ||
                       (typeFilter === 'expense' && expense.amount < 0) ||
                       (typeFilter === 'income' && expense.amount > 0);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Mapeamento de categorias para português
  const categoryNames = {
    // Categorias de despesas
    'venue': 'Local e Espaço',
    'catering': 'Buffet e Alimentação',
    'decoration': 'Decoração e Flores',
    'entertainment': 'Entretenimento e Música',
    'photography': 'Fotografia e Vídeo',
    'photography_video': 'Fotografia e Vídeo',
    'staff': 'Equipe e Staff',
    'transportation': 'Transporte',
    'gifts': 'Brindes e Lembranças',
    'security': 'Segurança',
    'marketing': 'Divulgação e Mídia',
    'sound_lighting': 'Sonorização e Iluminação',
    'equipment_rental': 'Aluguel de Equipamentos',
    'licenses_taxes': 'Licenças e Taxas',
    'platform_software': 'Plataforma/Software',
    'accommodation_travel': 'Hospedagem e Viagem',
    'food_drinks': 'Alimentos e Bebidas',
    'graphic_materials': 'Materiais Gráficos',
    'contingency': 'Contingência',
    'other': 'Outros',
    
    // Categorias de receitas
    'client_payment': 'Pagamento de cliente',
    'sponsor': 'Patrocínio',
    'ticket_sales': 'Venda de ingressos',
    'donation': 'Doação',
    'reimbursement': 'Reembolso',
    
    // Categorias antigas (compatibilidade)
    'venue_space': 'Local e Espaço',
    'catering_food': 'Buffet e Alimentação',
    'decoration_flowers': 'Decoração e Flores',
    'entertainment_music': 'Entretenimento e Música',
    'marketing_promotion': 'Marketing e Promoção',
    'staff_services': 'Equipe e Serviços',
    'equipment_technology': 'Equipamentos e Tecnologia',
    'insurance_security': 'Seguro e Segurança',
    'miscellaneous': 'Diversos',
    'sponsors_revenue': 'Patrocinadores',
    'merchandise': 'Produtos',
    'other_income': 'Outras Receitas'
  };

  // Função para traduzir categoria
  const getCategoryName = (category: string) => {
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  // Cálculos (convertendo de centavos para reais)
  const totalExpenses = expenses.filter((e: any) => e.amount < 0).reduce((sum: number, e: any) => sum + Math.abs(e.amount), 0) / 100;
  const totalIncome = expenses.filter((e: any) => e.amount > 0).reduce((sum: number, e: any) => sum + e.amount, 0) / 100;
  const balance = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro ao carregar dados financeiros.</div>;
  }

  // Renderização condicional do formulário ou lista
  if (isFormOpen) {
    return (
      <div className="space-y-4">
        <ExpenseFormWorking 
          eventId={eventId} 
          expense={editingExpense}
          onClose={handleCloseForm}
          onSuccess={handleAddSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Lançamentos Financeiros</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleOpenForm()}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
          <Button 
            onClick={() => handleOpenForm({ type: 'expense' })}
            variant="outline"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
          <Button 
            onClick={() => handleOpenForm({ type: 'income' })}
            variant="outline"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Adicionar Recebimento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de lançamentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Histórico de Lançamentos ({filteredExpenses.length})</h3>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nenhum lançamento encontrado</p>
            <p className="text-sm mt-2">Clique em "Novo Lançamento" para adicionar o primeiro</p>
          </div>
        ) : (
          <div className="space-y-0 border rounded-lg overflow-hidden bg-card">
            {filteredExpenses.map((expense: any, index: number) => (
              <div 
                key={expense.id}
                className={`p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors ${
                  index % 2 === 0 ? 'bg-background/50' : 'bg-muted/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">{expense.name}</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={expense.paid ? "default" : "secondary"} className="text-xs">
                            {expense.paid ? "Pago" : "Pendente"}
                          </Badge>
                          {expense.category && (
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(expense.category)}
                            </Badge>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground">{expense.notes}</p>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <p className={`font-semibold text-lg ${expense.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {expense.amount < 0 ? '-' : '+'}R$ {(Math.abs(expense.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {expense.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Venc: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpenseMutation.mutate(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};