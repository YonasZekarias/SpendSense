"use client";

import { PriceHistoryResponse } from "@/types/api/product-details";
import { ChartTimeRange } from "./chart-time-range";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface PriceHistoryChartProps {
  history: PriceHistoryResponse;
  currentPrice: number;
}

export function PriceHistoryChart({ history, currentPrice }: PriceHistoryChartProps) {
  const hasData = history.dataPoints && history.dataPoints.length > 0;
  
  // Format data for Recharts
  const formattedData = history.dataPoints.map(point => ({
    ...point,
    displayDate: format(parseISO(point.date), "MMM d"),
  }));

  // Find where the forecast starts
  const forecastStartIndex = formattedData.findIndex(d => d.isForecast);
  const forecastDate = forecastStartIndex !== -1 ? formattedData[forecastStartIndex].date : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Price History & Forecast</h2>
          <p className="text-sm text-muted-foreground">Analysis over the selected time range</p>
        </div>
        <ChartTimeRange />
      </div>

      <div className="h-[400px] w-full border rounded-xl p-4 sm:p-6 bg-card relative">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl">
            <p className="text-muted-foreground font-medium mb-2">Insufficient data for this time range</p>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              Submit a price to help the community
            </button>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${value}`} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
              formatter={(value: number, name: string) => [`${value} ETB`, name === "price" ? "Historical Price" : name === "forecastPrice" ? "Forecast" : name]}
            />
            <Legend verticalAlign="top" height={36} />

            {/* Historical data */}
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast ? null : d.price}
              name="Historical Price"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls
            />

            {/* Forecast data */}
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast ? d.price : null}
              name="Forecast"
              stroke="#9ca3af"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
              connectNulls
            />
            
            {/* National Average if exists */}
            {history.nationalAverageDataPoints && history.nationalAverageDataPoints.length > 0 && (
               <Area
                 type="monotone"
                 dataKey="nationalAveragePrice"
                 name="National Average"
                 stroke="#d1d5db"
                 strokeWidth={2}
                 fill="none"
               />
            )}

            {forecastDate && (
              <ReferenceLine 
                x={formattedData.find(d => d.date === forecastDate)?.displayDate} 
                stroke="#6b7280" 
                strokeDasharray="3 3"
                label={{ position: 'top', value: `Today: ${currentPrice} ETB`, fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
