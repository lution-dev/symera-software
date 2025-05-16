import React from "react";
import { Link } from "wouter";
import { formatDate, calculateTaskProgress, getEventTypeLabel, getInitials, generateProfileImageUrl } from "@/lib/utils";
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

  // Calculate progress percentage
  const progressPercentage = calculateTaskProgress(tasks);
  
  // Count pending tasks
  const pendingTasks = tasks.filter(task => task.status !== "completed").length;
  
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fadeIn cursor-pointer">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={coverImage || getDefaultCover()} 
            alt={`${name} - ${getEventTypeLabel(type)}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background opacity-80"></div>
          <div className={`absolute top-4 right-4 ${status === 'active' ? 'bg-green-500' : status === 'planning' ? 'bg-blue-500' : status === 'completed' ? 'bg-gray-500' : 'bg-red-500'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
            {status === 'active' ? 'Ativo' : status === 'planning' ? 'Planejamento' : status === 'completed' ? 'Concluído' : 'Cancelado'}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full ${type === 'wedding' ? 'bg-pink-100' : type === 'corporate' ? 'bg-blue-100' : type === 'birthday' ? 'bg-purple-100' : 'bg-green-100'} flex items-center justify-center mr-3`}>
              <i className={`fas fa-${type === 'wedding' ? 'heart' : type === 'corporate' ? 'briefcase' : type === 'birthday' ? 'birthday-cake' : 'glass-cheers'} ${type === 'wedding' ? 'text-pink-500' : type === 'corporate' ? 'text-blue-500' : type === 'birthday' ? 'text-purple-500' : 'text-green-500'}`}></i>
            </div>
            <div>
              <h3 className="font-semibold text-white">{name}</h3>
              <p className="text-muted-foreground text-sm">{getEventTypeLabel(type)}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-y-3">
            <div className="w-1/2 flex items-center">
              <i className="fas fa-calendar-day text-primary mr-2"></i>
              <span className="text-sm text-gray-300">
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
              <div className="w-1/2 flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                <span className="text-sm text-gray-300 truncate">{location}</span>
              </div>
            )}
            {attendees && (
              <div className="w-1/2 flex items-center">
                <i className="fas fa-user-friends text-primary mr-2"></i>
                <span className="text-sm text-gray-300">{attendees} convidados</span>
              </div>
            )}
            <div className="w-1/2 flex items-center">
              <i className="fas fa-tasks text-primary mr-2"></i>
              <div className="flex items-center">
                <span className="text-sm text-gray-300 mr-2">{progressPercentage}%</span>
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
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
                <span className="text-xs text-muted-foreground">Atualizado: {lastUpdated}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
