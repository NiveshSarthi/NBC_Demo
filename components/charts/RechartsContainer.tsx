'use client'

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface RechartsContainerProps {
  type: 'line' | 'bar' | 'area'
  data: any[]
  children: React.ReactNode
  height?: number
  className?: string
}

export function RechartsContainer({
  type,
  data,
  children,
  height = 300,
  className = "w-full"
}: RechartsContainerProps) {
  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart
  }[type]

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {children}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}