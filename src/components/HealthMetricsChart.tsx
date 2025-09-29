import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HealthMetric {
  date: string;
  value: number;
}

interface HealthMetricsChartProps {
  bloodPressure: {
    systolic: HealthMetric[];
    diastolic: HealthMetric[];
  };
  heartRate: HealthMetric[];
  bloodSugar: HealthMetric[];
  weight: HealthMetric[];
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  bloodPressure,
  heartRate,
  bloodSugar,
  weight
}) => {
  const [timeRange, setTimeRange] = React.useState('week');

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: HealthMetric[]) => {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('HealthMetrics data is not an array:', data);
      return [];
    }
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  // Calculate statistics
  const calculateStats = (data: HealthMetric[]) => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = data.map(item => item.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg: Math.round(avg * 10) / 10, min, max };
  };

  // Render chart for a specific metric
  const renderChart = (data: HealthMetric[], unit: string, color: string, normalRange?: { min: number, max: number }) => {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('Chart data is not an array:', data);
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    const filteredData = filterDataByTimeRange(data);
    
    if (filteredData.length === 0) {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">No data available for selected time range</p>
        </div>
      );
    }
    
    const stats = calculateStats(filteredData);
    
    // Find the highest value for scaling
    const maxValue = Math.max(...filteredData.map(item => item.value)) * 1.1;
    
    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <div>Average: {stats.avg} {unit}</div>
          <div>Range: {stats.min} - {stats.max} {unit}</div>
        </div>
        
        <div className="h-[200px] relative">
          {/* Normal range indicator */}
          {normalRange && (
            <div 
              className="absolute bg-green-100 opacity-30" 
              style={{
                bottom: `${(normalRange.min / maxValue) * 100}%`,
                height: `${((normalRange.max - normalRange.min) / maxValue) * 100}%`,
                left: 0,
                right: 0,
                zIndex: 1
              }}
            />
          )}
          
          {/* Chart bars */}
          <div className="flex items-end h-full gap-1 relative z-2">
            {filteredData.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              const isOutOfRange = normalRange && (item.value < normalRange.min || item.value > normalRange.max);
              
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center group"
                >
                  <div 
                    className={`w-full ${isOutOfRange ? 'bg-red-400' : `bg-${color}-400`} rounded-t-sm relative`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {item.value} {unit} on {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  {filteredData.length <= 14 && (
                    <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Health Metrics</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bloodPressure">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bloodPressure">Blood Pressure</TabsTrigger>
            <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
            <TabsTrigger value="bloodSugar">Blood Sugar</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bloodPressure" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Systolic (mmHg)</h4>
                {renderChart(bloodPressure.systolic, 'mmHg', 'blue', { min: 90, max: 120 })}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Diastolic (mmHg)</h4>
                {renderChart(bloodPressure.diastolic, 'mmHg', 'indigo', { min: 60, max: 80 })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="heartRate">
            <h4 className="text-sm font-medium mb-1">Beats Per Minute (BPM)</h4>
            {renderChart(heartRate, 'bpm', 'red', { min: 60, max: 100 })}
          </TabsContent>
          
          <TabsContent value="bloodSugar">
            <h4 className="text-sm font-medium mb-1">Blood Glucose (mg/dL)</h4>
            {renderChart(bloodSugar, 'mg/dL', 'amber', { min: 70, max: 140 })}
          </TabsContent>
          
          <TabsContent value="weight">
            <h4 className="text-sm font-medium mb-1">Weight (kg)</h4>
            {renderChart(weight, 'kg', 'green')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsChart;