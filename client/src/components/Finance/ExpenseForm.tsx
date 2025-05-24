import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EXPENSE_CATEGORIES } from './ExpenseList';

// Categorias para recebimentos
export const INCOME_CATEGORIES = [
  { value: 'client_payment', label: 'Pagamento de cliente' },
  { value: 'sponsor', label: 'Patrocínio' },
  { value: 'ticket_sales', label: 'Venda de ingressos' },
  { value: 'donation', label: 'Doação' },
  { value: 'reimbursement', label: 'Reembolso' },
  { value: 'other', label: 'Outros' },
];

// Schema para validação do formulário
const expenseFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome da transação deve ter pelo menos 3 caracteres' }),
  amount: z.string().min(1, { message: 'Informe o valor da transação' }),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
  vendorId: z.number().optional(),
  isIncome: z.boolean().default(false), // Novo campo para diferenciar receitas
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

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

interface ExpenseFormProps {
  eventId: number;
  expense?: Expense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  eventId,
  expense,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!expense;
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    expense?.isIncome ? 'income' : 'expense'
  );

  // Configurar o formulário com os valores padrão
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: expense?.name || '',
      amount: expense?.amount ? String(expense.amount) : '',
      category: expense?.category || undefined,
      dueDate: expense?.dueDate ? new Date(expense.dueDate).toISOString().split('T')[0] : '',
      paymentDate: expense?.paymentDate ? new Date(expense.paymentDate).toISOString().split('T')[0] : '',
      paid: expense?.paid || false,
      notes: expense?.notes || '',
      vendorId: expense?.vendorId,
      isIncome: expense?.isIncome || false,
    },
  });

  // Mutação para criar uma nova despesa
  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // Converter valor de string para número
      const expenseData = {
        ...data,
        amount: parseInt(data.amount.replace(/\D/g, '')),
        eventId,
      };

      return await apiRequest(`/api/events/${eventId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Despesa adicionada",
        description: "A despesa foi adicionada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      // Também invalidar o evento para atualizar o valor total de despesas
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar despesa",
        description: "Ocorreu um erro ao adicionar a despesa.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar despesa:", error);
    },
  });

  // Mutação para atualizar uma despesa existente
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      if (!expense) {
        throw new Error("Despesa não encontrada");
      }

      // Converter valor de string para número
      const expenseData = {
        ...data,
        amount: parseInt(data.amount.replace(/\D/g, '')),
      };

      return await apiRequest(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        body: JSON.stringify(expenseData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Despesa atualizada",
        description: "A despesa foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      // Também invalidar o evento para atualizar o valor total de despesas
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: "Ocorreu um erro ao atualizar a despesa.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar despesa:", error);
    },
  });

  // Formatar valor como moeda durante a digitação
  const formatCurrency = (value: string) => {
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Se não houver valor, retornar vazio
    if (!numericValue) return '';
    
    // Converter para número e formatar como moeda
    const amount = Number(numericValue) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Manipular envio do formulário
  const onSubmit = (data: ExpenseFormValues) => {
    if (isEditing) {
      updateExpenseMutation.mutate(data);
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  // Atualizar o campo isIncome quando o tipo de transação muda
  React.useEffect(() => {
    form.setValue('isIncome', transactionType === 'income');
  }, [form, transactionType]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <FormField
            control={form.control}
            name="isIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Lançamento</FormLabel>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={!field.value ? "default" : "outline"}
                    className={!field.value ? "bg-red-100 hover:bg-red-200 text-red-700 border-0" : "border-red-200 text-red-700"}
                    onClick={() => {
                      field.onChange(false);
                      setTransactionType('expense');
                    }}
                  >
                    <i className="fas fa-arrow-down mr-2"></i>
                    Saída
                  </Button>
                  <Button
                    type="button"
                    variant={field.value ? "default" : "outline"}
                    className={field.value ? "bg-green-100 hover:bg-green-200 text-green-700 border-0" : "border-green-200 text-green-700"}
                    onClick={() => {
                      field.onChange(true);
                      setTransactionType('income');
                    }}
                  >
                    <i className="fas fa-arrow-up mr-2"></i>
                    Entrada
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={transactionType === 'expense' ? "Nome da despesa" : "Nome do recebimento"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        {...field}
                        onChange={(e) => {
                          const formattedValue = formatCurrency(e.target.value);
                          field.onChange(formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionType === 'expense' 
                          ? EXPENSE_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))
                          : INCOME_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{transactionType === 'expense' ? 'Data de Vencimento' : 'Data Prevista'}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{transactionType === 'expense' ? 'Pago' : 'Recebido'}</FormLabel>
                      <FormDescription>
                        {transactionType === 'expense' 
                          ? 'Marque esta opção se a despesa já foi paga'
                          : 'Marque esta opção se o valor já foi recebido'
                        }
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{transactionType === 'expense' ? 'Data de Pagamento' : 'Data de Recebimento'}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Observações sobre ${transactionType === 'expense' ? 'a despesa' : 'o recebimento'}`}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending || updateExpenseMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {isEditing ? 'Salvando...' : 'Adicionando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alterações' : `Adicionar ${transactionType === 'expense' ? 'Despesa' : 'Recebimento'}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};