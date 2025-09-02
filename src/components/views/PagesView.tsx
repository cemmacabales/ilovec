import { Plus, FileText, Calendar, Image as ImageIcon } from 'lucide-react';

interface PagesViewProps {
  onPageEdit: (pageId: string) => void;
}

export default function PagesView({ onPageEdit }: PagesViewProps) {
  // Mock pages data
  const pages = [
    {
      id: '1',
      title: 'Our First Date ❤️',
      preview: 'That magical evening at the rooftop restaurant...',
      lastEdited: '2 days ago',
      hasImages: true,
      hasEvents: true,
      type: 'memory'
    },
    {
      id: '2',
      title: 'Weekend Getaway Plans',
      preview: 'Planning our trip to the mountains. Need to book...',
      lastEdited: '1 week ago',
      hasImages: false,
      hasEvents: true,
      type: 'planning'
    },
    {
      id: '3',
      title: 'Anniversary Ideas 💕',
      preview: 'Brainstorming special ways to celebrate our...',
      lastEdited: '3 days ago',
      hasImages: true,
      hasEvents: false,
      type: 'ideas'
    },
    {
      id: '4',
      title: 'Recipe Collection',
      preview: 'Our favorite dishes we\'ve cooked together...',
      lastEdited: '1 day ago',
      hasImages: true,
      hasEvents: false,
      type: 'collection'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memory': return 'bg-red-100 text-red-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'ideas': return 'bg-purple-100 text-purple-700';
      case 'collection': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600 mt-1">Your shared memories and plans</p>
          </div>
          <button
            onClick={() => onPageEdit('new')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map(page => (
            <div
              key={page.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPageEdit(page.id)}
            >
              {/* Page Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {page.title}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(page.type)}`}>
                  {page.type}
                </div>
              </div>

              {/* Page Preview */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {page.preview}
              </p>

              {/* Page Icons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-400">
                  <FileText className="w-4 h-4" />
                  {page.hasImages && <ImageIcon className="w-4 h-4" />}
                  {page.hasEvents && <Calendar className="w-4 h-4" />}
                </div>
                <span className="text-xs text-gray-500">{page.lastEdited}</span>
              </div>
            </div>
          ))}

          {/* Add New Page Card */}
          <div
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer min-h-[200px]"
            onClick={() => onPageEdit('new')}
          >
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Create New Page</p>
            <p className="text-gray-500 text-sm mt-1">Share a memory or plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
