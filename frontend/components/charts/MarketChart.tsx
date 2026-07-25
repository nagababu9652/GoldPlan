'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
  volume?: number;
}

interface MarketChartProps {
  title: string;
  symbol: string;
  color?: string;
  prefix?: string;
  formatValue?: (value: number) => string;
}

const RANGES = ['1D', '1W', '1M', '3M', '1Y', '5Y'] as const;
type Range = typeof RANGES[number];

function formatINR(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(2)}`;
}

function formatNumber(value: number) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(2);
}

export default function MarketChart({ title, symbol, color = '#0C0B0A', prefix = '', formatValue }: MarketChartProps) {
  const [range, setRange] = useState<Range>('1M');
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<{ direction: string; target: number; confidence: string } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/market/history?symbol=${symbol}&range=${range}`);
        const result = await response.json();
        setData(result.data || []);
        if (result.prediction) {
          setPrediction(result.prediction);
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol} history:`, error);
        // Generate sample data for demo
        const sampleData: ChartDataPoint[] = [];
        const points = range === '1D' ? 24 : range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 365 : 1825;
        const baseValue = symbol === 'NIFTY' ? 24175 : symbol === 'SENSEX' ? 77502 : 11100;
        const volatility = symbol === 'GOLD' ? 0.005 : 0.01;
        let val = baseValue;
        const now = new Date();
        for (let i = points; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          val = val * (1 + (Math.random() - 0.48) * volatility);
          sampleData.push({
            date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            value: Math.round(val * 100) / 100,
          });
        }
        setData(sampleData);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [symbol, range]);

  const fmt = formatValue || (symbol === 'GOLD' ? formatINR : formatNumber);

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  const firstValue = data.length > 0 ? data[0].value : 0;
  const change = currentValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  // Simple SMA calculation
  const smaData = data.map((d, i, arr) => {
    const window = 5;
    if (i < window - 1) return null;
    const sum = arr.slice(i - window + 1, i + 1).reduce((a, b) => a + b.value, 0);
    return { date: d.date, sma: sum / window };
  }).filter(Boolean);

  return (
    <div className="border border-obsidian bg-bone" data-testid={`chart-${symbol.toLowerCase()}`}>
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-line">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-mono text-ash mb-1">{title}</div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-[32px] lg:text-[36px] leading-none">
                {prefix}{fmt(currentValue)}
              </span>
              <span className={`font-mono text-[14px] ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          {/* Prediction badge */}
          {prediction && (
            <div className="hidden lg:block text-right">
              <div className="label-mono text-ash text-[10px] mb-1">PREDICTION</div>
              <div className={`font-mono text-[12px] ${prediction.direction === 'up' ? 'text-emerald-700' : 'text-red-700'}`}>
                {prediction.direction === 'up' ? '↑' : '↓'} Target: {prefix}{fmt(prediction.target)}
              </div>
              <div className="text-[10px] text-ash">{prediction.confidence}</div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 lg:px-8 py-6">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="font-mono text-[12px] text-ash animate-pulse">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmt(v)}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: '#0C0B0A',
                  border: '1px solid #C9A227',
                  borderRadius: 0,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#F8F6F0',
                }}
                formatter={(value: any) => [fmt(Number(value)), title]}
                labelStyle={{ color: '#A8A29E' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${symbol})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#F8F6F0', strokeWidth: 2 }}
              />
              {/* SMA line */}
              {smaData.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="#B48E4B"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Range selector */}
      <div className="px-6 lg:px-8 pb-5">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider2 transition-colors ${
                range === r
                  ? 'bg-obsidian text-bone'
                  : 'text-ash hover:text-obsidian border border-line hover:border-obsidian'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 lg:px-8 pb-5 flex items-center gap-6 text-[10px] font-mono text-ash">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5" style={{ background: color }} />
          {title}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#B48E4B]" style={{ borderTop: '1px dashed #B48E4B' }} />
          5-Day MA
        </span>
      </div>
    </div>
  );
}