import { Plus, Copy, Heart, Calendar, FileText } from 'lucide-react';

interface TemplatesViewProps {
  onPageEdit: (pageId: string) => void;
}

export default function TemplatesView({ onPageEdit }: TemplatesViewProps) {
  const templates = [
    {
      id: 'date-night',
      title: 'Date Night Planner',
      description: 'Plan the perfect evening together with this template',
      icon: Heart,
      color: 'bg-red-100 text-red-600',
      sections: ['Restaurant reservations', 'Activity ideas', 'Photo memories', 'Notes'],
      uses: 12
    },
    {
      id: 'vacation-plan',
      title: 'Vacation Planning',
      description: 'Organize your getaway from start to finish',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      sections: ['Itinerary', 'Packing list', 'Bookings', 'Budget tracker'],
      uses: 8
    },
    {
      id: 'memory-book',
      title: 'Memory Book',
      description: 'Capture and document special moments',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      sections: ['Photos', 'Story', 'Date & location', 'Feelings'],
      uses: 15
    },
    {
      id: 'gift-ideas',
      title: 'Gift Ideas',
      description: 'Keep track of thoughtful gift ideas year-round',
      icon: Heart,
      color: 'bg-green-100 text-green-600',
      sections: ['Birthday ideas', 'Anniversary gifts', 'Just because', 'Wish list'],
      uses: 6
    },
    {
      id: 'bucket-list',
      title: 'Couple\'s Bucket List',
      description: 'Dream together and plan your adventures',
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-600',
      sections: ['Travel goals', 'Activities to try', 'Achievements', 'Timeline'],
      uses: 4
    },
    {
      id: 'anniversary',
      title: 'Anniversary Celebration',
      description: 'Make your special day unforgettable',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      sections: ['Timeline', 'Surprises', 'Memory lane', 'Future plans'],
      uses: 10
    }
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
          <p className="text-gray-600">Start with a template or create your own from scratch</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {template.uses} uses
                  </span>
                </div>

                {/* Template Info */}
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>

                {/* Template Sections */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.sections.map((section, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageEdit(`template-${template.id}`)}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Preview"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Create Custom Template */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
            <Plus className="w-8 h-8 text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-700 mb-2">Create Custom Template</h3>
            <p className="text-gray-500 text-sm text-center">
              Start from scratch and build your own template
            </p>
          </div>
        </div>

        {/* Popular Templates Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular This Week</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Date Night Planner</h3>
                <p className="text-sm text-gray-600">Most used template this week</p>
              </div>
              <button
                onClick={() => onPageEdit('template-date-night')}
                className="btn-secondary"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
