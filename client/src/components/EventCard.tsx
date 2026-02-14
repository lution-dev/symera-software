import React from "react";
import { Link } from "wouter";
import { formatDate, calculateTaskProgress, calculateEventProgress, getEventTypeLabel, getInitials, generateProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Briefcase,
  Cake,
  GlassWater,
  Calendar,
  Video,
  Users2,
  Users,
  MapPin,
  Link as LinkIcon,
  UserPlus,
  ListTodo,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: number;
  eventId: number;
  userId: string;
  role: string;
  permissions: any;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface Task {
  id: number;
  status: string;
}

interface EventCardProps {
  id: number;
  name: string;
  type: string;
  format?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  status?: string;
  attendees?: number;
  team?: TeamMember[];
  tasks?: Task[];
  coverImage?: string;
  lastUpdated?: string;
}

const TypeIconMap: Record<string, LucideIcon> = {
  wedding: Heart,
  corporate: Briefcase,
  birthday: Cake,
  social: GlassWater,
  conference: Calendar
};

const TypeColorMap: Record<string, string> = {
  wedding: 'bg-pink-100 text-pink-500',
  corporate: 'bg-blue-100 text-blue-500',
  birthday: 'bg-purple-100 text-purple-500',
  social: 'bg-green-100 text-green-500',
  conference: 'bg-amber-100 text-amber-500'
};

const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  type,
  format,
  startDate,
  endDate,
  startTime,
  endTime,
  location,
  meetingUrl,
  attendees,
  team = [],
  tasks = [],
  status,
  coverImage,
}) => {
  const teamData = React.useMemo(() => Array.isArray(team) ? team : [], [team]);

  const getDefaultCover = () => {
    switch (type) {
      case 'wedding': return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&h=300';
      case 'corporate': return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&h=300';
      case 'birthday': return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&h=300';
      case 'conference': return 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&h=300';
      default: return 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&h=300';
    }
  };

  const getImageUrl = () => {
    if (coverImage && coverImage.trim() !== '') {
      return coverImage.startsWith('/') ? coverImage : coverImage.startsWith('http') ? coverImage : `/${coverImage}`;
    }
    return getDefaultCover();
  };

  const progressPercentage = calculateEventProgress(tasks, teamData);
  const Icon = TypeIconMap[type] || Calendar;
  const colorClass = TypeColorMap[type] || 'bg-gray-100 text-gray-500';

  return (
    <Link href={`/events/${id}`}>
      <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all h-full flex flex-col border border-white/5 active:scale-95 duration-200">
        <div className="relative h-28 sm:h-32">
          <img
            src={getImageUrl()}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = getDefaultCover(); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute top-3 right-3">
            <span className={cn(
              "px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white border border-white/10",
              status === 'planning' ? 'bg-blue-500/80' :
                status === 'confirmed' ? 'bg-green-500/80' :
                  status === 'in_progress' ? 'bg-amber-500/80' :
                    status === 'completed' ? 'bg-indigo-500/80' :
                      'bg-gray-500/80'
            )}>
              {status === 'planning' ? 'Fila' : status === 'confirmed' ? 'Confirmado' : status === 'in_progress' ? 'No Ar' : 'Final'}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-xl shrink-0 flex items-center justify-center", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm sm:text-base truncate leading-tight">{name}</h3>
              <p className="text-muted-foreground text-[11px] font-medium">{getEventTypeLabel(type)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium truncate">
                {startDate ? (
                  new Date(startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                ) : "A definir"}
              </span>
              {format && (
                <div className="flex items-center gap-1 ml-auto shrink-0 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold uppercase tracking-tighter">
                  {format === 'online' ? <Video className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {format === 'online' ? 'Online' : 'Presencial'}
                </div>
              )}
            </div>

            {(location || meetingUrl) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                {format === 'online' ? <LinkIcon className="w-3.5 h-3.5 text-primary" /> : <MapPin className="w-3.5 h-3.5 text-primary" />}
                <span className="text-[11px] font-medium truncate italic opacity-80">{location || meetingUrl}</span>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-muted-foreground tracking-widest">
                <ListTodo className="w-3 h-3 text-primary" /> {tasks.length} Tarefas
              </div>
              <span className="text-[10px] font-black text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {teamData.length > 0 && (
            <div className="flex -space-x-2 pt-1">
              {teamData.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="w-6 h-6 border-2 border-background ring-1 ring-white/5">
                  <AvatarImage src={member.user?.profileImageUrl || generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} />
                  <AvatarFallback className="text-[8px] font-bold">{getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}</AvatarFallback>
                </Avatar>
              ))}
              {teamData.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">+ {teamData.length - 4}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
