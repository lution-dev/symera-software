import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  BarChart, 
  Plus,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Search,
  CheckCircle2,
  Calendar,
  Store,
  Users
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface Event {
  id: number;
  name: string;
  type: string;
  date: string;
  budget?: number;
  expenses?: number;
  ownerId: string;
}

interface Vendor {
  id: number;
  name: string;
  service: string;
  cost?: number;
  eventId: number;
}

interface BudgetItem {
  id: number;
  eventId: number;
  name: string;
  category: string;
  amount: number;
  paid: boolean;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

interface Expense {
  id: number;
  eventId: number;
  name: string;
  category: string;
  amount: number;
  paid: boolean;
  dueDate?: string;
  paymentDate?: string;
  vendorId?: number;
  notes?: string;
  createdAt: string;
}

// Categorias do orçamento
const BUDGET_CATEGORIES = [
  // Fornecedores comuns
  { value: "venue", label: "Local", type: "vendor" },
  { value: "catering", label: "Buffet", type: "vendor" },
  { value: "decoration", label: "Decoração", type: "vendor" },
  { value: "music", label: "Música", type: "vendor" },
  { value: "photography", label: "Fotografia", type: "vendor" },
  { value: "video", label: "Vídeo", type: "vendor" },
  { value: "invitations", label: "Convites", type: "vendor" },
  { value: "attire", label: "Vestuário", type: "vendor" },
  { value: "transportation", label: "Transporte", type: "vendor" },
  { value: "gifts", label: "Lembranças", type: "vendor" },
  
  // Custos não associados a fornecedores
  { value: "staff", label: "Equipe/Funcionários", type: "general" },
  { value: "permits", label: "Licenças/Autorizações", type: "general" },
  { value: "insurance", label: "Seguro", type: "general" },
  { value: "admin", label: "Custos Administrativos", type: "general" },
  { value: "marketing", label: "Marketing/Divulgação", type: "general" },
  { value: "accommodation", label: "Hospedagem", type: "general" },
  { value: "entertainment", label: "Entretenimento", type: "general" },
  { value: "fees", label: "Taxas", type: "general" },
  { value: "equipment", label: "Equipamentos", type: "general" },
  { value: "other", label: "Outros", type: "other" }
];

// Identifica o tipo de categoria (fornecedor ou geral)
const getCategoryType = (category: string): "vendor" | "general" | "other" => {
  const categoryItem = BUDGET_CATEGORIES.find(c => c.value === category);
  return categoryItem?.type as "vendor" | "general" | "other" || "other";
};

const Budget: React.FC = () => {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Form para item do orçamento
  const [itemForm, setItemForm] = React.useState({
    name: "",
    category: "",
    amount: "",
    paid: false,
    dueDate: "",
    notes: ""
  });
  
  // Form para orçamento geral
  const [budgetForm, setbudgetForm] = React.useState({
    budget: ""
  });
  
  // Queries
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: true,
  });
  
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ["/api/events", selectedEventId, "vendors"],
    enabled: !!selectedEventId,
    // Força recarregamento dos dados quando o evento for alterado
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  const { data: budgetItems = [], isLoading: isLoadingBudget } = useQuery({
    queryKey: ["/api/events", selectedEventId, "budget"],
    enabled: !!selectedEventId,
    // Força recarregamento dos dados quando o evento for alterado
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["/api/events", selectedEventId, "expenses"],
    enabled: !!selectedEventId,
    // Força recarregamento dos dados quando o evento for alterado
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  // Mutações
  const addBudgetItemMutation = useMutation({
    mutationFn: async (data: {
      eventId: number;
      name: string;
      category: string;
      amount: number;
      paid: boolean;
      dueDate?: string;
      notes?: string;
    }) => {
      return apiRequest(`/api/events/${data.eventId}/budget`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "budget"] });
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao orçamento com sucesso.",
      });
      resetItemForm();
      setIsAddItemOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item ao orçamento.",
        variant: "destructive",
      });
    },
  });
  
  const updateBudgetItemMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      eventId: number;
      updates: Partial<BudgetItem>;
    }) => {
      return apiRequest(`/api/budget/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "budget"] });
      toast({
        title: "Item atualizado",
        description: "O item do orçamento foi atualizado com sucesso.",
      });
      resetItemForm();
      setSelectedItem(null);
      setIsAddItemOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar item",
        description: "Ocorreu um erro ao atualizar o item do orçamento.",
        variant: "destructive",
      });
    },
  });
  
  const deleteBudgetItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/budget/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "budget"] });
      toast({
        title: "Item excluído",
        description: "O item do orçamento foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir item",
        description: "Ocorreu um erro ao excluir o item do orçamento.",
        variant: "destructive",
      });
    },
  });
  
  // Mutações para despesas
  const addExpenseMutation = useMutation({
    mutationFn: async (data: {
      eventId: number;
      name: string;
      category: string;
      amount: number;
      paid: boolean;
      vendorId?: number;
      dueDate?: string;
      paymentDate?: string;
      notes?: string;
    }) => {
      return apiRequest(`/api/events/${data.eventId}/expenses`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Despesa adicionada",
        description: "A despesa foi adicionada com sucesso.",
      });
      resetItemForm();
      setIsAddItemOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar despesa",
        description: "Ocorreu um erro ao adicionar a despesa.",
        variant: "destructive",
      });
    },
  });
  
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      updates: Partial<Expense>;
    }) => {
      return apiRequest(`/api/expenses/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Despesa atualizada",
        description: "A despesa foi atualizada com sucesso.",
      });
      resetItemForm();
      setSelectedItem(null);
      setIsAddItemOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar despesa",
        description: "Ocorreu um erro ao atualizar a despesa.",
        variant: "destructive",
      });
    },
  });
  
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/expenses/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir despesa",
        description: "Ocorreu um erro ao excluir a despesa.",
        variant: "destructive",
      });
    },
  });
  
  const updateEventBudgetMutation = useMutation({
    mutationFn: async (data: {
      eventId: number;
      budget: number;
    }) => {
      return apiRequest(`/api/events/${data.eventId}`, {
        method: "PATCH",
        body: JSON.stringify({ budget: data.budget }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Orçamento atualizado",
        description: "O valor do orçamento foi atualizado com sucesso.",
      });
      setIsEditBudgetOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar orçamento",
        description: "Ocorreu um erro ao atualizar o valor do orçamento.",
        variant: "destructive",
      });
    },
  });
  
  // Selecionar primeiro evento automaticamente se nenhum estiver selecionado
  React.useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);
  
  // Força a refetcher das abas quando o evento muda
  React.useEffect(() => {
    if (selectedEventId) {
      // Forçar atualização dos dados quando o evento selecionado muda
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "budget"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "vendors"] });
    }
  }, [selectedEventId]);
  
  // Resetar formulário de item
  const resetItemForm = () => {
    setItemForm({
      name: "",
      category: "",
      amount: "",
      paid: false,
      dueDate: "",
      notes: ""
    });
  };
  
  // Preparar formulário para edição de item
  const handleEditItem = (item: BudgetItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      amount: item.amount.toString(),
      paid: item.paid,
      dueDate: item.dueDate || "",
      notes: item.notes || ""
    });
    setIsAddItemOpen(true);
  };
  
  // Preparar formulário para edição de orçamento geral
  const handleEditBudget = () => {
    const event = events.find((e: Event) => e.id === selectedEventId);
    if (event) {
      setbudgetForm({
        budget: event.budget?.toString() || ""
      });
      setIsEditBudgetOpen(true);
    }
  };
  
  // Handler para adicionar item (orçamento ou despesa)
  const handleAddItem = () => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento para adicionar um item.",
        variant: "destructive",
      });
      return;
    }
    
    if (!itemForm.name || !itemForm.category || !itemForm.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, categoria e valor são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(itemForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número maior que zero.",
        variant: "destructive",
      });
      return;
    }

    // Pegar a aba ativa atual para determinar se é despesa ou item de orçamento
    const activeTab = document.querySelector('[role="tabpanel"][data-state="active"]')?.getAttribute('data-value');
    const isExpenseTab = activeTab === 'expenses';
    
    if (selectedItem) {
      // Verificar se é uma despesa ou um item de orçamento
      if ('vendorId' in selectedItem || isExpenseTab) {
        // É uma despesa
        updateExpenseMutation.mutate({
          id: selectedItem.id,
          updates: {
            name: itemForm.name,
            category: itemForm.category,
            amount,
            paid: itemForm.paid,
            dueDate: itemForm.dueDate || undefined,
            notes: itemForm.notes || undefined
          }
        });
      } else {
        // É um item de orçamento
        updateBudgetItemMutation.mutate({
          id: selectedItem.id,
          eventId: selectedEventId,
          updates: {
            name: itemForm.name,
            category: itemForm.category,
            amount,
            paid: itemForm.paid,
            dueDate: itemForm.dueDate || undefined,
            notes: itemForm.notes || undefined
          }
        });
      }
    } else {
      // Adicionar novo item com base na aba ativa
      if (isExpenseTab) {
        // Adicionar como despesa
        addExpenseMutation.mutate({
          eventId: selectedEventId,
          name: itemForm.name,
          category: itemForm.category,
          amount,
          paid: itemForm.paid,
          dueDate: itemForm.dueDate || undefined,
          notes: itemForm.notes || undefined
        });
      } else {
        // Adicionar como item de orçamento
        addBudgetItemMutation.mutate({
          eventId: selectedEventId,
          name: itemForm.name,
          category: itemForm.category,
          amount,
          paid: itemForm.paid,
          dueDate: itemForm.dueDate || undefined,
          notes: itemForm.notes || undefined
        });
      }
    }
  };
  
  // Handler para atualizar orçamento geral
  const handleUpdateBudget = () => {
    if (!selectedEventId) return;
    
    const budget = parseFloat(budgetForm.budget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do orçamento deve ser um número maior que zero.",
        variant: "destructive",
      });
      return;
    }
    
    updateEventBudgetMutation.mutate({
      eventId: selectedEventId,
      budget
    });
  };
  
  // Handler para excluir item
  const handleDeleteItem = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item do orçamento?")) {
      deleteBudgetItemMutation.mutate(id);
    }
  };
  
  // Preparar itens do orçamento com distinção entre fornecedores e custos gerais
  const vendorItems = React.useMemo(() => {
    return vendors
      .filter((v: Vendor) => v.cost && !isNaN(Number(v.cost)))
      .map((v: Vendor) => ({
        id: `vendor-${v.id}`,
        eventId: v.eventId,
        name: v.name,
        category: v.service,
        amount: Number(v.cost || 0),
        paid: false,
        createdAt: new Date().toISOString(),
        isVendor: true // Marcar como item de fornecedor
      }));
  }, [vendors]);
  
  // Adicionar campo para indicar se é um item de fornecedor ou não
  const regularItems = React.useMemo(() => {
    return budgetItems.map((item: BudgetItem) => ({
      ...item,
      isVendor: false // Marcar como item regular (não-fornecedor)
    }));
  }, [budgetItems]);
  
  // Calcular estatísticas do orçamento
  const calculateBudgetStats = () => {
    const event = events.find((e: Event) => e.id === selectedEventId) as Event | undefined;
    const budget = event?.budget || 0;
    
    // Coletamos todos os itens: itens do orçamento regular, despesas e custos de fornecedores
    const allItems = [
      ...regularItems,
      ...expenses.map((e: Expense) => ({...e, isExpense: true})),
      // Excluímos os itens de fornecedores para não duplicar com as despesas que têm vendorId
      ...vendorItems.filter(v => !expenses.some((e: Expense) => e.vendorId === parseInt(v.id.toString().replace('vendor-', ''))))
    ];
    
    const totalExpenses = allItems.reduce((sum, item: any) => {
      const amount = Number(item.amount) || 0;
      return sum + amount;
    }, 0);
    
    const totalPaid = allItems.reduce((sum, item: any) => {
      const amount = Number(item.amount) || 0;
      return sum + (item.paid ? amount : 0);
    }, 0);
    
    const totalPending = totalExpenses - totalPaid;
    
    // Calcular por categoria
    const byCategory: Record<string, number> = {};
    allItems.forEach((item: any) => {
      const category = item.category || 'other';
      const amount = Number(item.amount) || 0;
      
      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += amount;
    });
    
    // Calcular por tipo (despesa, item orçamento, fornecedor)
    const byType: Record<string, number> = {
      expense: 0,
      budget: 0,
      vendor: 0
    };
    
    allItems.forEach((item: any) => {
      const amount = Number(item.amount) || 0;
      if (item.isExpense) {
        byType.expense += amount;
      } else if (item.isVendor) {
        byType.vendor += amount;
      } else {
        byType.budget += amount;
      }
    });
    
    // Make sure all numbers are valid
    const budgetNum = Number(budget) || 0;
    const totalExpensesNum = Number(totalExpenses) || 0;
    const totalPaidNum = Number(totalPaid) || 0;
    const totalPendingNum = Number(totalPending) || 0;
    const remainingNum = budgetNum - totalExpensesNum;
    const percentUsedNum = budgetNum > 0 ? (totalExpensesNum / budgetNum) * 100 : 0;

    return {
      budget: budgetNum,
      totalExpenses: totalExpensesNum,
      totalPaid: totalPaidNum,
      totalPending: totalPendingNum,
      remaining: remainingNum,
      percentUsed: percentUsedNum,
      byCategory,
      byType
    };
  };
  
  // Filtrar eventos com base no termo de busca
  const filteredEvents = React.useMemo(() => {
    return events.filter((event: Event) => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // Estatísticas do orçamento
  const stats = calculateBudgetStats();
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orçamento</h1>
        <div className="flex space-x-2">
          <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Orçamento</DialogTitle>
                <DialogDescription>
                  Defina o valor total do orçamento para o evento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Valor do Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0,00"
                    value={budgetForm.budget}
                    onChange={(e) => setbudgetForm({ budget: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleUpdateBudget} 
                  disabled={!budgetForm.budget || updateEventBudgetMutation.isPending}
                >
                  {updateEventBudgetMutation.isPending ? "Atualizando..." : "Atualizar Orçamento"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddItemOpen} onOpenChange={(open) => {
            setIsAddItemOpen(open);
            if (!open) {
              resetItemForm();
              setSelectedItem(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedItem ? "Editar Item do Orçamento" : "Adicionar Item ao Orçamento"}
                </DialogTitle>
                <DialogDescription>
                  {selectedItem 
                    ? "Atualize as informações do item do orçamento." 
                    : "Adicione um novo item ao orçamento do seu evento."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="item-event">Evento</Label>
                  <Select
                    value={selectedEventId?.toString() || ""}
                    onValueChange={(value) => setSelectedEventId(parseInt(value, 10))}
                    disabled={!!selectedItem}
                  >
                    <SelectTrigger id="item-event">
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event: Event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-name">Nome da Despesa</Label>
                  <Input
                    id="item-name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-category">Categoria</Label>
                  <Select
                    value={itemForm.category}
                    onValueChange={(value) => setItemForm({ ...itemForm, category: value })}
                  >
                    <SelectTrigger id="item-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header-vendor" disabled className="font-semibold text-amber-600">
                        Fornecedores
                      </SelectItem>
                      {BUDGET_CATEGORIES.filter(c => c.type === "vendor").map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="header-general" disabled className="font-semibold text-blue-600 mt-2">
                        Despesas Gerais
                      </SelectItem>
                      {BUDGET_CATEGORIES.filter(c => c.type === "general").map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="header-other" disabled className="font-semibold text-gray-600 mt-2">
                        Outros
                      </SelectItem>
                      {BUDGET_CATEGORIES.filter(c => c.type === "other").map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-amount">Valor (R$)</Label>
                  <Input
                    id="item-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={itemForm.amount}
                    onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-date">Data de Vencimento (opcional)</Label>
                  <Input
                    id="item-date"
                    type="date"
                    value={itemForm.dueDate}
                    onChange={(e) => setItemForm({ ...itemForm, dueDate: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="item-paid"
                    checked={itemForm.paid}
                    onChange={(e) => setItemForm({ ...itemForm, paid: e.target.checked })}
                    className="rounded border-gray-300 text-primary"
                  />
                  <Label htmlFor="item-paid">Pago</Label>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-notes">Observações (opcional)</Label>
                  <Input
                    id="item-notes"
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddItem} 
                  disabled={!itemForm.name || !itemForm.category || !itemForm.amount || addBudgetItemMutation.isPending || updateBudgetItemMutation.isPending}
                >
                  {selectedItem 
                    ? (updateBudgetItemMutation.isPending ? "Atualizando..." : "Atualizar Item")
                    : (addBudgetItemMutation.isPending ? "Adicionando..." : "Adicionar Item")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-lg">Meus Eventos</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Buscar eventos..." 
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {isLoadingEvents ? (
                  <div className="p-4 text-center text-muted-foreground">Carregando eventos...</div>
                ) : (
                  <>
                    {filteredEvents.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum evento encontrado
                      </div>
                    ) : (
                      // Só mostra a lista de eventos na barra lateral esquerda
                      filteredEvents.map((event: Event) => (
                        <div
                          key={event.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedEventId === event.id ? "bg-muted/70 border-l-4 border-l-primary" : ""
                          }`}
                          onClick={() => {
                            setSelectedEventId(event.id);
                            // Forçar recarregamento dos dados do evento selecionado
                            queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "budget"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "expenses"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "vendors"] });
                          }}
                        >
                          <div className="font-medium text-base">{event.name}</div>
                          <div className="text-xs text-muted-foreground flex justify-between mt-1">
                            <span className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {event.type}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          {event.budget ? (
                            <div className="mt-3 text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {formatCurrency(event.budget)}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  stats.totalExpenses > event.budget 
                                    ? "bg-red-100 text-red-700" 
                                    : "bg-green-100 text-green-700"
                                }`}>
                                  {Math.min(100, Math.floor((stats.totalExpenses / event.budget) * 100))}%
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, (stats.totalExpenses / event.budget) * 100)}
                                className="h-2"
                                indicatorClassName={`${
                                  stats.totalExpenses > event.budget ? "bg-destructive" : "bg-primary"
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Nenhum orçamento definido
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          {!selectedEventId ? (
            <Card className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="bg-muted/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-primary/70" />
                </div>
                <h3 className="text-xl font-medium mb-3">Nenhum evento selecionado</h3>
                <p className="text-muted-foreground mb-6">
                  Selecione um evento na lista à esquerda para visualizar e gerenciar o orçamento detalhado do seu evento.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Gerencie custos
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                  <span className="flex items-center">
                    <Store className="h-4 w-4 mr-1" />
                    Acompanhe fornecedores
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-[#1F1A29]">
              <CardHeader className="pb-6 pt-6 bg-gradient-to-b from-purple-900/40 to-transparent">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      {events.find((e: Event) => e.id === selectedEventId)?.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-300">
                      {events.find((e: Event) => e.id === selectedEventId)?.type} | {new Date(events.find((e: Event) => e.id === selectedEventId)?.date || "").toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="bg-[#2B2639] p-4 rounded-xl shadow-sm border border-primary/20">
                    <div className="text-xs text-orange-300 uppercase tracking-wide font-medium">Orçamento Total</div>
                    <div className="text-3xl font-bold text-orange-400 mt-1">{formatCurrency(stats.budget)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-[#2B2639] p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-medium text-gray-300">Total de Despesas</div>
                      <div className="p-2 rounded-full bg-[#472A37]">
                        <DollarSign className="h-5 w-5 text-orange-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{formatCurrency(stats.totalExpenses)}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      {stats.budget > 0 && (
                        <>
                          {stats.totalExpenses <= stats.budget ? (
                            <span className="flex items-center px-2 py-1 bg-green-900/40 text-green-400 rounded-full mr-2">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {((stats.totalExpenses / stats.budget) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="flex items-center px-2 py-1 bg-red-900/40 text-red-400 rounded-full mr-2">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {((stats.totalExpenses / stats.budget) * 100).toFixed(1)}%
                            </span>
                          )}
                          <span>do orçamento</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#2B2639] p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-medium text-gray-300">Despesas Pagas</div>
                      <div className="p-2 rounded-full bg-[#1E4039]">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{formatCurrency(stats.totalPaid)}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <span className="px-2 py-1 bg-blue-900/40 text-blue-400 rounded-full">
                        {stats.totalExpenses > 0 
                          ? `${((stats.totalPaid / stats.totalExpenses) * 100).toFixed(1)}% do total`
                          : "0% do total"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#2B2639] p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-medium text-gray-300">
                        {stats.remaining >= 0 ? "Saldo Restante" : "Excedente"}
                      </div>
                      {stats.remaining >= 0 ? (
                        <div className="p-2 rounded-full bg-[#1E3349]">
                          <BarChart className="h-5 w-5 text-blue-400" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-[#472A37]">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                      )}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${stats.remaining < 0 ? "text-red-400" : "text-white"}`}>
                      {formatCurrency(Math.abs(stats.remaining))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stats.budget > 0 && (
                        <span className={`px-2 py-1 rounded-full ${
                          stats.remaining >= 0 ? "bg-blue-900/40 text-blue-400" : "bg-red-900/40 text-red-400"
                        }`}>
                          {Math.abs(((stats.remaining / stats.budget) * 100)).toFixed(1)}% 
                          {stats.remaining >= 0 ? " disponível" : " excedido"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Tabs defaultValue="items">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="items">Itens Orçamento</TabsTrigger>
                    <TabsTrigger value="expenses">Despesas</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="items" className="pt-4">
                    {isLoadingBudget ? (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                        <h3 className="text-lg font-medium mb-2">Carregando itens do orçamento...</h3>
                      </div>
                    ) : regularItems.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum item no orçamento</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione custos de fornecedores e outras despesas ao orçamento
                        </p>
                        <Button onClick={() => setIsAddItemOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Despesa
                        </Button>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3">Item</th>
                              <th className="text-left p-3">Categoria</th>
                              <th className="text-right p-3">Valor</th>
                              <th className="text-center p-3">Status</th>
                              <th className="text-right p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {/* Itens regulares */}
                            {regularItems.length > 0 && (
                              <tr className="bg-blue-50/50">
                                <td colSpan={5} className="p-2 text-sm font-semibold text-blue-800">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    Despesas Gerais
                                  </div>
                                </td>
                              </tr>
                            )}
                            
                            {regularItems.map((item: any) => (
                              <tr key={item.id} className="hover:bg-muted/50">
                                <td className="p-3">
                                  <div className="font-medium">{item.name}</div>
                                  {item.dueDate && (
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(item.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  {BUDGET_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                </td>
                                <td className="p-3 text-right">
                                  {formatCurrency(item.amount)}
                                </td>
                                <td className="p-3 text-center">
                                  {item.paid ? (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700">
                                      Pago
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-700">
                                      Pendente
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            
                            {/* Itens de fornecedores */}
                            {vendorItems.length > 0 && (
                              <tr className="bg-amber-50/50">
                                <td colSpan={5} className="p-2 text-sm font-semibold text-amber-800">
                                  <div className="flex items-center">
                                    <Store className="h-4 w-4 mr-2" />
                                    Custos de Fornecedores
                                  </div>
                                </td>
                              </tr>
                            )}
                            
                            {vendorItems.map((item: any) => (
                              <tr key={item.id} className="hover:bg-muted/50">
                                <td className="p-3">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Fornecedor
                                  </div>
                                </td>
                                <td className="p-3">
                                  {BUDGET_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                </td>
                                <td className="p-3 text-right">
                                  {formatCurrency(item.amount)}
                                </td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-700">
                                    Fornecedor
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {/* Não podemos editar/excluir itens de fornecedor aqui */}
                                  <div className="text-xs text-muted-foreground">
                                    Gerenciar em Fornecedores
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="expenses" className="pt-4">
                    {isLoadingExpenses ? (
                      <div className="text-center py-8">
                        <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                        <h3 className="text-lg font-medium mb-2">Carregando despesas...</h3>
                      </div>
                    ) : expenses.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma despesa registrada</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione despesas para acompanhar os gastos do seu evento
                        </p>
                        <Button onClick={() => {
                          setSelectedItem(null);
                          setItemForm({
                            name: "",
                            category: "",
                            amount: "",
                            paid: false,
                            dueDate: "",
                            notes: ""
                          });
                          setIsAddItemOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Despesa
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Despesas do evento</h3>
                          <Button onClick={() => {
                            setSelectedItem(null);
                            setItemForm({
                              name: "",
                              category: "",
                              amount: "",
                              paid: false,
                              dueDate: "",
                              notes: ""
                            });
                            setIsAddItemOpen(true);
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                        
                        <div className="rounded-md border">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="p-3 text-left font-medium">Item</th>
                                  <th className="p-3 text-left font-medium">Vencimento</th>
                                  <th className="p-3 text-left font-medium">Categoria</th>
                                  <th className="p-3 text-right font-medium">Valor</th>
                                  <th className="p-3 text-center font-medium">Status</th>
                                  <th className="p-3 text-right font-medium">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {expenses.map((expense: Expense) => (
                                  <tr key={expense.id} className="hover:bg-muted/30">
                                    <td className="p-3">
                                      <div>{expense.name}</div>
                                      {expense.vendorId && (
                                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                                          <Store className="h-3 w-3 mr-1" />
                                          {vendors.find(v => v.id === expense.vendorId)?.name || "Fornecedor"}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {expense.dueDate && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {new Date(expense.dueDate).toLocaleDateString()}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {BUDGET_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                                    </td>
                                    <td className="p-3 text-right">
                                      {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="p-3 text-center">
                                      {expense.paid ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700">
                                          Pago
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-700">
                                          Pendente
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setSelectedItem(expense);
                                            setItemForm({
                                              name: expense.name,
                                              category: expense.category,
                                              amount: expense.amount.toString(),
                                              paid: expense.paid,
                                              dueDate: expense.dueDate || "",
                                              notes: expense.notes || ""
                                            });
                                            setIsAddItemOpen(true);
                                          }}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => deleteExpenseMutation.mutate(expense.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="categories" className="pt-4">
                    {Object.keys(stats.byCategory).length === 0 ? (
                      <div className="text-center py-8">
                        <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum item no orçamento</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione itens ao orçamento para visualizar as estatísticas por categoria
                        </p>
                        <Button onClick={() => setIsAddItemOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Despesa
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Categorias de despesas gerais */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-medium text-blue-800">Despesas Gerais</h3>
                          </div>
                          
                          <div className="space-y-3 pl-7">
                            {Object.entries(stats.byCategory)
                              .filter(([category]) => {
                                // Filtrar apenas categorias que não são tipicamente de fornecedores
                                const nonVendorCategories = [
                                  'staff', 'permits', 'insurance', 'admin', 
                                  'marketing', 'fees', 'equipment', 'accommodation', 'entertainment'
                                ];
                                return nonVendorCategories.includes(category);
                              })
                              .map(([category, amount]) => (
                                <div key={category} className="border rounded-lg p-4 bg-blue-50/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">
                                      {BUDGET_CATEGORIES.find(c => c.value === category)?.label || category}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{formatCurrency(amount)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {stats.budget > 0 
                                          ? `${((amount / stats.budget) * 100).toFixed(1)}% do orçamento` 
                                          : `${((amount / stats.totalExpenses) * 100).toFixed(1)}% do total`}
                                      </div>
                                    </div>
                                  </div>
                                  <Progress
                                    value={stats.budget > 0 ? (amount / stats.budget) * 100 : (amount / stats.totalExpenses) * 100}
                                    className="h-2"
                                    indicatorClassName="bg-blue-500"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Categorias de fornecedores */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Store className="h-5 w-5 text-amber-600" />
                            <h3 className="text-lg font-medium text-amber-800">Custos de Fornecedores</h3>
                          </div>
                          
                          <div className="space-y-3 pl-7">
                            {Object.entries(stats.byCategory)
                              .filter(([category]) => {
                                // Filtrar apenas categorias típicas de fornecedores
                                const vendorCategories = [
                                  'venue', 'catering', 'decoration', 'music', 
                                  'photography', 'video', 'invitations', 'attire',
                                  'transportation', 'gifts'
                                ];
                                return vendorCategories.includes(category);
                              })
                              .map(([category, amount]) => (
                                <div key={category} className="border rounded-lg p-4 bg-amber-50/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">
                                      {BUDGET_CATEGORIES.find(c => c.value === category)?.label || category}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{formatCurrency(amount)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {stats.budget > 0 
                                          ? `${((amount / stats.budget) * 100).toFixed(1)}% do orçamento` 
                                          : `${((amount / stats.totalExpenses) * 100).toFixed(1)}% do total`}
                                      </div>
                                    </div>
                                  </div>
                                  <Progress
                                    value={stats.budget > 0 ? (amount / stats.budget) * 100 : (amount / stats.totalExpenses) * 100}
                                    className="h-2"
                                    indicatorClassName="bg-amber-500"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Outras categorias */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-800">Outras Categorias</h3>
                          </div>
                          
                          <div className="space-y-3 pl-7">
                            {Object.entries(stats.byCategory)
                              .filter(([category]) => {
                                const allDefinedCategories = [
                                  'venue', 'catering', 'decoration', 'music', 
                                  'photography', 'video', 'invitations', 'attire',
                                  'transportation', 'gifts', 'staff', 'permits', 
                                  'insurance', 'admin', 'marketing', 'fees', 
                                  'equipment', 'accommodation', 'entertainment'
                                ];
                                return !allDefinedCategories.includes(category);
                              })
                              .map(([category, amount]) => (
                                <div key={category} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">
                                      {BUDGET_CATEGORIES.find(c => c.value === category)?.label || category}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{formatCurrency(amount)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {stats.budget > 0 
                                          ? `${((amount / stats.budget) * 100).toFixed(1)}% do orçamento` 
                                          : `${((amount / stats.totalExpenses) * 100).toFixed(1)}% do total`}
                                      </div>
                                    </div>
                                  </div>
                                  <Progress
                                    value={stats.budget > 0 ? (amount / stats.budget) * 100 : (amount / stats.totalExpenses) * 100}
                                    className="h-2"
                                    indicatorClassName="bg-gray-500"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vendors" className="pt-4">
                    {isLoadingVendors ? (
                      <div className="text-center py-8">
                        <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                        <h3 className="text-lg font-medium mb-2">Carregando fornecedores...</h3>
                      </div>
                    ) : vendors.length === 0 ? (
                      <div className="text-center py-8">
                        <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum fornecedor cadastrado</h3>
                        <p className="text-muted-foreground mb-4">
                          Acesse a página de Fornecedores para adicionar fornecedores ao seu evento
                        </p>
                        <Button asChild>
                          <a href={`/vendors?eventId=${selectedEventId}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Gerenciar Fornecedores
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3">Fornecedor</th>
                              <th className="text-left p-3">Serviço</th>
                              <th className="text-right p-3">Custo</th>
                              <th className="text-right p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {vendors.map((vendor: Vendor) => (
                              <tr key={vendor.id} className="hover:bg-muted/50">
                                <td className="p-3">
                                  <div className="font-medium">{vendor.name}</div>
                                </td>
                                <td className="p-3">
                                  {BUDGET_CATEGORIES.find(c => c.value === vendor.service)?.label || vendor.service}
                                </td>
                                <td className="p-3 text-right">
                                  {vendor.cost ? formatCurrency(vendor.cost) : "Não definido"}
                                </td>
                                <td className="p-3 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                  >
                                    <a href={`/vendors?eventId=${selectedEventId}`}>
                                      <Edit2 className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-muted/30">
                              <td colSpan={2} className="p-3 text-right font-medium">
                                Total de Fornecedores:
                              </td>
                              <td className="p-3 text-right font-bold">
                                {formatCurrency(
                                  vendors.reduce((total: number, vendor: Vendor) => {
                                    return total + (vendor.cost ? Number(vendor.cost) : 0);
                                  }, 0)
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;