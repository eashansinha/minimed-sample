import { GlucoseReading, TimeInRange } from '@/types/glucose';
import { InsulinDelivery, DeviceStatus } from '@/types/device';
import { addMinutes, subDays } from 'date-fns';

// Generate realistic glucose readings
export const generateGlucoseReadings = (hours: number = 24): GlucoseReading[] => {
  const readings: GlucoseReading[] = [];
  const now = new Date();
  const intervalMinutes = 5;
  const totalReadings = (hours * 60) / intervalMinutes;
  
  let baseValue = 120;
  let trend: GlucoseReading['trend'] = 'stable';
  
  for (let i = totalReadings; i >= 0; i--) {
    const timestamp = addMinutes(now, -i * intervalMinutes);
    
    // Simulate meal effects
    const hourOfDay = timestamp.getHours();
    const isPostMeal = [8, 13, 19].includes(hourOfDay);
    
    if (isPostMeal) {
      baseValue = Math.min(180, baseValue + Math.random() * 30);
      trend = 'rising';
    } else if (baseValue > 140) {
      baseValue = Math.max(80, baseValue - Math.random() * 10);
      trend = 'falling';
    } else {
      baseValue = baseValue + (Math.random() - 0.5) * 5;
      trend = 'stable';
    }
    
    readings.push({
      id: `glucose-${i}`,
      timestamp,
      value: Math.round(baseValue),
      trend,
      source: 'cgm'
    });
  }
  
  return readings;
};

// Generate insulin delivery data
export const generateInsulinDeliveries = (days: number = 7): InsulinDelivery[] => {
  const deliveries: InsulinDelivery[] = [];
  const now = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = subDays(now, day);
    
    // Basal deliveries (hourly)
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      deliveries.push({
        id: `basal-${day}-${hour}`,
        timestamp,
        type: 'basal',
        amount: 0.8 + Math.random() * 0.4,
        reason: 'scheduled'
      });
    }
    
    // Meal boluses
    const mealTimes = [8, 13, 19];
    mealTimes.forEach((hour, index) => {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      deliveries.push({
        id: `bolus-${day}-${index}`,
        timestamp,
        type: 'bolus',
        amount: 4 + Math.random() * 4,
        reason: 'meal',
        carbsEntered: 30 + Math.random() * 40,
        glucoseValue: 100 + Math.random() * 50
      });
    });
    
    // Occasional corrections
    if (Math.random() > 0.5) {
      const correctionHour = Math.floor(Math.random() * 24);
      const timestamp = new Date(date);
      timestamp.setHours(correctionHour, 30, 0, 0);
      
      deliveries.push({
        id: `correction-${day}`,
        timestamp,
        type: 'correction',
        amount: 1 + Math.random() * 2,
        reason: 'correction',
        glucoseValue: 180 + Math.random() * 50
      });
    }
  }
  
  return deliveries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate device status
export const generateDeviceStatus = (): DeviceStatus => {
  return {
    id: 'minimed-780g',
    name: 'MiniMed 780G',
    model: '780G',
    connected: true,
    batteryLevel: 75 + Math.random() * 20,
    reservoirLevel: 150 + Math.random() * 100,
    lastSync: new Date(),
    firmwareVersion: '7.4.1',
    serialNumber: 'MM780G-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };
};

// Calculate time in range
export const calculateTimeInRange = (readings: GlucoseReading[]): TimeInRange => {
  const total = readings.length;
  if (total === 0) {
    return { below: 0, inRange: 0, above: 0 };
  }
  
  const below = readings.filter(r => r.value < 70).length;
  const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
  const above = readings.filter(r => r.value > 180).length;
  const veryLow = readings.filter(r => r.value < 54).length;
  const veryHigh = readings.filter(r => r.value > 250).length;
  
  return {
    below: (below / total) * 100,
    inRange: (inRange / total) * 100,
    above: (above / total) * 100,
    veryLow: (veryLow / total) * 100,
    veryHigh: (veryHigh / total) * 100
  };
};

// Generate daily summary statistics
export const generateDailySummary = () => {
  const readings = generateGlucoseReadings(24);
  const deliveries = generateInsulinDeliveries(1);
  const timeInRange = calculateTimeInRange(readings);
  
  const totalInsulin = deliveries.reduce((sum, d) => sum + d.amount, 0);
  const basalInsulin = deliveries.filter(d => d.type === 'basal').reduce((sum, d) => sum + d.amount, 0);
  const bolusInsulin = deliveries.filter(d => d.type === 'bolus').reduce((sum, d) => sum + d.amount, 0);
  
  const avgGlucose = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
  const currentGlucose = readings[readings.length - 1];
  
  return {
    currentGlucose,
    avgGlucose: Math.round(avgGlucose),
    timeInRange,
    totalInsulin: Math.round(totalInsulin * 10) / 10,
    basalInsulin: Math.round(basalInsulin * 10) / 10,
    bolusInsulin: Math.round(bolusInsulin * 10) / 10,
    readingsCount: readings.length,
    lastReading: currentGlucose.timestamp
  };
};
