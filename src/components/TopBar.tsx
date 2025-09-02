import { Search, Plus, Settings, Menu, Heart } from 'lucide-react';

interface TopBarProps {
  onQuickAdd: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onToggleSideRail: () => void;
}

export default function TopBar({ onQuickAdd, onSearch, onSettings, onToggleSideRail }: TopBarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSideRail}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            iLovec
          </h1>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <button
          onClick={onSearch}
          className="w-full bg-gray-100 hover:bg-gray-200 text-left px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-gray-500"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search everything... ⌘K</span>
          <span className="sm:hidden">Search...</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onQuickAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>
        
        <button
          onClick={onSettings}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
