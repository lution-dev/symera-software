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
import { X, DollarSign } from 'lucide-react';

// Schema de validação
const expenseFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
  isIncome: z.boolean().default(false),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// Categorias de despesas (mantendo as mesmas do sistema original)
const EXPENSE_CATEGORIES = [
  { value: 'venue', label: 'Local' },
  { value: 'catering', label: 'Buffet' },
  { value: 'decoration', label: 'Decoração' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'photography_video', label: 'Fotografia e Vídeo' },
  { value: 'staff', label: 'Equipe e Staff' },
  { value: 'transportation', label: 'Transporte' },
  { value: 'gifts', label: 'Brindes e Lembranças' },
  { value: 'security', label: 'Segurança' },
  { value: 'marketing', label: 'Divulgação e Mídia' },
  { value: 'sound_lighting', label: 'Sonorização e Iluminação' },
  { value: 'equipment_rental', label: 'Aluguel de Equipamentos' },
  { value: 'licenses_taxes', label: 'Licenças e Taxas' },
  { value: 'platform_software', label: 'Plataforma/Software' },
  { value: 'accommodation_travel', label: 'Hospedagem e Viagem' },
  { value: 'food_drinks', label: 'Alimentos e Bebidas' },
  { value: 'graphic_materials', label: 'Materiais Gráficos' },
  { value: 'contingency', label: 'Contingência' },
  { value: 'other', label: 'Outros' },
];

// Categorias de receitas
const INCOME_CATEGORIES = [
  { value: 'client_payment', label: 'Pagamento de cliente' },
  { value: 'sponsor', label: 'Patrocínio' },
  { value: 'ticket_sales', label: 'Venda de ingressos' },
  { value: 'donation', label: 'Doação' },
  { value: 'reimbursement', label: 'Reembolso' },
  { value: 'other', label: 'Outros' },
];

interface ExpenseFormWorkingProps {
  eventId: number;
  expense?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseFormWorking: React.FC<ExpenseFormWorkingProps> = ({
  eventId,
  expense,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    expense?.amount > 0 ? 'income' : 'expense'
  );

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: expense?.name || '',
      amount: expense?.amount ? `R$ ${(Math.abs(expense.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
      category: expense?.category || '',
      dueDate: expense?.dueDate ? new Date(expense.dueDate).toISOString().split('T')[0] : '',
      paymentDate: expense?.paymentDate ? new Date(expense.paymentDate).toISOString().split('T')[0] : '',
      paid: expense?.paid || false,
      notes: expense?.notes || '',
      isIncome: expense?.amount > 0 || transactionType === 'income',
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // Converter valor para centavos (integer) como o sistema espera
      let cleanAmount = data.amount.replace(/[^\d.,]/g, '');
      // Se tem vírgula, trocar por ponto para decimal
      if (cleanAmount.includes(',') && cleanAmount.includes('.')) {
        // Formato como 1.234,50 - remover pontos e trocar vírgula por ponto
        cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
      } else if (cleanAmount.includes(',')) {
        // Formato como 1234,50 - trocar vírgula por ponto
        cleanAmount = cleanAmount.replace(',', '.');
      }
      const amount = parseFloat(cleanAmount);
      const amountInCents = Math.round(amount * 100);
      const finalAmount = data.isIncome ? Math.abs(amountInCents) : -Math.abs(amountInCents);
      
      console.log('[ExpenseFormWorking] Debug conversion:', {
        originalAmount: data.amount,
        cleanAmount,
        amount,
        amountInCents,
        finalAmount
      });
      
      const expenseData = {
        name: data.name,
        amount: finalAmount,
        category: data.category || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
        paid: data.paid,
        notes: data.notes || null,
        eventId: eventId,
      };

      console.log('[ExpenseFormWorking] Enviando dados:', expenseData);

      if (expense?.id) {
        return await apiRequest(`/api/events/${eventId}/expenses/${expense.id}`, {
          method: 'PUT',
          body: JSON.stringify(expenseData),
        });
      } else {
        return await apiRequest(`/api/events/${eventId}/expenses`, {
          method: 'POST',
          body: JSON.stringify(expenseData),
        });
      }
    },
    onSuccess: () => {
      console.log('[ExpenseFormWorking] Sucesso ao salvar');
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      toast({
        title: "Sucesso!",
        description: `${transactionType === 'income' ? 'Receita' : 'Despesa'} ${expense?.id ? 'atualizada' : 'adicionada'} com sucesso.`,
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error('[ExpenseFormWorking] Erro:', error);
      toast({
        title: "Erro!",
        description: `Erro ao ${expense?.id ? 'atualizar' : 'adicionar'} ${transactionType === 'income' ? 'receita' : 'despesa'}.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    console.log('[ExpenseFormWorking] Submit:', data);
    data.isIncome = transactionType === 'income';
    createExpenseMutation.mutate(data);
  };

  const handleTransactionTypeChange = (type: 'expense' | 'income') => {
    setTransactionType(type);
    form.setValue('isIncome', type === 'income');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {expense?.id ? 'Editar' : 'Novo'} Lançamento
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de transação */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipo de Lançamento</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={transactionType === 'expense' ? 'default' : 'outline'}
                  onClick={() => handleTransactionTypeChange('expense')}
                  className="flex-1"
                >
                  📉 Saída
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'income' ? 'default' : 'outline'}
                  onClick={() => handleTransactionTypeChange('income')}
                  className="flex-1"
                >
                  📈 Entrada
                </Button>
              </div>
            </div>

            {/* Nome/Descrição */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descreva o lançamento..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valor */}
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
                          let value = e.target.value.replace(/\D/g, '');
                          if (value) {
                            value = (parseInt(value) / 100).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                            field.onChange(`R$ ${value}`);
                          } else {
                            field.onChange('');
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoria */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de Vencimento */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data de Pagamento */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status de pagamento */}
            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      🟢 Pago
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque esta opção se a {transactionType === 'income' ? 'receita' : 'despesa'} já foi paga
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createExpenseMutation.isPending}
                className="min-w-[120px]"
              >
                {createExpenseMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Salvando...
                  </div>
                ) : (
                  `${expense?.id ? 'Atualizar' : 'Adicionar'} ${transactionType === 'income' ? 'Receita' : 'Despesa'}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};