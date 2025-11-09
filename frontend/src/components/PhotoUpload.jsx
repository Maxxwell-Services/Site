import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const PhotoUpload = ({ photos, onChange, label, maxPhotos = 5 }) => {
  const [previews, setPreviews] = useState(photos || []);

  // Function to compress and resize image
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1920px width/height while maintaining aspect ratio)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.7 quality for JPEG, good balance)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          // Calculate compression ratio for user feedback
          const originalSize = (file.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressedBase64.length * 0.75 / 1024 / 1024).toFixed(2);
          
          if (compressedSize > 2) {
            toast.warning(`Image compressed from ${originalSize}MB to ${compressedSize}MB`);
          }
          
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (previews.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Process files sequentially to avoid memory issues
    const loadingToast = toast.loading(`Compressing ${files.length} image(s)...`);
    
    try {
      for (const file of files) {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`);
          continue;
        }

        // Compress the image
        const compressedBase64 = await compressImage(file);
        
        const newPreviews = [...previews, compressedBase64];
        setPreviews(newPreviews);
        onChange(newPreviews);
      }
      
      toast.dismiss(loadingToast);
      toast.success(`${files.length} image(s) added successfully`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process images. Please try again.');
      console.error('Image compression error:', error);
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
        Images are automatically compressed and resized. Supported formats: JPG, PNG, HEIC, WebP
      </p>
    </div>
  );
};

export default PhotoUpload;
