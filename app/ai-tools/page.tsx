'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  FileText,
  MapPin,
  Calculator,
  Sparkles,
  Loader2
} from 'lucide-react';

const aiTools = [
  {
    id: 'recommender',
    title: 'Smart Property Recommender',
    icon: Brain,
    description: 'Get personalized property recommendations based on your preferences',
    color: 'text-blue-600'
  },
  {
    id: 'predictor',
    title: 'Price Prediction Engine',
    icon: TrendingUp,
    description: 'Predict future property prices using advanced ML models',
    color: 'text-green-600'
  },
  {
    id: 'investor',
    title: 'Investment Score Generator',
    icon: Calculator,
    description: 'Calculate comprehensive investment scores for properties',
    color: 'text-purple-600'
  },
  {
    id: 'chat',
    title: 'AI Property Assistant',
    icon: MessageSquare,
    description: 'Chat with our AI assistant for property advice and information',
    color: 'text-orange-600'
  },
  {
    id: 'ocr',
    title: 'Document OCR & Verification',
    icon: FileText,
    description: 'Extract and verify information from property documents',
    color: 'text-red-600'
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure Impact Predictor',
    icon: MapPin,
    description: 'Analyze how nearby infrastructure affects property values',
    color: 'text-indigo-600'
  },
  {
    id: 'roi',
    title: 'Religious Tourism ROI Calculator',
    icon: Calculator,
    description: 'Calculate ROI for properties near religious tourism sites',
    color: 'text-teal-600'
  }
];

export default function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [recommendationPrefs, setRecommendationPrefs] = useState({
    budget_min: '',
    budget_max: '',
    property_type: '',
    bedrooms: '',
    location: ''
  });

  const [pricePredictionData, setPricePredictionData] = useState({
    property_id: '',
    months_ahead: 24
  });

  const [investmentData, setInvestmentData] = useState({
    property_data: {
      area_sqft: 1000,
      bedrooms: 3,
      bathrooms: 2,
      age_years: 2
    },
    current_price: 5000000
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [infraData, setInfraData] = useState({
    property_id: '',
    infrastructure_type: 'metro',
    distance_km: 5,
    project_phase: 'operational'
  });

  const [roiData, setRoiData] = useState({
    property_data: {
      area_sqft: 1000,
      bedrooms: 3,
      bathrooms: 2,
      age_years: 2
    },
    site_name: '',
    distance_to_site: 5
  });

  const handleSubmit = async (toolId: string) => {
    setIsLoading(true);
    try {
      let response;
      switch (toolId) {
        case 'recommender':
          response = await fetch('/api/v1/ai/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recommendationPrefs)
          });
          break;
        case 'predictor':
          response = await fetch('/api/v1/ai/predict-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pricePredictionData)
          });
          break;
        case 'investor':
          response = await fetch('/api/v1/ai/investment-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(investmentData)
          });
          break;
        case 'chat':
          if (!chatMessage.trim()) return;
          response = await fetch('/api/v1/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: chatMessage,
              context: chatHistory.slice(-5)
            })
          });
          const chatData = await response.json();
          setChatHistory(prev => [
            ...prev,
            { role: 'user', content: chatMessage },
            { role: 'assistant', content: chatData.response }
          ]);
          setChatMessage('');
          setResults(chatData);
          setIsLoading(false);
          return;
        case 'ocr':
          if (!selectedFile) return;
          const formData = new FormData();
          formData.append('document', selectedFile);
          response = await fetch('/api/v1/ai/ocr', {
            method: 'POST',
            body: formData
          });
          break;
        case 'infrastructure':
          response = await fetch(`/api/v1/ai/infrastructure-impact?${new URLSearchParams({
            property_id: infraData.property_id,
            infrastructure_type: infraData.infrastructure_type,
            distance_km: infraData.distance_km.toString(),
            project_phase: infraData.project_phase
          })}`);
          break;
        case 'roi':
          response = await fetch('/api/v1/ai/religious-roi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roiData)
          });
          break;
        default:
          return;
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('AI tool error:', error);
      setResults({ error: 'Failed to process request' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolForm = (toolId: string) => {
    switch (toolId) {
      case 'recommender':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Min Budget (₹)</Label>
                <Input
                  type="number"
                  value={recommendationPrefs.budget_min}
                  onChange={(e) => setRecommendationPrefs(prev => ({ ...prev, budget_min: e.target.value }))}
                  placeholder="5000000"
                />
              </div>
              <div>
                <Label>Max Budget (₹)</Label>
                <Input
                  type="number"
                  value={recommendationPrefs.budget_max}
                  onChange={(e) => setRecommendationPrefs(prev => ({ ...prev, budget_max: e.target.value }))}
                  placeholder="20000000"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Property type"
                value={recommendationPrefs.property_type}
                onChange={(e) => setRecommendationPrefs(prev => ({ ...prev, property_type: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Bedrooms"
                value={recommendationPrefs.bedrooms}
                onChange={(e) => setRecommendationPrefs(prev => ({ ...prev, bedrooms: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={recommendationPrefs.location}
                onChange={(e) => setRecommendationPrefs(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'predictor':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Property ID"
              value={pricePredictionData.property_id}
              onChange={(e) => setPricePredictionData(prev => ({ ...prev, property_id: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Months ahead"
              value={pricePredictionData.months_ahead}
              onChange={(e) => setPricePredictionData(prev => ({ ...prev, months_ahead: parseInt(e.target.value) }))}
            />
          </div>
        );

      case 'investor':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Current price"
              value={investmentData.current_price}
              onChange={(e) => setInvestmentData(prev => ({ ...prev, current_price: parseInt(e.target.value) }))}
            />
            <Input
              type="number"
              placeholder="Area (sqft)"
              value={investmentData.property_data.area_sqft}
              onChange={(e) => setInvestmentData(prev => ({
                ...prev,
                property_data: { ...prev.property_data, area_sqft: parseInt(e.target.value) }
              }))}
            />
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-4">
            <div className="h-48 border rounded p-4 overflow-y-auto bg-gray-50">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about properties..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit('chat')}
              />
            </div>
          </div>
        );

      case 'ocr':
        return (
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
        );

      case 'infrastructure':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Property ID"
              value={infraData.property_id}
              onChange={(e) => setInfraData(prev => ({ ...prev, property_id: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Distance (km)"
              value={infraData.distance_km}
              onChange={(e) => setInfraData(prev => ({ ...prev, distance_km: parseFloat(e.target.value) }))}
            />
          </div>
        );

      case 'roi':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Religious site name"
              value={roiData.site_name}
              onChange={(e) => setRoiData(prev => ({ ...prev, site_name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Distance to site (km)"
              value={roiData.distance_to_site}
              onChange={(e) => setRoiData(prev => ({ ...prev, distance_to_site: parseFloat(e.target.value) }))}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold">AI Tools Dashboard</h1>
          </div>
          <p className="text-gray-600">Leverage advanced AI for smarter property decisions</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <IconComponent className={`h-5 w-5 mr-2 ${tool.color}`} />
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedTool(tool.id)}>
                        Try Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <IconComponent className={`h-5 w-5 mr-2 ${tool.color}`} />
                          {tool.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {renderToolForm(tool.id)}
                        <Button
                          onClick={() => handleSubmit(tool.id)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Process
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {results && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}