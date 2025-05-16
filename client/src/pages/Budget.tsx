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
  Store
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

// Categorias do orçamento
const BUDGET_CATEGORIES = [
  // Fornecedores comuns
  { value: "venue", label: "Local" },
  { value: "catering", label: "Buffet" },
  { value: "decoration", label: "Decoração" },
  { value: "music", label: "Música" },
  { value: "photography", label: "Fotografia" },
  { value: "video", label: "Vídeo" },
  { value: "invitations", label: "Convites" },
  { value: "attire", label: "Vestuário" },
  { value: "transportation", label: "Transporte" },
  { value: "gifts", label: "Lembranças" },
  
  // Custos não associados a fornecedores
  { value: "staff", label: "Equipe/Funcionários" },
  { value: "permits", label: "Licenças/Autorizações" },
  { value: "insurance", label: "Seguro" },
  { value: "admin", label: "Custos Administrativos" },
  { value: "marketing", label: "Marketing/Divulgação" },
  { value: "accommodation", label: "Hospedagem" },
  { value: "entertainment", label: "Entretenimento" },
  { value: "fees", label: "Taxas" },
  { value: "equipment", label: "Equipamentos" },
  { value: "other", label: "Outros" }
];

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
  });
  
  const { data: budgetItems = [], isLoading: isLoadingBudget } = useQuery({
    queryKey: ["/api/events", selectedEventId, "budget"],
    enabled: !!selectedEventId,
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
  
  // Handler para adicionar item
  const handleAddItem = () => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento para adicionar um item ao orçamento.",
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
    
    if (selectedItem) {
      // Atualizar item existente
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
    } else {
      // Adicionar novo item
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
  
  // Calcular estatísticas do orçamento
  const calculateBudgetStats = () => {
    const event = events.find((e: Event) => e.id === selectedEventId) as Event | undefined;
    const budget = event?.budget || 0;
    
    // Montar itens do orçamento incluindo fornecedores
    const vendorItems = vendors
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
    
    // Adicionar campo para indicar se é um item de fornecedor ou não
    const regularItems = budgetItems.map(item => ({
      ...item,
      isVendor: false // Marcar como item regular (não-fornecedor)
    }));
    
    const allItems = [
      ...regularItems,
      ...vendorItems
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
      byCategory
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
                Adicionar Item
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="item-name">Nome do Item</Label>
                    <Input
                      id="item-name"
                      placeholder="Nome do item"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-category">Categoria</Label>
                    <Select 
                      value={itemForm.category} 
                      onValueChange={(value) => setItemForm({...itemForm, category: value})}
                    >
                      <SelectTrigger id="item-category">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGET_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="item-amount">Valor (R$)</Label>
                    <Input
                      id="item-amount"
                      type="number"
                      placeholder="0,00"
                      value={itemForm.amount}
                      onChange={(e) => setItemForm({...itemForm, amount: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-duedate">Data de Vencimento</Label>
                    <Input
                      id="item-duedate"
                      type="date"
                      value={itemForm.dueDate}
                      onChange={(e) => setItemForm({...itemForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="item-paid"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={itemForm.paid}
                    onChange={(e) => setItemForm({...itemForm, paid: e.target.checked})}
                  />
                  <Label htmlFor="item-paid">Item já pago</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-notes">Observações</Label>
                  <Input
                    id="item-notes"
                    placeholder="Detalhes adicionais sobre o item..."
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddItem} 
                  disabled={!selectedEventId || !itemForm.name || !itemForm.category || !itemForm.amount || 
                    addBudgetItemMutation.isPending || updateBudgetItemMutation.isPending}
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
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40">
              <h3 className="font-semibold text-lg">Meus Eventos</h3>
              <div className="mt-2 relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Buscar eventos..." 
                    className="pl-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary"></div>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="overflow-y-auto max-h-[400px]">
                {filteredEvents.map((event: Event) => (
                  <div
                    key={event.id}
                    className={`flex items-center border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-all ${
                      selectedEventId === event.id
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div 
                      className={`w-1 self-stretch transition-colors ${
                        selectedEventId === event.id ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 p-3 min-w-0">
                      <div className="font-medium truncate">{event.name}</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div className="text-xs">
                          {event.budget
                            ? `Orçamento: ${formatCurrency(event.budget)}`
                            : event.type}
                        </div>
                      </div>
                    </div>
                    {selectedEventId === event.id && (
                      <div className="pr-3 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Nenhum evento encontrado</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Crie um evento para começar
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Criar Evento
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          {isLoadingBudget || isLoadingVendors ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
            </div>
          ) : selectedEventId ? (
            <>
              {/* Resumo do Orçamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={stats.remaining >= 0 ? "" : "border-red-500"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Orçamento Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(stats.budget)}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Utilizado</span>
                      <span className="text-sm font-medium">
                        {stats.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.percentUsed > 100 ? 100 : stats.percentUsed} 
                      className="h-2 mt-1"
                      indicatorClassName={stats.percentUsed > 100 ? "bg-red-500" : ""}
                    />
                    {stats.budget === 0 && (
                      <div className="flex items-center text-amber-500 mt-2 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Defina um orçamento
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total de Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
                    <div className="flex justify-between mt-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Pago</span>
                        <div className="font-medium">{formatCurrency(stats.totalPaid)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Pendente</span>
                        <div className="font-medium">{formatCurrency(stats.totalPending)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={stats.remaining >= 0 ? "bg-green-500/10" : "bg-red-500/10"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Saldo Restante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold flex items-center">
                      {stats.remaining >= 0 ? (
                        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      {formatCurrency(Math.abs(stats.remaining))}
                    </div>
                    <div className="mt-2 text-sm">
                      {stats.remaining >= 0 ? (
                        <span className="text-green-600">Dentro do orçamento</span>
                      ) : (
                        <span className="text-red-600">Acima do orçamento</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detalhes do Orçamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Orçamento</CardTitle>
                  <CardDescription>Gerencie os itens do seu orçamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="items">
                    <TabsList>
                      <TabsTrigger value="items">Itens</TabsTrigger>
                      <TabsTrigger value="categories">Por Categoria</TabsTrigger>
                      <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="items" className="pt-4">
                      {budgetItems.length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Nenhum item no orçamento</h3>
                          <p className="text-muted-foreground mb-4">
                            Adicione itens ao orçamento para controlar suas despesas
                          </p>
                          <Button onClick={() => setIsAddItemOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Item
                          </Button>
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-3 font-medium">Item</th>
                                <th className="text-left p-3 font-medium">Categoria</th>
                                <th className="text-right p-3 font-medium">Valor</th>
                                <th className="text-center p-3 font-medium">Status</th>
                                <th className="text-right p-3 font-medium">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {budgetItems.map((item: BudgetItem) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                  <td className="p-3">
                                    <div className="font-medium">{item.name}</div>
                                    {item.dueDate && (
                                      <div className="text-xs text-muted-foreground">
                                        Venc: {new Date(item.dueDate).toLocaleDateString()}
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
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.paid 
                                        ? "bg-green-500/20 text-green-700" 
                                        : "bg-amber-500/20 text-amber-700"
                                    }`}>
                                      {item.paid ? "Pago" : "Pendente"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex justify-end space-x-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEditItem(item)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive/80"
                                        onClick={() => handleDeleteItem(item.id)}
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
                            Adicionar Item
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(stats.byCategory).map(([category, amount]) => (
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
                                indicatorClassName="bg-primary"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="vendors" className="pt-4">
                      {vendors.length === 0 ? (
                        <div className="text-center py-8">
                          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
                          <p className="text-muted-foreground mb-4">
                            Adicione fornecedores ao seu evento para visualizar custos no orçamento
                          </p>
                          <Button variant="outline">
                            Ir para Fornecedores
                          </Button>
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-3 font-medium">Fornecedor</th>
                                <th className="text-left p-3 font-medium">Serviço</th>
                                <th className="text-right p-3 font-medium">Custo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {vendors
                                .filter((vendor: Vendor) => vendor.cost)
                                .map((vendor: Vendor) => (
                                <tr key={vendor.id} className="hover:bg-muted/50">
                                  <td className="p-3">
                                    <div className="font-medium">{vendor.name}</div>
                                  </td>
                                  <td className="p-3">
                                    {vendor.service === "catering" ? "Buffet" :
                                     vendor.service === "venue" ? "Local" :
                                     vendor.service === "photography" ? "Fotografia" :
                                     vendor.service === "decoration" ? "Decoração" :
                                     vendor.service === "music" ? "Música" :
                                     vendor.service === "invitation" ? "Convites" :
                                     vendor.service === "transport" ? "Transporte" :
                                     vendor.service === "cake" ? "Bolo e Doces" :
                                     vendor.service === "costume" ? "Vestuário" : vendor.service}
                                  </td>
                                  <td className="p-3 text-right">
                                    {formatCurrency(vendor.cost || 0)}
                                  </td>
                                </tr>
                              ))}
                              {vendors.filter((vendor: Vendor) => vendor.cost).length === 0 && (
                                <tr>
                                  <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                    Nenhum fornecedor com custos definidos
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-10">
              <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Selecione um evento</h3>
              <p className="text-muted-foreground">
                Selecione um evento para visualizar e gerenciar seu orçamento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;