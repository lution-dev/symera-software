import React from "react";
import { Link } from "wouter";
import { calculateEventProgress, getEventTypeLabel, getInitials, generateProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Video,
  Users,
  MapPin,
  Link as LinkIcon,
  ListTodo,
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Utility function to calculate days remaining consistently
const calculateDaysRemaining = (eventDate: string) => {
  const targetDate = new Date(eventDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  targetDate.setUTCHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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
  const daysRemaining = startDate ? calculateDaysRemaining(startDate) : null;

  return (
    <Link href={`/events/${id}`}>
      <div className="group relative bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-primary/5 h-full flex flex-col active:scale-[0.99]">
        {/* Header Image Section - Compact Height */}
        <div className="relative h-24 sm:h-32 overflow-hidden bg-muted">
          <img
            src={getImageUrl()}
            alt={name}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out will-change-transform"
            onError={(e) => { (e.target as HTMLImageElement).src = getDefaultCover(); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90 group-hover:scale-105 transition-all duration-700 ease-out will-change-transform" />

          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md border border-white/10 shadow-lg",
              status === 'planning' ? 'bg-blue-600/70' :
                status === 'confirmed' ? 'bg-purple-600/70' :
                  status === 'in_progress' ? 'bg-orange-600/70' :
                    status === 'completed' ? 'bg-emerald-600/70' :
                      'bg-slate-600/70'
            )}>
              {status === 'planning' ? 'Fila' : status === 'confirmed' ? 'Confirmado' : status === 'in_progress' ? 'No Ar' : 'Final'}
            </span>
          </div>

          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="absolute top-3 right-3 hidden sm:flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-primary/20 backdrop-blur-md border border-primary/20 text-primary shadow-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
              <span className="text-sm font-black leading-none">{daysRemaining}</span>
              <span className="text-[6px] font-black uppercase tracking-tighter">Dias</span>
            </div>
          )}
        </div>

        {/* Content Section - Tightened Padding */}
        <div className="p-4 flex-1 flex flex-col gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-primary/90 bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10">
                {getEventTypeLabel(type)}
              </span>
              {format && (
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/50 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                  {format === 'online' ? <Video className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                  {format === 'online' ? 'Online' : 'Presencial'}
                </span>
              )}
            </div>
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-white/80 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 leading-none mb-1">Data</p>
                <p className="text-xs font-bold text-white tracking-tight truncate">
                  {startDate ? new Date(startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : "A definir"}
                  {startTime && <span className="text-primary font-black ml-1">• {startTime}</span>}
                </p>
              </div>
            </div>

            {(location || meetingUrl) && (
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-white/80 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  {format === 'online' ? <LinkIcon className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 leading-none mb-1">Local</p>
                  <p className="text-xs font-bold text-white tracking-tight truncate italic opacity-70">
                    {location || meetingUrl}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">
                  <ListTodo className="w-3 h-3 text-primary/60" />
                  <span>{tasks.length} Tarefas</span>
                </div>
                <span className="text-[9px] font-black text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-in-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex -space-x-2.5">
                  {teamData.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="w-7 h-7 border-2 border-[#1a1122] ring-1 ring-white/5 shadow-lg">
                      <AvatarImage src={member.user?.profileImageUrl || generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} />
                      <AvatarFallback className="text-[8px] font-black bg-primary/20 text-primary">
                        {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {teamData.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-white/5 border-2 border-[#1a1122] ring-1 ring-white/5 flex items-center justify-center text-[8px] font-black text-muted-foreground backdrop-blur-md">
                      +{teamData.length - 4}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
