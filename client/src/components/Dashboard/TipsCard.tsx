import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Lightbulb,
  X,
  ListTodo,
  Building2,
  Users,
  PieChart,
  CalendarCheck,
  TrendingUp,
  Bell,
  FileOutput,
  Sliders,
  MessageSquare,
  ClipboardCheck,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Define different tip sets for rotation
const TIP_SETS = [
  {
    mainTip: { icon: "Sparkles", text: "Use IA para checklists personalizados" },
    modalTips: [
      { icon: "Lightbulb", title: "Planejamento IA", description: "O assistente cria tarefas baseadas no tipo de evento." },
      { icon: "Users", title: "Equipe", description: "Atribua tarefas para manter todos alinhados." },
      { icon: "PieChart", title: "Orçamento", description: "Registre custos para evitar gastos excessivos." }
    ],
    ctaText: "Novo Evento",
    ctaLink: "/events/new"
  },
  {
    mainTip: { icon: "TrendingUp", text: "Acompanhe progresso com Analytics" },
    modalTips: [
      { icon: "TrendingUp", title: "Relatórios", description: "Visualize o avanço do seu evento em tempo real." },
      { icon: "FileOutput", title: "Exportação", description: "Compartilhe listas e orçamentos facilmente." },
      { icon: "Bell", title: "Alertas", description: "Configure notificações para prazos importantes." }
    ],
    ctaText: "Relatórios",
    ctaLink: "/events"
  },
  {
    mainTip: { icon: "ClipboardCheck", text: "Priorize tarefas críticas hoje" },
    modalTips: [
      { icon: "ListTodo", title: "Prioridades", description: "Foque no que realmente importa no momento." },
      { icon: "MessageSquare", title: "Comunicação", description: "Centralize conversas dentro das tarefas." },
      { icon: "Clock", title: "Prazos", description: "Controle o tempo para garantir entregas pontuais." }
    ],
    ctaText: "Ver Tarefas",
    ctaLink: "/events"
  }
];

const IconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-4 h-4" />,
  X: <X className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  ClipboardCheck: <ClipboardCheck className="w-4 h-4" />,
  ListTodo: <ListTodo className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  PieChart: <PieChart className="w-4 h-4" />,
  CalendarCheck: <CalendarCheck className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  FileOutput: <FileOutput className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />
};

interface TipsCardProps {
  tipSetIndex?: number;
  isCreatingFirstEvent?: boolean;
}

const TipsCard: React.FC<TipsCardProps> = ({ tipSetIndex: forcedTipSetIndex, isCreatingFirstEvent }) => {
  const [activeTipSetIndex, setActiveTipSetIndex] = useState<number>(0);
  const [showTipsCard, setShowTipsCard] = useState<boolean>(true);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const STORAGE_KEY_SHOW = 'showTipsCard_v2';

  useEffect(() => {
    const storedPreference = localStorage.getItem(STORAGE_KEY_SHOW);
    if (storedPreference !== null) {
      setShowTipsCard(storedPreference === 'true');
    }

    if (forcedTipSetIndex !== undefined) {
      setActiveTipSetIndex(forcedTipSetIndex);
      return;
    }

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setActiveTipSetIndex(isCreatingFirstEvent ? 0 : dayOfYear % TIP_SETS.length);
  }, [forcedTipSetIndex, isCreatingFirstEvent]);

  if (!showTipsCard) return null;

  const activeTipSet = TIP_SETS[activeTipSetIndex];

  return (
    <div className="mb-6 animate-in fade-in duration-500">
      <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:scale-110 transition-transform">
              {IconMap[activeTipSet.mainTip.icon]}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {activeTipSet.mainTip.text}
              </p>
              {isMobile ? (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger asChild>
                    <button className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 mt-0.5">
                      Saiba mais <ArrowRight className="w-3 h-3" />
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-purple-dark border-white/10 pb-10 px-4">
                    <DrawerHeader className="text-left px-2 mb-2">
                      <DrawerTitle className="text-2xl font-black text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" /> Dicas de Especialista
                      </DrawerTitle>
                      <DrawerDescription className="text-muted-foreground/80">
                        Otimize sua gestão com estas práticas recomendadas.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-4 py-4">
                      {activeTipSet.modalTips.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-primary shrink-0 mt-1">{IconMap[tip.icon]}</div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{tip.title}</h4>
                            <p className="text-xs text-muted-foreground">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <DrawerFooter className="px-0 pt-2 flex flex-col gap-3">
                      <Link href={activeTipSet.ctaLink} className="w-full">
                        <Button className="w-full h-12 rounded-xl font-black tracking-tight gradient-primary">
                          {activeTipSet.ctaText}
                        </Button>
                      </Link>
                      <DrawerClose asChild>
                        <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-bold active:scale-[0.98]">
                          Voltar
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 mt-0.5">
                      Saiba mais <ArrowRight className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-2xl bg-purple-dark border-white/10">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-primary" /> Dicas de Especialista
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground/80">
                        Otimize sua gestão com estas práticas recomendadas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {activeTipSet.modalTips.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-left">
                          <div className="text-primary shrink-0 mt-1">{IconMap[tip.icon]}</div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{tip.title}</h4>
                            <p className="text-xs text-muted-foreground">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Link href={activeTipSet.ctaLink} className="w-full">
                        <Button className="w-full rounded-xl font-bold gradient-primary">{activeTipSet.ctaText}</Button>
                      </Link>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <button
            onClick={() => { setShowTipsCard(false); localStorage.setItem(STORAGE_KEY_SHOW, 'false'); }}
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsCard;
