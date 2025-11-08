import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, X, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

const WarrantyScanner = ({ brand, serialNumber, onWarrantyExtracted }) => {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Manufacturer warranty lookup URLs
  const warrantyLookupUrls = {
    'LENNOX': 'https://www.lennox.com/residential/owners/assistance/warranty/',
    'TRANE': 'https://www.trane.com/residential/en/resources/warranty-information/',
    'CARRIER': 'https://www.carrier.com/residential/en/us/products/warranty/',
    'GOODMAN': 'https://www.goodmanmfg.com/support/warranty-information',
    'RHEEM': 'https://www.rheem.com/support/warranty/',
    'YORK': 'https://www.york.com/residential-equipment/resources/warranty',
    'AMERICAN STANDARD': 'https://www.americanstandardair.com/support/warranty/',
    'BRYANT': 'https://www.bryant.com/en/us/support/warranty-information/',
    'AMANA': 'https://www.amana-hac.com/support/warranty-information',
  };

  const getWarrantyLookupUrl = () => {
    const brandUpper = brand?.toUpperCase() || '';
    return warrantyLookupUrls[brandUpper] || 'https://www.google.com/search?q=' + encodeURIComponent(brand + ' HVAC warranty lookup');
  };

  const handleOpenWarrantyLookup = () => {
    window.open(getWarrantyLookupUrl(), '_blank');
  };

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
          // Send to warranty OCR endpoint
          const response = await axios.post(`${API}/ocr/scan-warranty`, {
            image_base64: base64String,
            brand: brand,
            serial_number: serialNumber
          });

          const data = response.data;

          // Check if data was successfully extracted
          if (!data.warranty_details || data.warranty_details === "Not found") {
            toast.error('Could not read warranty information. Please try again with a clearer screenshot.');
            setPreview(null);
            setScanning(false);
            return;
          }

          // Show success message
          toast.success('Warranty information extracted successfully!');

          // Call callback with extracted data
          onWarrantyExtracted({
            age: data.age,
            warranty_status: data.warranty_status,
            warranty_details: data.warranty_details
          });

          // Clear preview after 2 seconds
          setTimeout(() => {
            setPreview(null);
          }, 2000);

        } catch (error) {
          console.error('Warranty OCR Error:', error);
          toast.error('Failed to extract warranty info. Please try again.');
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

  const handleScreenshotClick = () => {
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
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Open Warranty Lookup Button */}
      <Button
        type="button"
        onClick={handleOpenWarrantyLookup}
        variant="outline"
        className="w-full min-h-[44px] border-2"
        style={{ borderColor: '#1C325E', color: '#1C325E' }}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        <span>Open {brand || 'Manufacturer'} Warranty Lookup</span>
      </Button>

      {/* Upload Screenshot Button */}
      {!preview ? (
        <Button
          type="button"
          onClick={handleScreenshotClick}
          variant="outline"
          className="w-full min-h-[44px] border-2 border-dashed"
          style={{ borderColor: '#DB7218', color: '#1C325E' }}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extracting warranty info...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              <span>Upload Warranty Screenshot</span>
            </>
          )}
        </Button>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Warranty screenshot preview"
            className="w-full h-32 sm:h-40 object-cover rounded-lg border-2"
            style={{ borderColor: scanning ? '#DB7218' : '#2e7d32' }}
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Extracting warranty info...</p>
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

      <div className="text-xs text-gray-600 space-y-1">
        <p className="font-semibold">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Click button above to open manufacturer warranty page</li>
          <li>Enter serial number: <span className="font-mono text-blue-600">{serialNumber || 'N/A'}</span></li>
          <li>Take screenshot of warranty results</li>
          <li>Upload screenshot to extract warranty details</li>
        </ol>
      </div>
    </div>
  );
};

export default WarrantyScanner;
