import React from "react";
import { Link } from "wouter";
import { formatDate, calculateTaskProgress, calculateEventProgress, getEventTypeLabel, getInitials, generateProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  date: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
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
  date,
  startDate,
  endDate,
  startTime,
  endTime,
  location,
  attendees,
  team = [],
  tasks = [],
  status,
  coverImage,
  lastUpdated,
}) => {
  // Certifica-se de que team é um array
  const teamData = React.useMemo(() => {
    console.log(`[Debug] EventCard ${id} - team data:`, team);
    return Array.isArray(team) ? team : [];
  }, [id, team]);

  // Debug task data
  React.useEffect(() => {
    console.log(`[Debug] EventCard ${id} - tasks data:`, tasks);
    console.log(`[Debug] EventCard ${id} - progress:`, calculateTaskProgress(tasks));
  }, [id, tasks]);
  // Get default cover image based on event type
  const getDefaultCover = () => {
    switch (type) {
      case 'wedding':
        return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'corporate':
        return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'birthday':
        return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'conference':
        return 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      default:
        return 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
    }
  };

  // Calculate progress percentage considerando também a equipe
  const progressPercentage = calculateEventProgress(tasks, teamData);
  
  // Count pending tasks
  const pendingTasks = tasks.filter(task => task.status !== "completed").length;
  
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fadeIn cursor-pointer mobile-card">
        {/* Cover image with status badge */}
        <div className="relative h-32 sm:h-40 overflow-hidden">
          <img 
            src={coverImage || getDefaultCover()} 
            alt={`${name} - ${getEventTypeLabel(type)}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background opacity-80"></div>
          
          {/* Status badge - more prominent on mobile */}
          <div className={`absolute top-3 right-3 ${
            status === 'planning' ? 'bg-[hsl(var(--event-planning))]' : 
            status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]' : 
            status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]' : 
            status === 'active' ? 'bg-[hsl(var(--event-in-progress))]' : 
            status === 'completed' ? 'bg-[hsl(var(--event-completed))]' : 
            status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]' : 
            'bg-[hsl(var(--event-planning))]'
          } text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
            {status === 'planning' ? 'Planejamento' : 
             status === 'confirmed' ? 'Confirmado' : 
             status === 'in_progress' ? 'Em andamento' : 
             status === 'active' ? 'Ativo' : 
             status === 'completed' ? 'Concluído' : 
             status === 'cancelled' ? 'Cancelado' : 
             'Planejamento'}
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {/* Event title and type - more compact on mobile */}
          <div className="flex items-center mb-3">
            <div className={`min-w-[44px] w-10 h-10 rounded-full touch-target ${type === 'wedding' ? 'bg-pink-100' : type === 'corporate' ? 'bg-blue-100' : type === 'birthday' ? 'bg-purple-100' : 'bg-green-100'} flex items-center justify-center mr-3`}>
              <i className={`fas fa-${type === 'wedding' ? 'heart' : type === 'corporate' ? 'briefcase' : type === 'birthday' ? 'birthday-cake' : 'glass-cheers'} ${type === 'wedding' ? 'text-pink-500' : type === 'corporate' ? 'text-blue-500' : type === 'birthday' ? 'text-purple-500' : 'text-green-500'}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{name}</h3>
              <p className="text-muted-foreground text-sm">{getEventTypeLabel(type)}</p>
            </div>
          </div>
          
          {/* Event details - stack on small mobile, 2-column on larger screens */}
          <div className="flex flex-wrap gap-y-3">
            <div className="w-full sm:w-1/2 flex items-center">
              <i className="fas fa-calendar-day text-primary mr-2 min-w-[16px]"></i>
              <span className="text-sm text-gray-300 truncate">
                {startDate && endDate && startDate !== endDate ? (
                  <>De {formatDate(startDate)} até {formatDate(endDate)}</>
                ) : startDate ? (
                  formatDate(startDate)
                ) : (
                  formatDate(date)
                )}
                {startTime && <> às {startTime}</>}
                {endTime && startTime !== endTime && <> - {endTime}</>}
              </span>
            </div>
            {location && (
              <div className="w-full sm:w-1/2 flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-2 min-w-[16px]"></i>
                <span className="text-sm text-gray-300 truncate">{location}</span>
              </div>
            )}
            {attendees && (
              <div className="w-full sm:w-1/2 flex items-center">
                <i className="fas fa-user-friends text-primary mr-2 min-w-[16px]"></i>
                <span className="text-sm text-gray-300">{attendees} convidados</span>
              </div>
            )}
            
            {/* Progress indicator - full width and more visible on mobile */}
            <div className="w-full sm:w-1/2 flex items-center mt-1 sm:mt-0">
              <i className="fas fa-tasks text-primary mr-2 min-w-[16px]"></i>
              <div className="flex items-center flex-1">
                <span className="text-sm text-gray-300 mr-2">{progressPercentage}%</span>
                <div className="flex-1 h-2 bg-muted rounded-full max-w-[100px]">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team members and last updated - compact on mobile */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex">
              {teamData.slice(0, 3).map((member, idx) => (
                <Avatar
                  key={member.id}
                  className="w-8 h-8 border-2 border-card -ml-2 first:ml-0"
                  style={{ zIndex: 10 - idx }}
                >
                  <AvatarImage 
                    src={member.user?.profileImageUrl || 
                         generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                    alt={`${member.user?.firstName || ''} ${member.user?.lastName || ''}`}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamData.length > 3 && (
                <Avatar className="w-8 h-8 border-2 border-card -ml-2">
                  <AvatarFallback className="text-xs font-medium">
                    +{teamData.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex items-center">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground hidden sm:inline">Atualizado: {lastUpdated}</span>
              )}
              {/* Show just the icon on mobile for last updated */}
              {lastUpdated && (
                <span className="text-xs text-muted-foreground sm:hidden">
                  <i className="fas fa-history mr-1"></i>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
