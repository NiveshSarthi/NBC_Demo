'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ChartContainerProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  data: any
  options?: any
  className?: string
  height?: number
}

export function ChartContainer({
  type,
  data,
  options = {},
  className = "w-full",
  height = 400
}: ChartContainerProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    ...options
  }

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Chart type={type} data={data} options={defaultOptions} />
    </div>
  )
}