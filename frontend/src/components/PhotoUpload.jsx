import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const PhotoUpload = ({ photos, onChange, label, maxPhotos = 5 }) => {
  const [previews, setPreviews] = useState(photos || []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (previews.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const newPreviews = [...previews, base64String];
        setPreviews(newPreviews);
        onChange(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{color: '#1C325E'}}>
          {label} ({previews.length}/{maxPhotos})
        </label>
      </div>

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Buttons */}
      {previews.length < maxPhotos && (
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors" style={{borderColor: '#1C325E', color: '#1C325E'}}>
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Take Photo</span>
            </div>
          </label>

          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors" style={{borderColor: '#DB7218', color: '#DB7218'}}>
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload Photo</span>
            </div>
          </label>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Max file size: 5MB per photo. Supported formats: JPG, PNG, HEIC
      </p>
    </div>
  );
};

export default PhotoUpload;
