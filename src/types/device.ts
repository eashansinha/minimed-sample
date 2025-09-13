export interface DeviceStatus {
  id: string;
  name: string;
  model: string;
  connected: boolean;
  batteryLevel: number; // percentage
  reservoirLevel: number; // insulin units remaining
  lastSync: Date;
  firmwareVersion: string;
  serialNumber: string;
}

export interface InsulinDelivery {
  id: string;
  timestamp: Date;
  type: 'basal' | 'bolus' | 'correction';
  amount: number; // units
  reason?: 'meal' | 'correction' | 'scheduled';
  carbsEntered?: number; // grams
  glucoseValue?: number; // mg/dL at time of delivery
}

export interface BasalProfile {
  id: string;
  name: string;
  segments: BasalSegment[];
  isActive: boolean;
}

export interface BasalSegment {
  startTime: string; // HH:mm format
  rate: number; // units per hour
}

export interface PumpSettings {
  maxBolus: number;
  maxBasal: number;
  insulinDuration: number; // hours
  carbRatios: CarbRatio[];
  correctionFactors: CorrectionFactor[];
  targetGlucose: {
    low: number;
    high: number;
  };
}

export interface CarbRatio {
  startTime: string; // HH:mm format
  ratio: number; // grams per unit
}

export interface CorrectionFactor {
  startTime: string; // HH:mm format
  factor: number; // mg/dL per unit
}
