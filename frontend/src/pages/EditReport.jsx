import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Snowflake, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { API, AuthContext } from '../App';
import PhotoUpload from '@/components/PhotoUpload';
import DataPlateScanner from '@/components/DataPlateScanner';
import WarrantyScanner from '@/components/WarrantyScanner';

const EditReport = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [editInfo, setEditInfo] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    evaporator_brand: '',
    evaporator_model_number: '',
    evaporator_serial_number: '',
    evaporator_date_of_manufacture: '',
    evaporator_age: '',
    evaporator_warranty_status: 'Active',
    evaporator_warranty_details: '',
    evaporator_photos: [],
    condenser_brand: '',
    condenser_model_number: '',
    condenser_serial_number: '',
    condenser_date_of_manufacture: '',
    condenser_age: '',
    condenser_warranty_status: 'Active',
    condenser_warranty_details: '',
    condenser_photos: [],
    condenser_fan_motor: 'Normal Operation',
    rated_rla: '',
    rated_lra: '',
    actual_rla: '',
    actual_lra: '',
    refrigerant_type: 'R-410A',
    superheat: '',
    subcooling: '',
    refrigerant_status: 'Good',
    refrigerant_photos: [],
    blower_motor_type: 'PSC Motor',
    blower_motor_capacitor_rating: '',
    blower_motor_capacitor_reading: '',
    condenser_capacitor_herm_rating: '',
    condenser_capacitor_herm_reading: '',
    condenser_capacitor_fan_rating: '',
    condenser_capacitor_fan_reading: '',
    capacitor_photos: [],
    return_temp: '',
    supply_temp: '',
    temperature_photos: [],
    primary_drain: 'Flushed and draining normally',
    primary_drain_notes: '',
    drain_pan_condition: 'Good shape',
    drainage_photos: [],
    air_filters: 'Filters Replaced (Provided by the technician)',
    filters_list: [{ size: '', quantity: '' }],
    evaporator_coil: 'Clean',
    condenser_coils: 'Cleaned with Fresh Water',
    air_purifier: 'Good',
    plenums: 'Good condition',
    ductwork: 'Good condition',
    indoor_air_quality_photos: [],
    general_photos: [],
    notes: '',
    other_repair_recommendations: ''
  });

  useEffect(() => {
    if (!user || !token) {
      navigate('/technician/login');
      return;
    }
    fetchReport();
  }, [reportId, user, token, navigate]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/reports/edit/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const report = response.data;
      setEditInfo({
        current_version: report.current_version || 1,
        edit_count: report.edit_count || 0
      });
      
      // Pre-fill form with existing data
      setFormData({
        customer_name: report.customer_name || '',
        customer_email: report.customer_email || '',
        customer_phone: report.customer_phone || '',
        evaporator_brand: report.evaporator_brand || '',
        evaporator_model_number: report.evaporator_model_number || '',
        evaporator_serial_number: report.evaporator_serial_number || '',
        evaporator_date_of_manufacture: report.evaporator_date_of_manufacture || '',
        evaporator_age: report.evaporator_age || '',
        evaporator_warranty_status: report.evaporator_warranty_status || 'Active',
        evaporator_warranty_details: report.evaporator_warranty_details || '',
        evaporator_photos: report.evaporator_photos || [],
        condenser_brand: report.condenser_brand || '',
        condenser_model_number: report.condenser_model_number || '',
        condenser_serial_number: report.condenser_serial_number || '',
        condenser_date_of_manufacture: report.condenser_date_of_manufacture || '',
        condenser_age: report.condenser_age || '',
        condenser_warranty_status: report.condenser_warranty_status || 'Active',
        condenser_warranty_details: report.condenser_warranty_details || '',
        condenser_photos: report.condenser_photos || [],
        condenser_fan_motor: report.condenser_fan_motor || 'Normal Operation',
        rated_rla: report.rated_rla || '',
        rated_lra: report.rated_lra || '',
        actual_rla: report.actual_rla || '',
        actual_lra: report.actual_lra || '',
        refrigerant_type: report.refrigerant_type || 'R-410A',
        superheat: report.superheat || '',
        subcooling: report.subcooling || '',
        refrigerant_status: report.refrigerant_status || 'Good',
        refrigerant_photos: report.refrigerant_photos || [],
        blower_motor_type: report.blower_motor_type || 'PSC Motor',
        blower_motor_capacitor_rating: report.blower_motor_capacitor_rating || '',
        blower_motor_capacitor_reading: report.blower_motor_capacitor_reading || '',
        condenser_capacitor_herm_rating: report.condenser_capacitor_herm_rating || '',
        condenser_capacitor_herm_reading: report.condenser_capacitor_herm_reading || '',
        condenser_capacitor_fan_rating: report.condenser_capacitor_fan_rating || '',
        condenser_capacitor_fan_reading: report.condenser_capacitor_fan_reading || '',
        capacitor_photos: report.capacitor_photos || [],
        return_temp: report.return_temp || '',
        supply_temp: report.supply_temp || '',
        temperature_photos: report.temperature_photos || [],
        overflow_float_switch: report.overflow_float_switch || 'Normal Operation',
        primary_drain: report.primary_drain || 'Good',
        primary_drain_notes: report.primary_drain_notes || '',
        drain_pan_condition: report.drain_pan_condition || 'Good shape',
        drainage_photos: report.drainage_photos || [],
        air_filters: report.air_filters || 'Filters Replaced (Provided by the technician)',
        filters_list: report.filters_list || [{size: '', quantity: ''}],
        evaporator_coil: report.evaporator_coil || 'Clean and in good condition',
        condenser_coils: report.condenser_coils || 'Cleaned with Fresh Water',
        air_purifier: report.air_purifier || 'Good',
        plenums: report.plenums || 'Good',
        ductwork: report.ductwork || 'Good',
        indoor_air_quality_photos: report.indoor_air_quality_photos || [],
        general_photos: report.general_photos || [],
        notes: report.notes || '',
        other_repair_recommendations: report.other_repair_recommendations || ''
      });
      
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load report');
      navigate('/technician/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      toast.error('Please login first');
      navigate('/technician/login');
      return;
    }

    setLoadingSubmit(true);

    try {
      const payload = {
        ...formData,
        superheat: parseFloat(formData.superheat),
        subcooling: parseFloat(formData.subcooling),
        blower_motor_capacitor_rating: formData.blower_motor_type === 'PSC Motor' ? parseFloat(formData.blower_motor_capacitor_rating) : null,
        blower_motor_capacitor_reading: formData.blower_motor_type === 'PSC Motor' ? parseFloat(formData.blower_motor_capacitor_reading) : null,
        condenser_capacitor_herm_rating: parseFloat(formData.condenser_capacitor_herm_rating),
        condenser_capacitor_herm_reading: parseFloat(formData.condenser_capacitor_herm_reading),
        condenser_capacitor_fan_rating: parseFloat(formData.condenser_capacitor_fan_rating),
        condenser_capacitor_fan_reading: parseFloat(formData.condenser_capacitor_fan_reading),
        return_temp: parseFloat(formData.return_temp),
        supply_temp: parseFloat(formData.supply_temp),
        evaporator_age: formData.evaporator_age || "",
        condenser_age: formData.condenser_age || ""
      };

      const response = await axios.put(`${API}/reports/${reportId}/edit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Report updated successfully! (Version ${response.data.current_version})`);
      navigate('/technician/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update report');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Snowflake className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-blue-700">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/technician/dashboard')}
          className="mb-4 sm:mb-6 text-blue-700 hover:text-blue-900 min-h-[44px]"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 fade-in">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex-shrink-0">
              <Snowflake className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">Edit Maintenance Report</h1>
              {editInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Version {editInfo.current_version} | Edits: {editInfo.edit_count}/3
                </p>
              )}
              <p className="text-sm sm:text-base text-blue-700">Enter all system readings and maintenance details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="glass-dark rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b-2 border-blue-300 pb-2">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name" className="text-blue-900">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email" className="text-blue-900">Customer Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="customer-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone" className="text-blue-900">Customer Phone *</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="customer-phone-input"
                  />
                </div>
              </div>
            </div>

            {/* Indoor Unit / Air Handler */}
            <div className="glass-dark rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b-2 border-blue-300 pb-2">Indoor Unit / Air Handler</h2>

              {/* Evaporator Coil Subsection */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#1C325E'}}>Evaporator Coil</h3>
                
                {/* Data Plate Scanner */}
                <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <DataPlateScanner
                    equipmentType="evaporator"
                    onDataExtracted={(data) => {
                      setFormData({
                        ...formData,
                        evaporator_brand: data.brand || formData.evaporator_brand,
                        evaporator_model_number: data.model_number || formData.evaporator_model_number,
                        evaporator_serial_number: data.serial_number || formData.evaporator_serial_number,
                        evaporator_date_of_manufacture: data.date_of_manufacture || formData.evaporator_date_of_manufacture,
                        evaporator_age: data.age || formData.evaporator_age,
                        evaporator_warranty_status: data.warranty_status || formData.evaporator_warranty_status
                      });
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="evaporator_brand" className="text-blue-900">Brand *</Label>
                    <Input
                      id="evaporator_brand"
                      value={formData.evaporator_brand}
                      onChange={(e) => setFormData({...formData, evaporator_brand: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="evaporator-brand-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_model_number" className="text-blue-900">Model Number *</Label>
                    <Input
                      id="evaporator_model_number"
                      value={formData.evaporator_model_number}
                      onChange={(e) => setFormData({...formData, evaporator_model_number: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="evaporator-model-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_serial_number" className="text-blue-900">Serial Number *</Label>
                    <Input
                      id="evaporator_serial_number"
                      value={formData.evaporator_serial_number}
                      onChange={(e) => setFormData({...formData, evaporator_serial_number: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="evaporator-serial-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_date_of_manufacture" className="text-blue-900">Date of Manufacture</Label>
                    <Input
                      id="evaporator_date_of_manufacture"
                      value={formData.evaporator_date_of_manufacture}
                      onChange={(e) => setFormData({...formData, evaporator_date_of_manufacture: e.target.value})}
                      className="mt-1"
                      placeholder="e.g., March 2023"
                      data-testid="evaporator-dom-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_age" className="text-blue-900">Age</Label>
                    <Input
                      id="evaporator_age"
                      value={formData.evaporator_age}
                      onChange={(e) => setFormData({...formData, evaporator_age: e.target.value})}
                      className="mt-1"
                      placeholder="e.g., 2 years 8 months"
                      data-testid="evaporator-age-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_warranty_status" className="text-blue-900">Warranty Status *</Label>
                    <Input
                      id="evaporator_warranty_status"
                      value={formData.evaporator_warranty_status}
                      onChange={(e) => setFormData({...formData, evaporator_warranty_status: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., Active (5 years remaining)"
                      data-testid="evaporator-warranty-input"
                    />
                  </div>
                </div>
                
                {/* Warranty Scanner */}
                <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-semibold mb-2" style={{color: '#DB7218'}}>Automatic Warranty Lookup</h4>
                  <WarrantyScanner
                    brand={formData.evaporator_brand}
                    serialNumber={formData.evaporator_serial_number}
                    onWarrantyExtracted={(data) => {
                      setFormData({
                        ...formData,
                        evaporator_age: data.age || formData.evaporator_age,
                        evaporator_warranty_status: data.warranty_status || formData.evaporator_warranty_status,
                        evaporator_warranty_details: data.warranty_details || formData.evaporator_warranty_details
                      });
                    }}
                  />
                </div>

                <PhotoUpload
                  photos={formData.evaporator_photos}
                  onChange={(photos) => setFormData({...formData, evaporator_photos: photos})}
                  label="Evaporator Coil Photos"
                  maxPhotos={5}
                />
              </div>
            </div>

            {/* Temperature Readings */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Temperature (Delta T)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return_temp" className="text-blue-900">Return Air Temp (°F) *</Label>
                  <Input
                    id="return_temp"
                    type="number"
                    step="0.1"
                    value={formData.return_temp}
                    onChange={(e) => setFormData({...formData, return_temp: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 78"
                    data-testid="return-temp-input"
                  />
                </div>
                <div>
                  <Label htmlFor="supply_temp" className="text-blue-900">Supply Air Temp (°F) *</Label>
                  <Input
                    id="supply_temp"
                    type="number"
                    step="0.1"
                    value={formData.supply_temp}
                    onChange={(e) => setFormData({...formData, supply_temp: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 60"
                    data-testid="supply-temp-input"
                  />
                </div>
              </div>
              <PhotoUpload
                photos={formData.temperature_photos}
                onChange={(photos) => setFormData({...formData, temperature_photos: photos})}
                label="Temperature Reading Photos"
                maxPhotos={3}
              />
            </div>

            {/* Capacitor Readings */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Capacitors</h2>
              
              {/* Blower Motor Capacitor */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Blower Motor Capacitor</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="blower_motor_type" className="text-blue-900">Blower Motor Type *</Label>
                    <Select 
                      value={formData.blower_motor_type} 
                      onValueChange={(value) => setFormData({...formData, blower_motor_type: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="blower-motor-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PSC Motor">PSC Motor</SelectItem>
                        <SelectItem value="ECM Motor">ECM Motor (No capacitor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.blower_motor_type === 'PSC Motor' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blower_motor_capacitor_rating" className="text-blue-900">Rating (µF) *</Label>
                      <Input
                        id="blower_motor_capacitor_rating"
                        type="number"
                        step="0.1"
                        value={formData.blower_motor_capacitor_rating}
                        onChange={(e) => setFormData({...formData, blower_motor_capacitor_rating: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 7.5"
                        data-testid="blower-capacitor-rating-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="blower_motor_capacitor_reading" className="text-blue-900">Reading (µF) *</Label>
                      <Input
                        id="blower_motor_capacitor_reading"
                        type="number"
                        step="0.1"
                        value={formData.blower_motor_capacitor_reading}
                        onChange={(e) => setFormData({...formData, blower_motor_capacitor_reading: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 7.2"
                        data-testid="blower-capacitor-reading-input"
                      />
                    </div>
                  </div>
                )}
              </div>
              <PhotoUpload
                photos={formData.capacitor_photos}
                onChange={(photos) => setFormData({...formData, capacitor_photos: photos})}
                label="Capacitor Photos"
                maxPhotos={3}
              />
            </div>

            {/* Drainage & Components */}
            {/* Overflow / Float Switch */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Overflow / Float Switch</h2>
              <div>
                <Label htmlFor="overflow_float_switch" className="text-blue-900">Status *</Label>
                <Select 
                  value={formData.overflow_float_switch} 
                  onValueChange={(value) => setFormData({...formData, overflow_float_switch: value})}
                >
                  <SelectTrigger className="mt-1" data-testid="overflow-float-switch-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal Operation">Normal Operation</SelectItem>
                    <SelectItem value="Inoperative or Malfunctioning (Replace)">Inoperative or Malfunctioning (Replace)</SelectItem>
                    <SelectItem value="Overflow / Float Switch Missing">Overflow / Float Switch Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Drainage & Components</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_drain" className="text-blue-900">Primary Drain *</Label>
                  <Select 
                    value={formData.primary_drain} 
                    onValueChange={(value) => setFormData({...formData, primary_drain: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="primary-drain-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flushed and draining normally">Flushed and draining normally</SelectItem>
                      <SelectItem value="Clogged, needs immediate service">Clogged, needs immediate service</SelectItem>
                      <SelectItem value="Need Improvements (See notes below)">Need Improvements (See notes below)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drain_pan_condition" className="text-blue-900">Drain Pan *</Label>
                  <Select 
                    value={formData.drain_pan_condition} 
                    onValueChange={(value) => setFormData({...formData, drain_pan_condition: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="drain-pan-condition-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good shape">Good shape</SelectItem>
                      <SelectItem value="Fair condition">Fair condition</SelectItem>
                      <SelectItem value="Poor condition (Replace Soon)">Poor condition (Replace Soon)</SelectItem>
                      <SelectItem value="Rusted and should be replaced">Rusted and should be replaced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.primary_drain === "Need Improvements (See notes below)" && (
                <div className="mt-4">
                  <Label htmlFor="primary_drain_notes" className="text-blue-900">Primary Drain Notes</Label>
                  <Textarea
                    id="primary_drain_notes"
                    value={formData.primary_drain_notes}
                    onChange={(e) => setFormData({...formData, primary_drain_notes: e.target.value})}
                    placeholder="Enter details about improvements needed..."
                    rows={3}
                    className="mt-1"
                    data-testid="primary-drain-notes-textarea"
                  />
                </div>
              )}
              <PhotoUpload
                photos={formData.drainage_photos}
                onChange={(photos) => setFormData({...formData, drainage_photos: photos})}
                label="Drainage Photos"
                maxPhotos={3}
              />
            </div>

            {/* Air Filters */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Air Filters</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="air_filters" className="text-blue-900">Air Filters *</Label>
                  <Select 
                    value={formData.air_filters} 
                    onValueChange={(value) => setFormData({...formData, air_filters: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="air-filters-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Filters Replaced (Provided by the technician)">Filters Replaced (Provided by the technician)</SelectItem>
                      <SelectItem value="Filters Replaced (Provided by the Customer)">Filters Replaced (Provided by the Customer)</SelectItem>
                      <SelectItem value="Customer recently replaced the filters">Customer recently replaced the filters</SelectItem>
                      <SelectItem value="Customer will replace the filters soon">Customer will replace the filters soon</SelectItem>
                      <SelectItem value="Tech will return to replace filters">Tech will return to replace filters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Filter Details - Show when technician provided filters or tech will return */}
              {(formData.air_filters === "Filters Replaced (Provided by the technician)" || formData.air_filters === "Tech will return to replace filters") && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-blue-900">Filter Details</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        const newFilters = [...formData.filters_list, { size: '', quantity: '' }];
                        setFormData({...formData, filters_list: newFilters});
                      }}
                      size="sm"
                      className="text-white"
                      style={{backgroundColor: '#DB7218'}}
                    >
                      <span className="mr-1">+</span> Add Filter
                    </Button>
                  </div>
                  
                  {formData.filters_list.map((filter, index) => (
                    <div key={index} className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label htmlFor={`filter_size_${index}`} className="text-blue-900">Filter Size</Label>
                        <Input
                          id={`filter_size_${index}`}
                          value={filter.size}
                          onChange={(e) => {
                            const newFilters = [...formData.filters_list];
                            newFilters[index].size = e.target.value;
                            setFormData({...formData, filters_list: newFilters});
                          }}
                          className="mt-1"
                          placeholder="e.g., 16x25x1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`filter_quantity_${index}`} className="text-blue-900">Quantity</Label>
                          <Input
                            id={`filter_quantity_${index}`}
                            type="number"
                            min="1"
                            value={filter.quantity}
                            onChange={(e) => {
                              const newFilters = [...formData.filters_list];
                              newFilters[index].quantity = e.target.value;
                              setFormData({...formData, filters_list: newFilters});
                            }}
                            className="mt-1"
                            placeholder="e.g., 2"
                          />
                        </div>
                        {formData.filters_list.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              onClick={() => {
                                const newFilters = formData.filters_list.filter((_, i) => i !== index);
                                setFormData({...formData, filters_list: newFilters});
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Indoor Air Quality */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Indoor Air Quality</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="air_purifier" className="text-blue-900">Air Purifier *</Label>
                  <Select 
                    value={formData.air_purifier} 
                    onValueChange={(value) => setFormData({...formData, air_purifier: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="air-purifier-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="UV light needs replacement">UV light needs replacement</SelectItem>
                      <SelectItem value="Air purifier needs replacement">Air purifier needs replacement</SelectItem>
                      <SelectItem value="None present">None present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plenums" className="text-blue-900">Plenums *</Label>
                  <Select 
                    value={formData.plenums} 
                    onValueChange={(value) => setFormData({...formData, plenums: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="plenums-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good condition">Good condition</SelectItem>
                      <SelectItem value="Repairs needed">Repairs needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ductwork" className="text-blue-900">Ductwork *</Label>
                  <Select 
                    value={formData.ductwork} 
                    onValueChange={(value) => setFormData({...formData, ductwork: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="ductwork-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good condition">Good condition</SelectItem>
                      <SelectItem value="Deterioration noticed">Deterioration noticed</SelectItem>
                      <SelectItem value="Need repairs">Need repairs</SelectItem>
                      <SelectItem value="Need replacement">Need replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <PhotoUpload
                photos={formData.indoor_air_quality_photos}
                onChange={(photos) => setFormData({...formData, indoor_air_quality_photos: photos})}
                label="Indoor Air Quality Photos"
                maxPhotos={5}
              />
            </div>

            {/* Evaporator Coil */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Evaporator Coil</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="evaporator_coil" className="text-blue-900">Evaporator Coil *</Label>
                  <Select 
                    value={formData.evaporator_coil} 
                    onValueChange={(value) => setFormData({...formData, evaporator_coil: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="evaporator-coil-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clean">Clean</SelectItem>
                      <SelectItem value="Not accessible">Not accessible</SelectItem>
                      <SelectItem value="Needs cleaning">Needs cleaning</SelectItem>
                      <SelectItem value="Cleaned">Cleaned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Condenser */}
            <div className="glass-dark rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b-2 border-blue-300 pb-2">Condenser</h2>

              {/* Condenser Information */}
              <div className="pt-4">
                {/* Data Plate Scanner */}
                <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <DataPlateScanner
                    equipmentType="condenser"
                    onDataExtracted={(data) => {
                      setFormData({
                        ...formData,
                        condenser_brand: data.brand || formData.condenser_brand,
                        condenser_model_number: data.model_number || formData.condenser_model_number,
                        condenser_serial_number: data.serial_number || formData.condenser_serial_number,
                        condenser_date_of_manufacture: data.date_of_manufacture || formData.condenser_date_of_manufacture,
                        condenser_age: data.age || formData.condenser_age,
                        condenser_warranty_status: data.warranty_status || formData.condenser_warranty_status,
                        rated_rla: data.rla || formData.rated_rla,
                        rated_lra: data.lra || formData.rated_lra
                      });
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="condenser_brand" className="text-blue-900">Brand *</Label>
                    <Input
                      id="condenser_brand"
                      value={formData.condenser_brand}
                      onChange={(e) => setFormData({...formData, condenser_brand: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="condenser-brand-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_model_number" className="text-blue-900">Model Number *</Label>
                    <Input
                      id="condenser_model_number"
                      value={formData.condenser_model_number}
                      onChange={(e) => setFormData({...formData, condenser_model_number: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="condenser-model-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_serial_number" className="text-blue-900">Serial Number *</Label>
                    <Input
                      id="condenser_serial_number"
                      value={formData.condenser_serial_number}
                      onChange={(e) => setFormData({...formData, condenser_serial_number: e.target.value})}
                      required
                      className="mt-1"
                      data-testid="condenser-serial-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_date_of_manufacture" className="text-blue-900">Date of Manufacture</Label>
                    <Input
                      id="condenser_date_of_manufacture"
                      value={formData.condenser_date_of_manufacture}
                      onChange={(e) => setFormData({...formData, condenser_date_of_manufacture: e.target.value})}
                      className="mt-1"
                      placeholder="e.g., March 2023"
                      data-testid="condenser-dom-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_age" className="text-blue-900">Age</Label>
                    <Input
                      id="condenser_age"
                      value={formData.condenser_age}
                      onChange={(e) => setFormData({...formData, condenser_age: e.target.value})}
                      className="mt-1"
                      placeholder="e.g., 2 years 8 months"
                      data-testid="condenser-age-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_warranty_status" className="text-blue-900">Warranty Status *</Label>
                    <Input
                      id="condenser_warranty_status"
                      value={formData.condenser_warranty_status}
                      onChange={(e) => setFormData({...formData, condenser_warranty_status: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., Active (5 years remaining)"
                      data-testid="condenser-warranty-input"
                    />
                  </div>
                </div>
                
                {/* Warranty Scanner */}
                <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-semibold mb-2" style={{color: '#DB7218'}}>Automatic Warranty Lookup</h4>
                  <WarrantyScanner
                    brand={formData.condenser_brand}
                    serialNumber={formData.condenser_serial_number}
                    onWarrantyExtracted={(data) => {
                      setFormData({
                        ...formData,
                        condenser_age: data.age || formData.condenser_age,
                        condenser_warranty_status: data.warranty_status || formData.condenser_warranty_status,
                        condenser_warranty_details: data.warranty_details || formData.condenser_warranty_details
                      });
                    }}
                  />
                </div>

                <PhotoUpload
                  photos={formData.condenser_photos}
                  onChange={(photos) => setFormData({...formData, condenser_photos: photos})}
                  label="Condenser Photos"
                  maxPhotos={5}
                />
              </div>

              {/* Condenser Fan Motor */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#1C325E'}}>Condenser Fan Motor</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condenser_fan_motor" className="text-blue-900">Condenser Fan Motor *</Label>
                    <Select 
                      value={formData.condenser_fan_motor} 
                      onValueChange={(value) => setFormData({...formData, condenser_fan_motor: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="condenser-fan-motor-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal Operation">Normal Operation</SelectItem>
                        <SelectItem value="Motor Vibration">Motor Vibration</SelectItem>
                        <SelectItem value="Blade Vibration">Blade Vibration</SelectItem>
                        <SelectItem value="Inoperative">Inoperative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Condenser Dual Run Capacitor */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#1C325E'}}>Condenser Dual Run Capacitor</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  {/* Left Column - Actual Readings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Actual Readings (µF)</h4>
                    <div>
                      <Label htmlFor="condenser_capacitor_herm_reading" className="text-blue-900">Common to Herm Terminal *</Label>
                      <Input
                        id="condenser_capacitor_herm_reading"
                        type="number"
                        step="0.1"
                        value={formData.condenser_capacitor_herm_reading}
                        onChange={(e) => setFormData({...formData, condenser_capacitor_herm_reading: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 35"
                        data-testid="condenser-capacitor-herm-reading-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condenser_capacitor_fan_reading" className="text-blue-900">Common to Fan Terminal *</Label>
                      <Input
                        id="condenser_capacitor_fan_reading"
                        type="number"
                        step="0.1"
                        value={formData.condenser_capacitor_fan_reading}
                        onChange={(e) => setFormData({...formData, condenser_capacitor_fan_reading: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 5"
                        data-testid="condenser-capacitor-fan-reading-input"
                      />
                    </div>
                  </div>

                  {/* Right Column - Capacitor Rating */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Capacitor Rating (µF)</h4>
                    <div>
                      <Label htmlFor="condenser_capacitor_herm_rating" className="text-blue-900">Common to Herm Terminal *</Label>
                      <Input
                        id="condenser_capacitor_herm_rating"
                        type="number"
                        step="0.1"
                        value={formData.condenser_capacitor_herm_rating}
                        onChange={(e) => setFormData({...formData, condenser_capacitor_herm_rating: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 35"
                        data-testid="condenser-capacitor-herm-rating-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condenser_capacitor_fan_rating" className="text-blue-900">Common to Fan Terminal *</Label>
                      <Input
                        id="condenser_capacitor_fan_rating"
                        type="number"
                        step="0.1"
                        value={formData.condenser_capacitor_fan_rating}
                        onChange={(e) => setFormData({...formData, condenser_capacitor_fan_rating: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="e.g., 5"
                        data-testid="condenser-capacitor-fan-rating-input"
                      />
                    </div>
                  </div>
                </div>
                <PhotoUpload
                  photos={formData.capacitor_photos}
                  onChange={(photos) => setFormData({...formData, capacitor_photos: photos})}
                  label="Capacitor Photos"
                  maxPhotos={3}
                />
                
                {/* RLA/LRA Section */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-blue-800">Actual Readings</h4>
                    <div>
                      <Label htmlFor="actual_rla" className="text-blue-900">Actual RLA (Amps)</Label>
                      <Input
                        id="actual_rla"
                        type="number"
                        step="0.1"
                        value={formData.actual_rla}
                        onChange={(e) => setFormData({...formData, actual_rla: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., 18.5"
                        data-testid="actual-rla-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actual_lra" className="text-blue-900">Actual LRA (Amps)</Label>
                      <Input
                        id="actual_lra"
                        type="number"
                        step="0.1"
                        value={formData.actual_lra}
                        onChange={(e) => setFormData({...formData, actual_lra: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., 95"
                        data-testid="actual-lra-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-blue-800">Rated Values (from Data Plate)</h4>
                    <div>
                      <Label htmlFor="rated_rla" className="text-blue-900">Rated RLA (Amps)</Label>
                      <Input
                        id="rated_rla"
                        type="number"
                        step="0.1"
                        value={formData.rated_rla}
                        onChange={(e) => setFormData({...formData, rated_rla: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., 18.5"
                        data-testid="rated-rla-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rated_lra" className="text-blue-900">Rated LRA (Amps)</Label>
                      <Input
                        id="rated_lra"
                        type="number"
                        step="0.1"
                        value={formData.rated_lra}
                        onChange={(e) => setFormData({...formData, rated_lra: e.target.value})}
                        className="mt-1"
                        placeholder="e.g., 95"
                        data-testid="rated-lra-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Refrigerant */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#1C325E'}}>Refrigerant</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="refrigerant_type" className="text-blue-900">Refrigerant Type *</Label>
                    <Select 
                      value={formData.refrigerant_type} 
                      onValueChange={(value) => setFormData({...formData, refrigerant_type: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="refrigerant-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R-410A">R-410A (Puron)</SelectItem>
                        <SelectItem value="R-22">R-22 (Freon)</SelectItem>
                        <SelectItem value="R-32">R-32</SelectItem>
                        <SelectItem value="R-134A">R-134A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="refrigerant_status" className="text-blue-900">Refrigerant Status *</Label>
                    <Select 
                      value={formData.refrigerant_status} 
                      onValueChange={(value) => setFormData({...formData, refrigerant_status: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="refrigerant-status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Low - Add Refrigerant">Low - Add Refrigerant</SelectItem>
                        <SelectItem value="Critical - Repairs may be needed">Critical - Repairs may be needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="superheat" className="text-blue-900">Superheat (°F) *</Label>
                    <Input
                      id="superheat"
                      type="number"
                      step="0.1"
                      value={formData.superheat}
                      onChange={(e) => setFormData({...formData, superheat: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., 10.5"
                      data-testid="superheat-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcooling" className="text-blue-900">Subcooling (°F) *</Label>
                    <Input
                      id="subcooling"
                      type="number"
                      step="0.1"
                      value={formData.subcooling}
                      onChange={(e) => setFormData({...formData, subcooling: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., 8.5"
                      data-testid="subcooling-input"
                    />
                  </div>
                </div>
                <PhotoUpload
                  photos={formData.refrigerant_photos}
                  onChange={(photos) => setFormData({...formData, refrigerant_photos: photos})}
                  label="Refrigerant Photos"
                  maxPhotos={3}
                />
              </div>

              {/* Electrical section removed */}

              {/* Condenser Coils */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#1C325E'}}>Condenser Coils</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condenser_coils" className="text-blue-900">Condenser Coils *</Label>
                    <Select 
                      value={formData.condenser_coils} 
                      onValueChange={(value) => setFormData({...formData, condenser_coils: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="condenser-coils-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cleaned with Fresh Water">Cleaned with Fresh Water</SelectItem>
                        <SelectItem value="Unable to clean (Hose bib not accessible within 40ft)">Unable to clean (Hose bib not accessible within 40ft)</SelectItem>
                        <SelectItem value="Coils excessively dirty (Cabinet must be disassembled to properly clean)">Coils excessively dirty (Cabinet must be disassembled to properly clean)</SelectItem>
                        <SelectItem value="Debris and leaves clogging coils (Cabinet must be disassembled to properly clean)">Debris and leaves clogging coils (Cabinet must be disassembled to properly clean)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Additional Notes</h2>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional observations or recommendations..."
                rows={4}
                className="mt-1"
                data-testid="notes-textarea"
              />
            </div>

            {/* Other Repair Recommendations */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Other Repair Recommendations</h2>
              <Textarea
                id="other_repair_recommendations"
                value={formData.other_repair_recommendations}
                onChange={(e) => setFormData({...formData, other_repair_recommendations: e.target.value})}
                placeholder="List any other repairs or services needed..."
                rows={4}
                className="mt-1"
                data-testid="other-repair-recommendations-textarea"
              />
            </div>

            {/* General Photos */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Additional Photos</h2>
              <PhotoUpload
                photos={formData.general_photos}
                onChange={(photos) => setFormData({...formData, general_photos: photos})}
                label="General System Photos"
                maxPhotos={10}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white text-base sm:text-lg py-5 sm:py-6 hover:opacity-90 min-h-[52px] sm:min-h-[60px]"
              style={{backgroundColor: '#DB7218'}}
              disabled={loadingSubmit}
              data-testid="submit-report-btn"
            >
              {loading ? 'Creating Report...' : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReport;
