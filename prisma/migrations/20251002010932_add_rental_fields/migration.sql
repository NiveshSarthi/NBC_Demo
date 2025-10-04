-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'agent', 'admin');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('residential', 'commercial', 'plot', 'religious');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('INR', 'USD');

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('sqft', 'sqm', 'acre', 'hectare');

-- CreateEnum
CREATE TYPE "Furnishing" AS ENUM ('unfurnished', 'semi_furnished', 'fully_furnished');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('freehold', 'leasehold', 'cooperative');

-- CreateEnum
CREATE TYPE "PossessionStatus" AS ENUM ('ready_to_move', 'under_construction', 'new_launch');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('active', 'sold', 'rented', 'inactive');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('sale', 'rent');

-- CreateEnum
CREATE TYPE "RentPeriod" AS ENUM ('daily', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('primary', 'secondary', 'emerging');

-- CreateEnum
CREATE TYPE "TierClassification" AS ENUM ('tier1', 'tier2', 'tier3');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('exterior', 'interior', 'amenity', 'location', 'floor_plan');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('view', 'inquiry', 'save', 'share', 'contact');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('price_forecast', 'investment_score', 'roi_analysis');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('general', 'price', 'availability', 'visit');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('new', 'responded', 'closed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('premium_listing', 'featured_listing', 'property_report', 'virtual_tour', 'consultation');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "avatar_url" TEXT,
    "preferences" JSONB,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "investment_budget" DECIMAL(15,2),
    "preferred_locations" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType" NOT NULL,
    "sub_type" TEXT,
    "listing_type" "ListingType" NOT NULL DEFAULT 'sale',
    "location_id" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "price" DECIMAL(15,2),
    "rent_amount" DECIMAL(15,2),
    "rent_period" "RentPeriod" NOT NULL DEFAULT 'monthly',
    "price_unit" "PriceUnit" NOT NULL DEFAULT 'INR',
    "area" DECIMAL(10,2),
    "area_unit" "AreaUnit" NOT NULL DEFAULT 'sqft',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parking_spaces" INTEGER,
    "floor_number" INTEGER,
    "total_floors" INTEGER,
    "year_built" INTEGER,
    "furnishing" "Furnishing",
    "amenities" TEXT[],
    "features" TEXT[],
    "rera_registered" BOOLEAN NOT NULL DEFAULT false,
    "rera_number" TEXT,
    "ownership_type" "OwnershipType",
    "possession_status" "PossessionStatus",
    "possession_date" TIMESTAMP(3),
    "developer_name" TEXT,
    "project_name" TEXT,
    "virtual_tour_url" TEXT,
    "video_tour_url" TEXT,
    "ai_score" DECIMAL(5,2),
    "ai_prediction" JSONB,
    "religious_significance" TEXT,
    "infrastructure_impact" JSONB,
    "status" "PropertyStatus" NOT NULL DEFAULT 'active',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "premium_listing" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "inquiries_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "district" TEXT,
    "type" "LocationType" NOT NULL DEFAULT 'secondary',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "population" BIGINT,
    "area_sqkm" DECIMAL(10,2),
    "gdp_per_capita" DECIMAL(10,2),
    "growth_rate" DECIMAL(5,2),
    "master_plan_url" TEXT,
    "master_plan_data" JSONB,
    "infrastructure_projects" JSONB,
    "religious_sites" JSONB,
    "airport_distance_km" DECIMAL(8,2),
    "metro_distance_km" DECIMAL(8,2),
    "expressway_distance_km" DECIMAL(8,2),
    "smart_city_status" BOOLEAN NOT NULL DEFAULT false,
    "tier_classification" "TierClassification",
    "investment_potential" DECIMAL(3,1),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "image_type" "ImageType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER,
    "event_type" "EventType" NOT NULL,
    "user_id" INTEGER,
    "session_id" TEXT,
    "ip_address" INET,
    "user_agent" TEXT,
    "referrer_url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_predictions" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "prediction_type" "PredictionType" NOT NULL,
    "predicted_value" DECIMAL(15,2) NOT NULL,
    "confidence_score" DECIMAL(5,2) NOT NULL,
    "prediction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "factors" JSONB,
    "model_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_searches" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "search_query" TEXT,
    "filters" JSONB,
    "location_bounds" JSONB,
    "results_count" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "inquiry_type" "InquiryType" NOT NULL DEFAULT 'general',
    "status" "InquiryStatus" NOT NULL DEFAULT 'new',
    "response" TEXT,
    "responded_by" INTEGER,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_searches" ADD CONSTRAINT "user_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
