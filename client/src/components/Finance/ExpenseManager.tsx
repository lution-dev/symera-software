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
    <div className="space-y-4 md:space-y-6">
      {/* Header com resumo financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Despesas</p>
                <p className="text-lg md:text-3xl font-bold text-red-600 truncate">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Receitas</p>
                <p className="text-lg md:text-3xl font-bold text-green-600 truncate">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Saldo</p>
                <p className={`text-lg md:text-3xl font-bold truncate ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e botões */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-6">
        <h3 className="text-lg md:text-xl font-semibold">Lançamentos Financeiros</h3>
        
        {/* Botões principais - empilhados no mobile, alinhados no desktop */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button 
            onClick={() => handleOpenForm()}
            className="bg-primary hover:bg-primary/90 shadow-sm w-full sm:w-auto md:px-6"
            size="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
          <div className="grid grid-cols-2 sm:flex gap-2 md:gap-3">
            <Button 
              onClick={() => handleOpenForm({ type: 'expense' })}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm md:px-4"
            >
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="md:inline">Adicionar Despesa</span>
              <span className="md:hidden">Despesa</span>
            </Button>
            <Button 
              onClick={() => handleOpenForm({ type: 'income' })}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm md:px-4"
            >
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="md:inline">Adicionar Receita</span>
              <span className="md:hidden">Receita</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-md"
        />
        
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de lançamentos */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">Histórico ({filteredExpenses.length})</h3>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <p className="text-base md:text-lg">Nenhum lançamento encontrado</p>
            <p className="text-sm mt-2">Clique em "Novo Lançamento" para adicionar o primeiro</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-0 md:border md:rounded-lg md:overflow-hidden md:bg-card md:shadow-sm">
            {filteredExpenses.map((expense: any, index: number) => (
              <div 
                key={expense.id}
                className={`
                  p-3 md:p-5 rounded-lg md:rounded-none border md:border-0 md:border-b md:last:border-b-0 
                  hover:bg-muted/30 md:hover:bg-muted/20 transition-all duration-200 bg-card md:bg-transparent
                  ${index % 2 === 0 ? 'md:bg-background/50' : 'md:bg-muted/10'}
                `}
              >
                {/* Layout responsivo: empilhado no mobile, horizontal no desktop */}
                <div className="space-y-3 md:space-y-0">
                  {/* Desktop: Layout horizontal mais espaçoso */}
                  <div className="md:flex md:items-center md:justify-between md:gap-6">
                    {/* Informações principais */}
                    <div className="flex items-start justify-between md:flex-1 md:justify-start md:gap-6">
                      <div className="flex-1 min-w-0 pr-3 md:pr-0">
                        <h4 className="font-medium text-sm md:text-lg text-foreground truncate mb-1">{expense.name}</h4>
                        {expense.notes && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 md:line-clamp-1">{expense.notes}</p>
                        )}
                        
                        {/* Badges no desktop aparecem abaixo do nome */}
                        <div className="hidden md:flex md:items-center md:space-x-2 md:mt-2">
                          <Badge variant={expense.paid ? "default" : "secondary"} className="text-xs">
                            {expense.paid ? "Pago" : "Pendente"}
                          </Badge>
                          {expense.category && (
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(expense.category)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Valor e data */}
                      <div className="text-right flex-shrink-0 md:min-w-[140px]">
                        <p className={`font-semibold text-base md:text-xl ${expense.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {expense.amount < 0 ? '-' : '+'}R$ {(Math.abs(expense.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {expense.dueDate && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            Venc: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Ações - sempre à direita no desktop */}
                    <div className="hidden md:flex md:space-x-2 md:flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(expense)}
                        className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Editar lançamento"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpenseMutation.mutate(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile: Badges e ações na linha inferior */}
                  <div className="flex items-center justify-between md:hidden">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <Badge variant={expense.paid ? "default" : "secondary"} className="text-xs">
                        {expense.paid ? "Pago" : "Pendente"}
                      </Badge>
                      {expense.category && (
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(expense.category)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(expense)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpenseMutation.mutate(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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