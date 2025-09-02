import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import SideRail from './components/SideRail';
import MainContent from './components/MainContent';
import QuickAddModal from './components/modals/QuickAddModal';
import PageEditorDrawer from './components/drawers/PageEditorDrawer';
import ImageLightbox from './components/modals/ImageLightbox';
import SettingsModal from './components/modals/SettingsModal';
import SearchModal from './components/modals/SearchModal';

export type ViewType = 'calendar' | 'today' | 'pages' | 'gallery' | 'templates' | 'settings';

export interface AppState {
  currentView: ViewType;
  isQuickAddOpen: boolean;
  isPageEditorOpen: boolean;
  isImageLightboxOpen: boolean;
  isSettingsOpen: boolean;
  isSearchOpen: boolean;
  isSideRailCollapsed: boolean;
  selectedDate?: Date;
  selectedImage?: string;
  selectedPageId?: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'calendar',
    isQuickAddOpen: false,
    isPageEditorOpen: false,
    isImageLightboxOpen: false,
    isSettingsOpen: false,
    isSearchOpen: false,
    isSideRailCollapsed: false,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setState(prev => ({ ...prev, isSearchOpen: true }));
      }
      // N for new page
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setState(prev => ({ ...prev, isPageEditorOpen: true }));
        }
      }
      // C for new event
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setState(prev => ({ ...prev, isQuickAddOpen: true }));
        }
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setState(prev => ({
          ...prev,
          isQuickAddOpen: false,
          isPageEditorOpen: false,
          isImageLightboxOpen: false,
          isSettingsOpen: false,
          isSearchOpen: false,
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        onQuickAdd={() => updateState({ isQuickAddOpen: true })}
        onSearch={() => updateState({ isSearchOpen: true })}
        onSettings={() => updateState({ isSettingsOpen: true })}
        onToggleSideRail={() => updateState({ isSideRailCollapsed: !state.isSideRailCollapsed })}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Side Rail */}
        <SideRail 
          currentView={state.currentView}
          isCollapsed={state.isSideRailCollapsed}
          onViewChange={(view) => updateState({ currentView: view })}
        />
        
        {/* Main Content */}
        <MainContent 
          currentView={state.currentView}
          onQuickAdd={() => updateState({ isQuickAddOpen: true })}
          onPageEdit={(pageId) => updateState({ isPageEditorOpen: true, selectedPageId: pageId })}
          onImageView={(imageUrl) => updateState({ isImageLightboxOpen: true, selectedImage: imageUrl })}
        />
      </div>

      {/* Overlays / Modals */}
      {state.isQuickAddOpen && (
        <QuickAddModal onClose={() => updateState({ isQuickAddOpen: false })} />
      )}
      
      {state.isPageEditorOpen && (
        <PageEditorDrawer 
          pageId={state.selectedPageId}
          onClose={() => updateState({ isPageEditorOpen: false, selectedPageId: undefined })} 
        />
      )}
      
      {state.isImageLightboxOpen && state.selectedImage && (
        <ImageLightbox 
          imageUrl={state.selectedImage}
          onClose={() => updateState({ isImageLightboxOpen: false, selectedImage: undefined })}
        />
      )}
      
      {state.isSettingsOpen && (
        <SettingsModal onClose={() => updateState({ isSettingsOpen: false })} />
      )}
      
      {state.isSearchOpen && (
        <SearchModal onClose={() => updateState({ isSearchOpen: false })} />
      )}
    </div>
  );
}

export default App;
