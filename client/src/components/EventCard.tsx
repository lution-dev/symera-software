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
      <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <img 
          src={coverImage || getDefaultCover()} 
          alt={`${name} event`}
          className="w-full h-48 object-cover"
        />
        
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs text-white font-medium ${
            status === 'planning' ? 'bg-blue-500' : 
            status === 'confirmed' ? 'bg-green-500' : 
            status === 'in_progress' ? 'bg-amber-500' : 
            status === 'completed' ? 'bg-green-700' : 
            status === 'cancelled' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            {status === 'planning' ? 'Planejamento' : 
            status === 'confirmed' ? 'Confirmado' : 
            status === 'in_progress' ? 'Em andamento' : 
            status === 'completed' ? 'Concluído' : 
            status === 'cancelled' ? 'Cancelado' : 
            'Planejamento'}
          </span>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
              type === 'wedding' ? 'bg-pink-100' : 
              type === 'corporate' ? 'bg-blue-100' : 
              type === 'birthday' ? 'bg-purple-100' : 
              type === 'social' ? 'bg-green-100' : 
              'bg-gray-100'
            }`}>
              <i className={`fas fa-${
                type === 'wedding' ? 'heart' : 
                type === 'corporate' ? 'briefcase' : 
                type === 'birthday' ? 'birthday-cake' : 
                type === 'social' ? 'glass-cheers' : 
                'calendar-day'
              } ${
                type === 'wedding' ? 'text-pink-500' : 
                type === 'corporate' ? 'text-blue-500' : 
                type === 'birthday' ? 'text-purple-500' : 
                type === 'social' ? 'text-green-500' : 
                'text-gray-500'
              }`}></i>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{name}</h3>
              <p className="text-gray-400 text-sm">{getEventTypeLabel(type)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center">
              <i className="fas fa-calendar-day text-primary mr-2"></i>
              <span className="text-gray-300 text-sm">
                {formatDate(date)}
              </span>
            </div>
            
            {location && (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                <span className="text-gray-300 text-sm truncate">{location}</span>
              </div>
            )}
            
            {attendees && (
              <div className="flex items-center">
                <i className="fas fa-user-friends text-primary mr-2"></i>
                <span className="text-gray-300 text-sm">{attendees} convidados</span>
              </div>
            )}
            
            <div className="flex items-center">
              <i className="fas fa-tasks text-primary mr-2"></i>
              <div className="flex items-center w-full">
                <span className="text-gray-300 text-sm mr-2">{progressPercentage}%</span>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex">
              {teamData.slice(0, 3).map((member, idx) => (
                <Avatar
                  key={member.id}
                  className={`w-8 h-8 border-2 border-card ${idx > 0 ? '-ml-2' : ''}`}
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
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
