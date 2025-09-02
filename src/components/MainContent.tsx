import type { ViewType } from '../App';
import CalendarView from './views/CalendarView';
import TodayView from './views/TodayView';
import PagesView from './views/PagesView';
import GalleryView from './views/GalleryView';
import TemplatesView from './views/TemplatesView';

interface MainContentProps {
  currentView: ViewType;
  onQuickAdd: () => void;
  onPageEdit: (pageId: string) => void;
  onImageView: (imageUrl: string) => void;
}

export default function MainContent({ currentView, onQuickAdd, onPageEdit, onImageView }: MainContentProps) {
  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView onQuickAdd={onQuickAdd} onPageEdit={onPageEdit} />;
      case 'today':
        return <TodayView onQuickAdd={onQuickAdd} onPageEdit={onPageEdit} />;
      case 'pages':
        return <PagesView onPageEdit={onPageEdit} />;
      case 'gallery':
        return <GalleryView onImageView={onImageView} />;
      case 'templates':
        return <TemplatesView onPageEdit={onPageEdit} />;
      default:
        return <CalendarView onQuickAdd={onQuickAdd} onPageEdit={onPageEdit} />;
    }
  };

  return (
    <main className="flex-1 overflow-hidden bg-gray-50">
      {renderView()}
    </main>
  );
}
