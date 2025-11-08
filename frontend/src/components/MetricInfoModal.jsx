import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const MetricInfoModal = ({ isOpen, onClose, metric, status }) => {
  const getMetricInfo = () => {
    switch(metric) {
      case 'capacitor':
        return {
          title: 'Capacitor',
          function: 'The capacitor is a critical electrical component that provides the initial boost of electricity needed to start your AC compressor and fan motors. It stores and releases electrical energy, helping your system start efficiently and run smoothly.',
          importance: 'Without a properly functioning capacitor, your AC system may struggle to start, run inefficiently, or fail to operate entirely. The capacitor ensures consistent power delivery to the motor components.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Complete system failure - your AC may stop working entirely',
              'Hard starting - repeated clicking sounds when trying to start',
              'Overheating of compressor and motors leading to permanent damage',
              'Significantly higher energy bills due to inefficient operation',
              'Shortened lifespan of expensive compressor (can cost $1,500-$2,500 to replace)',
              'Risk of motor burnout requiring emergency repairs'
            ]
          } : null,
          recommendation: status === 'critical' 
            ? 'URGENT: Schedule immediate replacement. Continuing to operate can cause catastrophic compressor failure.'
            : status === 'warning'
            ? 'RECOMMENDED: Replace capacitor during next service visit to prevent future breakdown.'
            : 'Your capacitor is functioning within normal parameters. Continue regular maintenance checks.'
        };

      case 'temperature':
        return {
          title: 'Temperature (Delta T)',
          function: 'Delta T measures the temperature difference between the air entering your system (return air) and the air coming out (supply air). This is one of the most important indicators of your AC\'s cooling efficiency. The ideal range is 15-22°F.',
          importance: 'Delta T tells us if your system is removing heat effectively. Too low suggests insufficient cooling, while too high can indicate restricted airflow or refrigerant issues.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Inadequate cooling - rooms won\'t reach desired temperature',
              'Increased humidity levels causing discomfort and mold growth',
              'Frozen evaporator coil leading to water damage',
              'Compressor running excessively, shortening its lifespan',
              'Energy costs 20-40% higher than normal',
              'Poor indoor air quality and uneven temperature distribution'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'URGENT: System is not cooling properly. Schedule immediate inspection to prevent further damage.'
            : status === 'warning'
            ? 'ATTENTION: Cooling efficiency is declining. Have system checked to identify root cause.'
            : 'Your system is achieving optimal temperature differential. Excellent cooling performance.'
        };

      case 'electrical':
        return {
          title: 'Electrical (Amp Draw)',
          function: 'Amp draw measures the electrical current your AC system uses during operation. Each system has a rated amp draw based on its size and efficiency. The actual draw should closely match the rated specification.',
          importance: 'Proper amp draw indicates all electrical components are working efficiently. Deviations signal problems with the compressor, fan motors, or other electrical components.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Electrical fire risk from overloaded circuits',
              'Tripped breakers causing system shutdowns',
              'Premature failure of electrical components',
              'High energy bills from inefficient operation',
              'Compressor damage from working too hard or not hard enough',
              'Potential damage to home\'s electrical panel'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'URGENT: Abnormal electrical draw can be dangerous. Immediate professional inspection required.'
            : status === 'warning'
            ? 'RECOMMENDED: Schedule electrical system check to prevent future issues.'
            : 'Electrical draw is within normal range. Your system is operating efficiently.'
        };

      case 'refrigerant':
        return {
          title: 'Refrigerant',
          function: 'Refrigerant is the lifeblood of your AC system. This special chemical absorbs heat from inside your home and releases it outside. It circulates continuously through the system in a closed loop, changing from liquid to gas and back.',
          importance: 'Proper refrigerant levels are critical for efficient cooling. The system is designed to operate with a specific amount - too little or too much dramatically reduces efficiency and can damage components.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'No cooling - system blows warm air instead of cold',
              'Ice buildup on refrigerant lines and evaporator coil',
              'Compressor failure from running without proper lubrication (can cost $2,000-$4,000)',
              'Energy consumption increases by 20-50%',
              'Environmental harm if system has a leak',
              'Complete system replacement if compressor burns out'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'URGENT: Critical refrigerant level. System must be inspected immediately to prevent compressor damage.'
            : status === 'warning'
            ? 'RECOMMENDED: Schedule refrigerant check and leak inspection soon.'
            : 'Refrigerant level is optimal. Your system has proper charge for efficient operation.'
        };

      case 'drain':
        return {
          title: 'Primary Drain',
          function: 'Your AC system removes moisture from the air as it cools. This condensation must drain away properly through the primary drain line. A clear, functioning drain prevents water backup and potential damage to your home.',
          importance: 'The drain system handles several gallons of water per day during hot weather. Clogs can cause immediate water damage and create breeding grounds for harmful mold and bacteria.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Water damage to ceilings, walls, and floors (can cost thousands to repair)',
              'Mold and mildew growth affecting indoor air quality and health',
              'System shutdown due to overflow safety switch activation',
              'Structural damage to your home from prolonged water exposure',
              'Damage to furnace or air handler from water exposure',
              'Expensive emergency cleanup and remediation'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'URGENT: Clogged drain requires immediate attention to prevent water damage to your home.'
            : 'Your drain line is clear and functioning properly. Regular flushing recommended annually.'
        };

      case 'drain_pan':
        return {
          title: 'Drain Pan',
          function: 'The drain pan catches condensation that forms on the evaporator coil. It channels this water to the drain line. The pan must be in good condition without rust, holes, or corrosion to prevent leaks.',
          importance: 'A compromised drain pan can leak water directly into your home, causing immediate damage. Rust or deterioration can create holes that bypass the drain system entirely.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Water leaking through ceiling causing visible stains and damage',
              'Mold growth in walls, ceiling, and insulation',
              'Electrical hazards from water near wiring',
              'Expensive repairs to drywall, flooring, and framing',
              'Health risks from mold exposure',
              'Decreased home value from water damage history'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'URGENT: Rusted drain pan should be replaced immediately to prevent water damage.'
            : status === 'warning'
            ? 'RECOMMENDED: Schedule drain pan replacement soon before it fails completely.'
            : 'Drain pan is in good condition. Continue monitoring during annual maintenance.'
        };

      case 'air_purifier':
        return {
          title: 'Air Purifier',
          function: 'The air purification system (typically UV light) kills bacteria, viruses, mold spores, and other airborne contaminants as air passes through your HVAC system. It improves indoor air quality and helps keep your system clean.',
          importance: 'UV lights and air purifiers prevent biological growth inside your AC system and improve the air you breathe. They\'re especially important for people with allergies, asthma, or respiratory conditions.',
          warning: status !== 'good' ? {
            title: 'Potential Issues if Ignored',
            points: [
              'Mold and bacteria growth inside air handler',
              'Reduced indoor air quality affecting health',
              'Musty odors from HVAC system',
              'Increased allergy and asthma symptoms',
              'Biological contamination of ductwork',
              'More frequent illnesses in household members'
            ]
          } : null,
          recommendation: status === 'critical'
            ? 'RECOMMENDED: Replace air purifier or UV light to maintain healthy indoor air quality.'
            : status === 'warning'
            ? 'RECOMMENDED: Schedule UV light replacement during next service visit.'
            : status === 'none'
            ? 'No air purification system detected. Consider adding UV light for improved air quality.'
            : 'Air purification system is working effectively to keep your air clean.'
        };

      default:
        return null;
    }
  };

  const info = getMetricInfo();
  if (!info) return null;

  const getStatusColor = () => {
    if (status === 'critical') return '#ef4444';
    if (status === 'warning') return '#f97316';
    return '#22c55e';
  };

  const getStatusIcon = () => {
    if (status === 'critical') return <AlertTriangle className="w-6 h-6" />;
    if (status === 'warning') return <AlertTriangle className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{color: '#1C325E'}}>
            <div style={{color: getStatusColor()}}>
              {getStatusIcon()}
            </div>
            {info.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Function */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5" style={{color: '#1C325E'}} />
              <h3 className="font-bold text-lg" style={{color: '#1C325E'}}>What It Does</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{info.function}</p>
          </div>

          {/* Importance */}
          <div>
            <h3 className="font-bold text-lg mb-2" style={{color: '#1C325E'}}>Why It Matters</h3>
            <p className="text-gray-700 leading-relaxed">{info.importance}</p>
          </div>

          {/* Warning Section */}
          {info.warning && (
            <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-red-900">{info.warning.title}</h3>
              </div>
              <ul className="space-y-2">
                {info.warning.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-800">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border-2 ${
            status === 'critical' 
              ? 'border-red-300 bg-red-50' 
              : status === 'warning'
              ? 'border-orange-300 bg-orange-50'
              : 'border-green-300 bg-green-50'
          }`}>
            <h3 className="font-bold text-lg mb-2" style={{color: '#1C325E'}}>
              {status === 'critical' ? '⚠️ Immediate Action Required' : 
               status === 'warning' ? '⚡ Recommended Action' : 
               '✅ Status'}
            </h3>
            <p className={`font-medium ${
              status === 'critical' ? 'text-red-900' : 
              status === 'warning' ? 'text-orange-900' : 
              'text-green-900'
            }`}>
              {info.recommendation}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricInfoModal;
