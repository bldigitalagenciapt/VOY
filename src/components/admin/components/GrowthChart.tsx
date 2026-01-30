import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GrowthChartProps {
    data: { date: string; users?: number; uploads?: number }[];
    dataKey: 'users' | 'uploads';
    title: string;
    color?: string;
}

export function GrowthChart({ data, dataKey, title, color = '#3b82f6' }: GrowthChartProps) {
    const formattedData = data.map(item => ({
        ...item,
        formattedDate: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
    }));

    return (
        <div className="p-5 bg-card border border-border rounded-3xl">
            <h3 className="font-bold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 11 }}
                        stroke="#888"
                    />
                    <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="#888"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
