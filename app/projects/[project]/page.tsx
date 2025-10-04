import { Metadata } from 'next';

interface ProjectPageProps {
  params: Promise<{
    project: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { project } = await params;
  const projectName = project.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${projectName} - Project Details - NextBoomCity`,
    description: `Discover everything about ${projectName} project. View builder information, location details, project status, and key features.`,
    keywords: [
      projectName,
      'real estate project',
      'property development',
      'builder project',
      'NextBoomCity'
    ].join(', '),
    openGraph: {
      title: `${projectName} - NextBoomCity`,
      description: `View details about ${projectName} real estate project.`,
      url: `https://nextboomcity.com/projects/${project}`,
      siteName: 'NextBoomCity',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${projectName} - NextBoomCity`,
      description: `View details about ${projectName} real estate project.`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { project } = await params;
  const projectName = project.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Placeholder project data
  const projectData = {
    name: projectName,
    builder: 'ABC Builders Pvt Ltd',
    location: 'Faridabad, NCR',
    status: 'Under Construction',
    description: 'A premium residential project offering modern amenities and sustainable living in the heart of Faridabad.',
    keyFeatures: [
      'High-rise towers with panoramic views',
      'State-of-the-art clubhouse and gym',
      'Dedicated children\'s play areas',
      '24/7 security and power backup',
      'Green spaces and landscaped gardens',
      'Smart home automation systems'
    ],
    priceRange: '₹50 Lakhs - ₹2 Crores',
    totalUnits: 500,
    completionDate: 'December 2026'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{projectData.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Builder:</span>
              <p className="text-gray-900">{projectData.builder}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Location:</span>
              <p className="text-gray-900">{projectData.location}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Status:</span>
              <p className="text-gray-900">{projectData.status}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Price Range:</span>
              <p className="text-gray-900">{projectData.priceRange}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed">{projectData.description}</p>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectData.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Units:</span>
                <span className="text-gray-900">{projectData.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Expected Completion:</span>
                <span className="text-gray-900">{projectData.completionDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location Advantages</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Proximity to metro station</li>
              <li>• Near major highways and expressways</li>
              <li>• Walking distance to shopping centers</li>
              <li>• Excellent connectivity to Delhi NCR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}