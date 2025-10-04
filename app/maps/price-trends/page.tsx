'use client'

import { useState } from 'react'
import { ChartContainer } from '@/components/charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, BarChart3, Calendar, Download, Eye } from 'lucide-react'

// Mock price trend data
const priceTrendData = {
  labels: ['2020', '2021', '2022', '2023', '2024', '2025 (Proj)', '2026 (Proj)', '2027 (Proj)'],
  datasets: [
    {
      label: 'Faridabad',
      data: [2500, 2800, 3200, 3800, 4500, 5200, 6000, 6800],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Dholera',
      data: [1800, 2100, 2500, 3100, 3900, 4800, 5800, 7000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Ayodhya',
      data: [2200, 2400, 2800, 3400, 4100, 4900, 5800, 6700],
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Vrindavan',
      data: [2000, 2200, 2600, 3000, 3600, 4200, 4900, 5600],
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
    },
  ],
}

const marketComparisonData = {
  labels: ['Faridabad', 'Dholera', 'Ayodhya', 'Vrindavan', 'Greater Noida'],
  datasets: [
    {
      label: 'Current Price (₹/sq ft)',
      data: [4500, 3900, 4100, 3600, 4200],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 1,
    },
  ],
}

export default function PriceTrendsPage() {
  const [selectedChart, setSelectedChart] = useState('trends')
  const [selectedCity, setSelectedCity] = useState('all')
  const [timeRange, setTimeRange] = useState('5years')

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Price per sq ft (₹)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
    },
  }

  const comparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Price per sq ft (₹)',
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Price Trends & Analytics
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Historical price trends and market analysis for India's emerging real estate markets.
            Track growth patterns and make informed investment decisions.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trends">Price Trends</SelectItem>
                <SelectItem value="comparison">Market Comparison</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="faridabad">Faridabad</SelectItem>
                <SelectItem value="dholera">Dholera</SelectItem>
                <SelectItem value="ayodhya">Ayodhya</SelectItem>
                <SelectItem value="vrindavan">Vrindavan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3years">Last 3 Years</SelectItem>
                <SelectItem value="5years">Last 5 Years</SelectItem>
                <SelectItem value="10years">Last 10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {selectedChart === 'trends' ? 'Price Trends Over Time' : 'Market Price Comparison'}
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedChart === 'trends'
                    ? 'Historical and projected price trends across major cities'
                    : 'Current market prices comparison between cities'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedChart === 'trends' ? (
                  <ChartContainer
                    type="line"
                    data={priceTrendData}
                    options={chartOptions}
                    height={400}
                  />
                ) : (
                  <ChartContainer
                    type="bar"
                    data={marketComparisonData}
                    options={comparisonOptions}
                    height={400}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Highest Growth</p>
                    <p className="text-lg font-bold text-blue-700">Dholera</p>
                    <p className="text-xs text-blue-600">+22% CAGR (2020-2024)</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Best Value</p>
                    <p className="text-lg font-bold text-green-700">Vrindavan</p>
                    <p className="text-xs text-green-600">₹3,600/sq ft (Current)</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Premium Segment</p>
                    <p className="text-lg font-bold text-purple-700">Faridabad</p>
                    <p className="text-xs text-purple-600">₹4,500/sq ft (Current)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Growth Rate</span>
                    <Badge variant="outline">18.5% CAGR</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Market Size</span>
                    <span className="font-semibold">₹2.4T</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <span className="font-semibold">1,247</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Launches (2024)</span>
                    <span className="font-semibold">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">High</Badge>
                    <div>
                      <p className="font-medium">Dholera Smart City</p>
                      <p className="text-sm text-gray-600">Best long-term growth potential</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">Medium</Badge>
                    <div>
                      <p className="font-medium">Ayodhya Development</p>
                      <p className="text-sm text-gray-600">Cultural tourism boost expected</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">Conservative</Badge>
                    <div>
                      <p className="font-medium">Faridabad NCR</p>
                      <p className="text-sm text-gray-600">Established market with steady growth</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}