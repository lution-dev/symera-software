import React from 'react';

interface VerticalNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: {
    id: string;
    label: string;
    icon: string;
    count?: number;
  }[];
}

const VerticalNavigation: React.FC<VerticalNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  tabs 
}) => {
  return (
    <div className="w-full sm:w-[260px] flex-shrink-0 mb-4 sm:mb-0 sm:border-r sm:pr-4">
      <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-visible">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${
              activeTab === tab.id ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'
            }`}
          >
            <i className={`fas fa-${tab.icon} mr-2`}></i> {tab.label}
            {typeof tab.count !== 'undefined' && tab.count > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VerticalNavigation;