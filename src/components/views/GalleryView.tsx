import { Upload, Heart, Calendar, Search } from 'lucide-react';

interface GalleryViewProps {
  onImageView: (imageUrl: string) => void;
}

export default function GalleryView({ onImageView }: GalleryViewProps) {
  // Mock image data
  const images = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400',
      title: 'Sunset Dinner',
      date: '2024-08-15',
      tags: ['date', 'dinner', 'sunset'],
      favorite: true
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      title: 'Coffee Together',
      date: '2024-08-10',
      tags: ['coffee', 'morning'],
      favorite: false
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      title: 'Mountain Hike',
      date: '2024-08-05',
      tags: ['adventure', 'nature', 'hiking'],
      favorite: true
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1555939594-58e637e7ba31?w=400',
      title: 'Home Cooking',
      date: '2024-08-01',
      tags: ['cooking', 'home', 'food'],
      favorite: false
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=400',
      title: 'City Walk',
      date: '2024-07-28',
      tags: ['city', 'walk', 'evening'],
      favorite: true
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      title: 'Beach Day',
      date: '2024-07-20',
      tags: ['beach', 'summer', 'fun'],
      favorite: false
    }
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600 mt-1">Your shared moments and memories</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {['All', 'Favorites', 'Dates', 'Adventures', 'Food'].map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tag === 'All'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <div
              key={image.id}
              className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onImageView(image.url)}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />

              {/* Favorite Icon */}
              {image.favorite && (
                <div className="absolute top-2 right-2">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </div>
              )}

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white font-medium text-sm">{image.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-300" />
                  <span className="text-gray-300 text-xs">{image.date}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Upload Placeholder */}
          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium text-sm">Upload Photo</p>
            <p className="text-gray-500 text-xs">JPG, PNG, or GIF</p>
          </div>
        </div>
      </div>
    </div>
  );
}
