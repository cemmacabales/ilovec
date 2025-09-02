import { Plus, Clock, Heart } from 'lucide-react';

interface TodayViewProps {
  onQuickAdd: () => void;
  onPageEdit: (pageId: string) => void;
}

export default function TodayView({ onQuickAdd, onPageEdit }: TodayViewProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mock data for demo
  const todayEvents = [
    {
      id: '1',
      title: 'Coffee Date ☕',
      time: '10:00 AM',
      location: 'Starbucks on Main St',
      type: 'date'
    },
    {
      id: '2',
      title: 'Dinner Reservation',
      time: '7:00 PM',
      location: 'Italian Bistro',
      type: 'date'
    }
  ];

  const upcomingEvents = [
    {
      id: '3',
      title: 'Movie Night',
      date: 'Tomorrow',
      type: 'date'
    },
    {
      id: '4',
      title: 'Weekend Getaway Planning',
      date: 'This Weekend',
      type: 'planning'
    }
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Today</h1>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
            <button
              onClick={onQuickAdd}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-500" />
            Today's Schedule
          </h2>
          
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onPageEdit(event.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.time} • {event.location}</p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No events scheduled for today</p>
              <button
                onClick={onQuickAdd}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first event
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Up</h2>
          
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onPageEdit(event.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'date' ? 'bg-red-400' : 'bg-blue-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
