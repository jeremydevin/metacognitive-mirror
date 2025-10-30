
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    confidence: number;
    performance: number;
}

interface MetacognitiveChartProps {
    data: ChartData[];
}

const MetacognitiveChart: React.FC<MetacognitiveChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        color: '#cbd5e1'
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    name="Avg. Confidence"
                    dot={{ r: 4, fill: '#8b5cf6' }}
                    activeDot={{ r: 8 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    name="Avg. Performance" 
                    dot={{ r: 4, fill: '#22c55e' }}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MetacognitiveChart;
