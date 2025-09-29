import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export interface HealthMetric {
  id?: string;
  patientId: string;
  type: 'bloodPressureSystolic' | 'bloodPressureDiastolic' | 'heartRate' | 'bloodSugar' | 'weight';
  value: number;
  unit: string;
  date: Date;
  notes?: string;
}

export const addHealthMetric = async (metric: Omit<HealthMetric, 'id'>): Promise<string> => {
  try {
    const metricsRef = collection(db, 'healthMetrics');
    const cleanMetric: any = {
      patientId: metric.patientId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      date: Timestamp.fromDate(metric.date),
      createdAt: Timestamp.now()
    };
    if (metric.notes && metric.notes.trim()) {
      cleanMetric.notes = metric.notes;
    }
    const docRef = await addDoc(metricsRef, cleanMetric);
    console.log(' Health metric added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error(' Error adding health metric:', error);
    throw new Error(error.message);
  }
};

export const getHealthMetrics = async (patientId: string): Promise<HealthMetric[]> => {
  try {
    const metricsRef = collection(db, 'healthMetrics');
    const q = query(metricsRef, where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    const metrics: HealthMetric[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      const metric: HealthMetric = {
        id: doc.id,
        patientId: data.patientId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        date: (data.date as Timestamp).toDate(),
      };
      if (data.notes && data.notes.trim()) {
        metric.notes = data.notes;
      }
      metrics.push(metric);
    });
    // Sort by date descending on client-side
    metrics.sort((a, b) => b.date.getTime() - a.date.getTime());
    return metrics;
  } catch (error: any) {
    console.error(' Error getting health metrics:', error);
    return [];
  }
};

export const generateMockHealthMetrics = async (patientId: string): Promise<void> => {
  console.log('Mock health metrics generation disabled to prevent errors');
};

export const formatHealthMetricsForChart = (metrics: HealthMetric[]) => {
  if (!Array.isArray(metrics)) {
    return {
      bloodPressure: { systolic: [], diastolic: [] },
      heartRate: [],
      bloodSugar: [],
      weight: []
    };
  }
  return {
    bloodPressure: {
      systolic: metrics.filter(m => m.type === 'bloodPressureSystolic').map(m => ({ date: m.date.toISOString(), value: m.value })),
      diastolic: []
    },
    heartRate: metrics.filter(m => m.type === 'heartRate').map(m => ({ date: m.date.toISOString(), value: m.value })),
    bloodSugar: [],
    weight: []
  };
};
