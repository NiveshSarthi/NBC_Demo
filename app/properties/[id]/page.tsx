import { Metadata } from "next";
import { PropertyModel } from "@/lib/models/property";
import PropertyDetailClient from "./PropertyDetailClient";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return {
        title: "Property Not Found - NextBoomCity",
        description: "The property you're looking for could not be found.",
      };
    }

    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return {
        title: "Property Not Found - NextBoomCity",
        description: "The property you're looking for could not be found.",
      };
    }

    const imageUrl = (property as any).images?.find((img: any) => img.is_primary)?.image_url ||
                    "https://nextboomcity.com/default-property.jpg";

    const title = `${property.title} - ${property.city}, ${property.state}`;
    const price = Number(property.price);
    const description = `${property.description || `Premium ${property.property_type} property in ${property.city}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.area} ${property.area_unit}. Price: ₹${price.toLocaleString('en-IN')}`}`;

    return {
      title,
      description: description.substring(0, 160),
      keywords: [
        property.title,
        property.city,
        property.state,
        property.property_type,
        "real estate",
        "property",
        "investment",
        "buy property",
        `${property.city} property`,
        `${property.state} real estate`
      ].join(", "),
      openGraph: {
        title,
        description: description.substring(0, 160),
        url: `https://nextboomcity.com/properties/${property.id}`,
        siteName: "NextBoomCity",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: property.title,
          },
        ],
        locale: "en_IN",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.substring(0, 160),
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://nextboomcity.com/properties/${property.id}`,
      },
    };
  } catch (error) {
    console.error("Error generating property metadata:", error);
    return {
      title: "Property Details - NextBoomCity",
      description: "View detailed information about this property on NextBoomCity.",
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const propertyId = parseInt(id);

  // Fetch property data for schema markup
  const property = !isNaN(propertyId) ? await PropertyModel.findById(propertyId) : null;

  return (
    <>
      {property && <SchemaMarkup type="property" data={property} />}
      <PropertyDetailClient params={{ id }} />
    </>
  );
}