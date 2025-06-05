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
  format?: string;        // Formato do evento (online, in_person, hybrid)
  startDate: string;      // Agora obrigatório
  endDate: string;        // Agora obrigatório
  startTime: string;      // Agora obrigatório
  endTime: string;        // Agora obrigatório
  location?: string;
  meetingUrl?: string;    // URL da reunião para eventos online/híbridos
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
    console.log(`[Debug] EventCard ${id} - formato:`, format); // Debugando formato
  }, [id, tasks, format]);
  
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

  // Get the correct image URL, prioritizing database images
  const getImageUrl = () => {
    // Debug log to see what coverImage value we're receiving
    console.log(`[Debug] EventCard ${id} - coverImage value:`, coverImage);
    
    // If we have a coverImage from database, use it
    if (coverImage && coverImage.trim() !== '') {
      // Ensure the URL is properly formatted
      if (coverImage.startsWith('/')) {
        return coverImage; // Relative URL, let the browser handle it
      } else if (coverImage.startsWith('http')) {
        return coverImage; // Absolute URL
      } else {
        // Assume it's a relative path without leading slash
        return `/${coverImage}`;
      }
    }
    
    // Fall back to default cover based on event type
    return getDefaultCover();
  };

  // Calculate progress percentage considerando também a equipe
  const progressPercentage = calculateEventProgress(tasks, teamData);
  
  // Count pending tasks
  const pendingTasks = tasks.filter(task => task.status !== "completed").length;

  return (
    <Link href={`/events/${id}`}>
      <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image container optimized for small screens */}
        <div className="relative">
          <img 
            src={getImageUrl()} 
            alt={`${name} event`}
            className="w-full h-28 sm:h-36 object-cover"
            onError={(e) => {
              // If the database image fails to load, fall back to default
              const target = e.target as HTMLImageElement;
              if (target.src !== getDefaultCover()) {
                console.log(`[Debug] EventCard ${id} - Image failed to load, falling back to default:`, target.src);
                target.src = getDefaultCover();
              }
            }}
          />
          {/* Added gradient overlay with higher opacity to improve readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-background/30"></div>
          
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-xs text-white font-medium ${
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
        </div>
        
        {/* Content container with compact mobile-first layout */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0 flex items-center justify-center ${
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
              } text-xs sm:text-sm`}></i>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-base truncate">{name}</h3>
              <p className="text-muted-foreground text-xs">{getEventTypeLabel(type)}</p>
            </div>
          </div>
          
          {/* Compact information layout */}
          <div className="grid grid-cols-2 gap-x-1 gap-y-1.5 mt-1.5">
            <div className="flex items-center">
              <i className="fas fa-calendar-day text-primary mr-1.5 w-4 text-center text-xs"></i>
              <span className="text-muted-foreground text-xs truncate">
                {startDate ? (
                  <>
                    {/* Evento com múltiplos dias */}
                    {endDate && new Date(startDate).toDateString() !== new Date(endDate).toDateString() ? (
                      <>
                        {new Date(startDate).getUTCDate()} de {new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(startDate)).replace('.', '')}{startTime ? ` ${startTime.substring(0, 5)}` : ''} ➝ {new Date(endDate).getUTCDate()} de {new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(endDate)).replace('.', '')}{endTime ? ` ${endTime.substring(0, 5)}` : ''}
                      </>
                    ) : 
                    /* Evento no mesmo dia com horários diferentes */
                    startTime && endTime && startTime !== endTime ? (
                      <>
                        {new Date(startDate).getUTCDate()} de {new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(startDate)).replace('.', '')} de {startTime.substring(0, 5)} às {endTime.substring(0, 5)}
                      </>
                    ) : 
                    /* Evento no mesmo dia com um único horário */
                    (
                      <>
                        {new Date(startDate).getUTCDate()} de {new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(startDate)).replace('.', '')}{startTime ? ` às ${startTime.substring(0, 5)}` : ''}
                      </>
                    )}
                  </>
                ) : (
                  "Sem data definida"
                )}
              </span>
            </div>
            
            {/* Formato do evento - exibindo exatamente como vem do banco */}
            <div className="flex items-center">
              <i className={`fas ${format === 'online' ? 'fa-video' : format === 'hybrid' ? 'fa-users-cog' : 'fa-users'} text-primary mr-1.5 w-4 text-center text-xs`}></i>
              <span className="text-muted-foreground text-xs truncate font-medium">
                {format === 'online' ? 'Online' : 
                 format === 'hybrid' ? 'Híbrido' : 
                 format === 'in_person' ? 'Presencial' : 
                 'Presencial'}
              </span>
            </div>
            
            {/* Local ou link da reunião */}
            {format === 'in_person' && location ? (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-1.5 w-4 text-center text-xs"></i>
                <span className="text-muted-foreground text-xs truncate">{location}</span>
              </div>
            ) : format === 'hybrid' && location ? (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-1.5 w-4 text-center text-xs"></i>
                <span className="text-muted-foreground text-xs truncate">{location}</span>
              </div>
            ) : format === 'online' && meetingUrl ? (
              <div className="flex items-center">
                <i className="fas fa-link text-primary mr-1.5 w-4 text-center text-xs"></i>
                <span className="text-muted-foreground text-xs truncate">{meetingUrl}</span>
              </div>
            ) : location ? (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-1.5 w-4 text-center text-xs"></i>
                <span className="text-muted-foreground text-xs truncate">{location}</span>
              </div>
            ) : null}
            
            {attendees && (
              <div className="flex items-center">
                <i className="fas fa-user-friends text-primary mr-1.5 w-4 text-center text-xs"></i>
                <span className="text-muted-foreground text-xs truncate">{attendees} convidados</span>
              </div>
            )}
            

          </div>
          
          {/* Team members and progress bar in the same line */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex">
              {teamData.slice(0, 3).map((member, idx) => (
                <Avatar
                  key={member.id}
                  className={`w-6 h-6 sm:w-7 sm:h-7 border-2 border-card ${idx > 0 ? '-ml-1.5' : ''}`}
                  style={{ zIndex: 10 - idx }}
                >
                  <AvatarImage 
                    src={member.user?.profileImageUrl || 
                         generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                    alt={`${member.user?.firstName || ''} ${member.user?.lastName || ''}`}
                  />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamData.length > 3 && (
                <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-card -ml-1.5">
                  <AvatarFallback className="text-[10px]">
                    +{teamData.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex items-center">
              <i className="fas fa-tasks text-primary mr-1.5 w-4 text-center text-xs"></i>
              <span className="text-muted-foreground text-xs mr-1.5">{progressPercentage}%</span>
              <div className="w-16 sm:w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
