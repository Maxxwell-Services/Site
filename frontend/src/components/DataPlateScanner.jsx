import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

const DataPlateScanner = ({ equipmentType, onDataExtracted }) => {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Process image
    await processImage(file);
  };

  const processImage = async (file) => {
    setScanning(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix

        try {
          // Send to OCR endpoint
          const response = await axios.post(`${API}/ocr/scan-data-plate`, {
            image_base64: base64String,
            equipment_type: equipmentType
          });

          const data = response.data;

          // Check if data was successfully extracted
          if (data.brand === "Not found" && data.model_number === "Not found" && data.serial_number === "Not found") {
            toast.error('Could not read data plate. Please try again with a clearer photo.');
            setPreview(null);
            setScanning(false);
            return;
          }

          // Show success message
          toast.success('Data plate scanned successfully!');

          // Call callback with extracted data
          onDataExtracted({
            brand: data.brand !== "Not found" ? data.brand : "",
            model_number: data.model_number !== "Not found" ? data.model_number : "",
            serial_number: data.serial_number !== "Not found" ? data.serial_number : "",
            date_of_manufacture: data.date_of_manufacture || "",
            age: data.estimated_age || "",
            warranty_status: data.warranty_status || "Unknown"
          });

          // Clear preview after 2 seconds
          setTimeout(() => {
            setPreview(null);
          }, 2000);

        } catch (error) {
          console.error('OCR Error:', error);
          toast.error('Failed to scan data plate. Please try again.');
          setPreview(null);
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
      setScanning(false);
      setPreview(null);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!preview ? (
        <Button
          type="button"
          onClick={handleCameraClick}
          variant="outline"
          className="w-full min-h-[52px] sm:min-h-[44px] border-2 border-dashed"
          style={{ borderColor: '#DB7218', color: '#1C325E' }}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Scan Data Plate with Camera</span>
              <span className="sm:hidden">Scan Data Plate</span>
            </>
          )}
        </Button>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Data plate preview"
            className="w-full h-32 sm:h-40 object-cover rounded-lg border-2"
            style={{ borderColor: scanning ? '#DB7218' : '#2e7d32' }}
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Processing image...</p>
              </div>
            </div>
          )}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          )}
          {!scanning && (
            <Button
              type="button"
              onClick={handleClearPreview}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        Take a clear photo of the equipment data plate for automatic data extraction
      </p>
    </div>
  );
};

export default DataPlateScanner;
