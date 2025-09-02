import { X, Download, Heart, Share } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] mx-4">
        {/* Header */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <button className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors">
            <Share className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white rounded-lg p-4 max-w-sm">
          <h3 className="font-medium mb-1">Sunset Dinner</h3>
          <p className="text-sm text-gray-300">August 15, 2024</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">date</span>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">dinner</span>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">sunset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
