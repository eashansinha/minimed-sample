export interface GlucoseReading {
  id: string;
  timestamp: Date;
  value: number; // mg/dL
  trend: 'rising' | 'falling' | 'stable' | 'rising_quickly' | 'falling_quickly';
  source: 'cgm' | 'manual';
  notes?: string;
}

export interface GlucoseRange {
  low: number;
  target: {
    min: number;
    max: number;
  };
  high: number;
}

export interface TimeInRange {
  below: number; // percentage
  inRange: number; // percentage
  above: number; // percentage
  veryLow?: number; // percentage
  veryHigh?: number; // percentage
}
