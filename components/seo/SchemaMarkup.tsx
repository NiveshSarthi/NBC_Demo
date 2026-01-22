import { Organization, WebSite, Property, RealEstateAgent } from "schema-dts";

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'property' | 'real-estate-agent';
  data: any;
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const getSchemaData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NextBoomCity",
          url: "https://nextboomcity.com",
          logo: "https://nextboomcity.com/logo.png",
          description: "India's premier AI-powered real estate platform",
          foundingDate: "2024",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-9876543210",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: "en"
          },
          sameAs: [
            "https://www.facebook.com/nextboomcity",
            "https://www.twitter.com/nextboomcity",
            "https://www.linkedin.com/company/nextboomcity"
          ]
        } as Organization;

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "NextBoomCity",
          url: "https://nextboomcity.com",
          description: "Discover premium real estate opportunities in India's emerging cities",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://nextboomcity.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          publisher: {
            "@type": "Organization",
            name: "NextBoomCity"
          }
        } as WebSite;

      case 'property':
        return {
          "@context": "https://schema.org",
          "@type": "SingleFamilyResidence",
          name: data.title,
          description: data.description,
          address: {
            "@type": "PostalAddress",
            streetAddress: data.address,
            addressLocality: data.city,
            addressRegion: data.state,
            postalCode: data.pincode,
            addressCountry: "IN"
          },
          geo: data.latitude && data.longitude ? {
            "@type": "GeoCoordinates",
            latitude: data.latitude,
            longitude: data.longitude
          } : undefined,
          numberOfRooms: data.bedrooms,
          floorSize: data.area ? {
            "@type": "QuantitativeValue",
            value: data.area,
            unitText: "SQFT"
          } : undefined,
          offers: {
            "@type": "Offer",
            price: data.price,
            priceCurrency: data.price_unit || "INR",
            availability: "https://schema.org/InStock"
          },
          image: data.images?.map((img: any) => img.image_url) || [],
          url: `https://nextboomcity.com/properties/${data.id}`
        } as unknown as Property;

      case 'real-estate-agent':
        return {
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "NextBoomCity",
          url: "https://nextboomcity.com",
          description: "AI-powered real estate platform for India's emerging cities",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Mumbai",
            addressRegion: "Maharashtra",
            addressCountry: "IN"
          },
          telephone: "+91-9876543210",
          email: "info@nextboomcity.com",
          sameAs: [
            "https://www.facebook.com/nextboomcity",
            "https://www.twitter.com/nextboomcity",
            "https://www.linkedin.com/company/nextboomcity"
          ]
        } as RealEstateAgent;

      default:
        return null;
    }
  };

  const schemaData = getSchemaData();

  if (!schemaData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}