import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateReport = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    evaporator_brand: '',
    evaporator_model_number: '',
    evaporator_serial_number: '',
    evaporator_age: '',
    evaporator_warranty_status: 'Active',
    evaporator_photos: [],
    condenser_brand: '',
    condenser_model_number: '',
    condenser_serial_number: '',
    condenser_age: '',
    condenser_warranty_status: 'Active',
    condenser_photos: [],
    refrigerant_type: 'R-410A',
    superheat: '',
    subcooling: '',
    refrigerant_status: 'Good',
    refrigerant_photos: [],
    blower_motor_capacitor_rating: '',
    blower_motor_capacitor_reading: '',
    condenser_capacitor_rating: '',
    condenser_capacitor_reading: '',
    capacitor_photos: [],
    return_temp: '',
    supply_temp: '',
    temperature_photos: [],
    amp_draw: '',
    rated_amps: '',
    electrical_photos: [],
    primary_drain: 'Flushed and draining normally',
    drain_pan_condition: 'Good shape',
    drainage_photos: [],
    air_filters: 'Filters Provided and Replaced',
    evaporator_coil: 'Clean',
    condenser_coils: 'Cleaned',
    air_purifier: 'Good',
    plenums: 'Good condition',
    ductwork: 'Good condition',
    indoor_air_quality_photos: [],
    general_photos: [],
    notes: '',
    other_repair_recommendations: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      toast.error('Please login first');
      navigate('/technician/login');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        superheat: parseFloat(formData.superheat),
        subcooling: parseFloat(formData.subcooling),
        blower_motor_capacitor_rating: parseFloat(formData.blower_motor_capacitor_rating),
        blower_motor_capacitor_reading: parseFloat(formData.blower_motor_capacitor_reading),
        condenser_capacitor_rating: parseFloat(formData.condenser_capacitor_rating),
        condenser_capacitor_reading: parseFloat(formData.condenser_capacitor_reading),
        return_temp: parseFloat(formData.return_temp),
        supply_temp: parseFloat(formData.supply_temp),
        amp_draw: parseFloat(formData.amp_draw),
        rated_amps: parseFloat(formData.rated_amps),
        evaporator_age: formData.evaporator_age ? parseInt(formData.evaporator_age) : null,
        condenser_age: formData.condenser_age ? parseInt(formData.condenser_age) : null
      };

      const response = await axios.post(`${API}/reports/create`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Report created successfully!');
      
      // Try to copy link to clipboard
      const link = `${window.location.origin}/report/${response.data.unique_link}`;
      try {
        await navigator.clipboard.writeText(link);
        toast.success('Report link copied to clipboard!')
      } catch (err) {
        // Clipboard permission denied - just show the link
        console.log('Clipboard permission denied:', err);
      }
      
      navigate('/technician/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/technician/dashboard')}
          className="mb-6 text-blue-700 hover:text-blue-900"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="glass rounded-2xl p-8 fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-full bg-blue-100">
              <Snowflake className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Create Maintenance Report</h1>
              <p className="text-blue-700">Enter all system readings and maintenance details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="glass-dark rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b-2 border-blue-300 pb-2">Customer Information</h2>
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

            {/* System Information */}
            <div className="glass-dark rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-blue-900 border-b-2 border-blue-300 pb-2">System Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="system_brand" className="text-blue-900">System Brand *</Label>
                  <Input
                    id="system_brand"
                    value={formData.system_brand}
                    onChange={(e) => setFormData({...formData, system_brand: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., Carrier, Trane, Lennox"
                    data-testid="system-brand-input"
                  />
                </div>
                <div>
                  <Label htmlFor="serial_number" className="text-blue-900">Serial Number *</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="serial-number-input"
                  />
                </div>
                <div>
                  <Label htmlFor="installation_year" className="text-blue-900">Installation Year (Optional)</Label>
                  <Input
                    id="installation_year"
                    type="number"
                    min="1980"
                    max={new Date().getFullYear()}
                    value={formData.installation_year}
                    onChange={(e) => setFormData({...formData, installation_year: e.target.value})}
                    className="mt-1"
                    placeholder="e.g., 2015"
                    data-testid="installation-year-input"
                  />
                </div>
                <div>
                  <Label htmlFor="system_warranty_status" className="text-blue-900">System Warranty Status *</Label>
                  <Select 
                    value={formData.system_warranty_status} 
                    onValueChange={(value) => setFormData({...formData, system_warranty_status: value})}
                  >
                    <SelectTrigger className="mt-1" data-testid="warranty-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                      <SelectItem value="Extended Warranty">Extended Warranty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Evaporator Coil Subsection */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#1C325E'}}>Evaporator Coil</h3>
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
                    <Label htmlFor="evaporator_age" className="text-blue-900">Age (Years)</Label>
                    <Input
                      id="evaporator_age"
                      type="number"
                      min="0"
                      value={formData.evaporator_age}
                      onChange={(e) => setFormData({...formData, evaporator_age: e.target.value})}
                      className="mt-1"
                      data-testid="evaporator-age-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="evaporator_warranty_status" className="text-blue-900">Warranty Status *</Label>
                    <Select 
                      value={formData.evaporator_warranty_status} 
                      onValueChange={(value) => setFormData({...formData, evaporator_warranty_status: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="evaporator-warranty-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <PhotoUpload
                  photos={formData.evaporator_photos}
                  onChange={(photos) => setFormData({...formData, evaporator_photos: photos})}
                  label="Evaporator Coil Photos"
                  maxPhotos={5}
                />
              </div>

              {/* Condenser Subsection */}
              <div className="border-t-2 border-blue-200 pt-4">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#1C325E'}}>Condenser</h3>
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
                    <Label htmlFor="condenser_age" className="text-blue-900">Age (Years)</Label>
                    <Input
                      id="condenser_age"
                      type="number"
                      min="0"
                      value={formData.condenser_age}
                      onChange={(e) => setFormData({...formData, condenser_age: e.target.value})}
                      className="mt-1"
                      data-testid="condenser-age-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_warranty_status" className="text-blue-900">Warranty Status *</Label>
                    <Select 
                      value={formData.condenser_warranty_status} 
                      onValueChange={(value) => setFormData({...formData, condenser_warranty_status: value})}
                    >
                      <SelectTrigger className="mt-1" data-testid="condenser-warranty-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <PhotoUpload
                  photos={formData.condenser_photos}
                  onChange={(photos) => setFormData({...formData, condenser_photos: photos})}
                  label="Condenser Photos"
                  maxPhotos={5}
                />
              </div>
            </div>

            {/* Refrigerant Readings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Refrigerant</h2>
              <div className="grid md:grid-cols-2 gap-4">
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

            {/* Capacitor Readings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Capacitors</h2>
              
              {/* Blower Motor Capacitor */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Blower Motor Capacitor</h3>
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
              </div>

              {/* Condenser Dual Run Capacitor */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Condenser Dual Run Capacitor</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condenser_capacitor_rating" className="text-blue-900">Rating (µF) *</Label>
                    <Input
                      id="condenser_capacitor_rating"
                      type="number"
                      step="0.1"
                      value={formData.condenser_capacitor_rating}
                      onChange={(e) => setFormData({...formData, condenser_capacitor_rating: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., 35"
                      data-testid="condenser-capacitor-rating-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condenser_capacitor_reading" className="text-blue-900">Reading (µF) *</Label>
                    <Input
                      id="condenser_capacitor_reading"
                      type="number"
                      step="0.1"
                      value={formData.condenser_capacitor_reading}
                      onChange={(e) => setFormData({...formData, condenser_capacitor_reading: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="e.g., 32.5"
                      data-testid="condenser-capacitor-reading-input"
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
            </div>

            {/* Temperature Readings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Temperature (Delta T)</h2>
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

            {/* Amp Draw */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Electrical</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amp_draw" className="text-blue-900">Actual Amp Draw *</Label>
                  <Input
                    id="amp_draw"
                    type="number"
                    step="0.1"
                    value={formData.amp_draw}
                    onChange={(e) => setFormData({...formData, amp_draw: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 18.5"
                    data-testid="amp-draw-input"
                  />
                </div>
                <div>
                  <Label htmlFor="rated_amps" className="text-blue-900">Rated Amps *</Label>
                  <Input
                    id="rated_amps"
                    type="number"
                    step="0.1"
                    value={formData.rated_amps}
                    onChange={(e) => setFormData({...formData, rated_amps: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 20"
                    data-testid="rated-amps-input"
                  />
                </div>
              </div>
              <PhotoUpload
                photos={formData.electrical_photos}
                onChange={(photos) => setFormData({...formData, electrical_photos: photos})}
                label="Electrical Photos"
                maxPhotos={3}
              />
            </div>

            {/* Drainage & Components */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Drainage & Components</h2>
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drain_pan_condition" className="text-blue-900">Drain Pan Condition *</Label>
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
                      <SelectItem value="Poor condition">Poor condition</SelectItem>
                      <SelectItem value="Rusted and should be replaced">Rusted and should be replaced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <PhotoUpload
                photos={formData.drainage_photos}
                onChange={(photos) => setFormData({...formData, drainage_photos: photos})}
                label="Drainage Photos"
                maxPhotos={3}
              />
            </div>

            {/* Air Filters */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Air Filters</h2>
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
                      <SelectItem value="Filters Provided and Replaced">Filters Provided and Replaced</SelectItem>
                      <SelectItem value="Filters Supplied by the customer">Filters Supplied by the customer</SelectItem>
                      <SelectItem value="Customer recently replaced the filters">Customer recently replaced the filters</SelectItem>
                      <SelectItem value="Customer will replace the filters soon">Customer will replace the filters soon</SelectItem>
                      <SelectItem value="Tech will return to replace filters">Tech will return to replace filters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectItem value="Cleaned">Cleaned</SelectItem>
                      <SelectItem value="Hose bib not accessible within 30ft">Hose bib not accessible within 30ft</SelectItem>
                      <SelectItem value="Need deep cleaning">Need deep cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Indoor Air Quality */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Indoor Air Quality</h2>
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

            {/* Notes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Additional Notes</h2>
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Other Repair Recommendations</h2>
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Additional Photos</h2>
              <PhotoUpload
                photos={formData.general_photos}
                onChange={(photos) => setFormData({...formData, general_photos: photos})}
                label="General System Photos"
                maxPhotos={10}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white text-lg py-6 hover:opacity-90"
              style={{backgroundColor: '#DB7218'}}
              disabled={loading}
              data-testid="submit-report-btn"
            >
              {loading ? 'Creating Report...' : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Create Report & Generate Link
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;
