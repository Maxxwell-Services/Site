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

const CreateReport = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    system_brand: '',
    serial_number: '',
    installation_year: '',
    system_warranty_status: 'Active',
    refrigerant_type: 'R-410A',
    refrigerant_level: '',
    refrigerant_status: 'Good',
    capacitor_rating: '',
    capacitor_reading: '',
    return_temp: '',
    supply_temp: '',
    amp_draw: '',
    rated_amps: '',
    primary_drain: 'Flushed and draining normally',
    drain_pan_condition: 'Good shape',
    air_purifier: 'Good',
    filters_replaced: false,
    condenser_coils_cleaned: false,
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
        refrigerant_level: parseFloat(formData.refrigerant_level),
        capacitor_rating: parseFloat(formData.capacitor_rating),
        capacitor_reading: parseFloat(formData.capacitor_reading),
        return_temp: parseFloat(formData.return_temp),
        supply_temp: parseFloat(formData.supply_temp),
        amp_draw: parseFloat(formData.amp_draw),
        rated_amps: parseFloat(formData.rated_amps),
        installation_year: formData.installation_year ? parseInt(formData.installation_year) : null
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Customer Information</h2>
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">System Information</h2>
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
              </div>
            </div>

            {/* Refrigerant Readings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Refrigerant</h2>
              <div className="grid md:grid-cols-3 gap-4">
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
                  <Label htmlFor="refrigerant_level" className="text-blue-900">Refrigerant Level (PSI) *</Label>
                  <Input
                    id="refrigerant_level"
                    type="number"
                    step="0.1"
                    value={formData.refrigerant_level}
                    onChange={(e) => setFormData({...formData, refrigerant_level: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="refrigerant-level-input"
                  />
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
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Capacitor Readings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Capacitor</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacitor_rating" className="text-blue-900">Capacitor Rating (µF) *</Label>
                  <Input
                    id="capacitor_rating"
                    type="number"
                    step="0.1"
                    value={formData.capacitor_rating}
                    onChange={(e) => setFormData({...formData, capacitor_rating: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 35"
                    data-testid="capacitor-rating-input"
                  />
                </div>
                <div>
                  <Label htmlFor="capacitor_reading" className="text-blue-900">Capacitor Reading (µF) *</Label>
                  <Input
                    id="capacitor_reading"
                    type="number"
                    step="0.1"
                    value={formData.capacitor_reading}
                    onChange={(e) => setFormData({...formData, capacitor_reading: e.target.value})}
                    required
                    className="mt-1"
                    placeholder="e.g., 32.5"
                    data-testid="capacitor-reading-input"
                  />
                </div>
              </div>
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
            </div>

            {/* Maintenance Performed */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Maintenance Performed</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
                  <Label htmlFor="filters_replaced" className="text-blue-900 cursor-pointer">
                    Filters Replaced
                  </Label>
                  <Switch
                    id="filters_replaced"
                    checked={formData.filters_replaced}
                    onCheckedChange={(checked) => setFormData({...formData, filters_replaced: checked})}
                    data-testid="filters-replaced-switch"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
                  <Label htmlFor="condenser_coils_cleaned" className="text-blue-900 cursor-pointer">
                    Condenser Coils Cleaned
                  </Label>
                  <Switch
                    id="condenser_coils_cleaned"
                    checked={formData.condenser_coils_cleaned}
                    onCheckedChange={(checked) => setFormData({...formData, condenser_coils_cleaned: checked})}
                    data-testid="condenser-coils-cleaned-switch"
                  />
                </div>
              </div>
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

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
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
