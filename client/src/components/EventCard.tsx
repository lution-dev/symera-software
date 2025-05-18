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
      <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fadeIn cursor-pointer mobile-card">
        {/* Full card cover image */}
        <div className="relative h-[220px] overflow-hidden">
          <img 
            src={coverImage || getDefaultCover()} 
            alt={`${name} - ${getEventTypeLabel(type)}`} 
            className="w-full h-full object-cover"
          />
          
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          
          {/* Status badge - top right */}
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
          
          {/* Content positioned on top of the image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Event icon and title */}
            <div className="flex items-center mb-3">
              <div className={`min-w-[40px] w-9 h-9 rounded-full flex items-center justify-center mr-3 ${
                type === 'wedding' ? 'bg-[hsl(var(--event-confirmed))]' : 
                type === 'corporate' ? 'bg-[hsl(var(--event-planning))]' : 
                type === 'birthday' ? 'bg-[hsl(var(--event-in-progress))]' : 
                'bg-[hsl(var(--event-completed))]'
              }`}>
                <i className={`fas fa-${
                  type === 'wedding' ? 'heart' : 
                  type === 'corporate' ? 'briefcase' : 
                  type === 'birthday' ? 'birthday-cake' : 
                  'glass-cheers'
                } text-white text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{name}</h3>
                <p className="text-gray-300 text-sm">{getEventTypeLabel(type)}</p>
              </div>
            </div>
            
            {/* Event details in grid layout */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-3">
              <div className="flex items-center">
                <i className="fas fa-calendar-day text-orange-400 mr-2 min-w-[14px]"></i>
                <span className="text-xs text-gray-300 truncate max-w-full">
                  {startDate ? formatDate(startDate) : formatDate(date)}
                </span>
              </div>
              
              {location && (
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-orange-400 mr-2 min-w-[14px]"></i>
                  <span className="text-xs text-gray-300 truncate max-w-full">{location}</span>
                </div>
              )}
              
              {attendees && (
                <div className="flex items-center">
                  <i className="fas fa-user-friends text-orange-400 mr-2 min-w-[14px]"></i>
                  <span className="text-xs text-gray-300">{attendees} convidados</span>
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="flex items-center">
                <span className="text-xs text-gray-300 mr-2 whitespace-nowrap">{progressPercentage}%</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Team members avatars */}
            <div className="flex">
              {teamData.slice(0, 3).map((member, idx) => (
                <Avatar
                  key={member.id}
                  className="w-7 h-7 border-2 border-black -ml-2 first:ml-0"
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
                <Avatar className="w-7 h-7 border-2 border-black -ml-2">
                  <AvatarFallback className="text-xs font-medium">
                    +{teamData.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
