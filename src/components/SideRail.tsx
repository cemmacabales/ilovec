import { Calendar, Clock, FileText, Image, Layout } from 'lucide-react';
import type { ViewType } from '../App';

interface SideRailProps {
  currentView: ViewType;
  isCollapsed: boolean;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'today' as ViewType, label: 'Today', icon: Clock },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
  { id: 'pages' as ViewType, label: 'Pages', icon: FileText },
  { id: 'gallery' as ViewType, label: 'Gallery', icon: Image },
  { id: 'templates' as ViewType, label: 'Templates', icon: Layout },
];

export default function SideRail({ currentView, isCollapsed, onViewChange }: SideRailProps) {
  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-primary-100 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>New page</span>
            <span className="bg-gray-100 px-1 rounded">N</span>
          </div>
          <div className="flex justify-between">
            <span>New event</span>
            <span className="bg-gray-100 px-1 rounded">C</span>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <span className="bg-gray-100 px-1 rounded">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
