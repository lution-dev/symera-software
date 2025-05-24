import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Esquema de validação para o formulário de atividade do cronograma
const scheduleItemFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' }),
  location: z.string().optional(),
  responsibles: z.string().optional(),
});

// Tipo de dados do formulário
export type ScheduleFormData = z.infer<typeof scheduleItemFormSchema>;

interface ScheduleItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  title: string;
  defaultValues?: ScheduleFormData;
  isSubmitting: boolean;
}

export const ScheduleItemForm: React.FC<ScheduleItemFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  defaultValues = {
    title: '',
    description: '',
    startTime: '',
    location: '',
    responsibles: '',
  },
  isSubmitting,
}) => {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleItemFormSchema),
    defaultValues,
  });

  const handleSubmit = (data: ScheduleFormData) => {
    onSubmit(data);
  };

  // Redefine o formulário quando o modal for fechado
  React.useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, form, defaultValues]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da atividade para o cronograma do evento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Atividade*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Recepção dos convidados" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Início*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 14:30" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use o formato 24h (HH:MM)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes sobre a atividade..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Auditório Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsáveis</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Equipe de recepção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};