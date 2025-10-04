'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Offer {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export function DynamicBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/v1/offers');
        const data = await response.json();
        if (data.success) {
          setOffers(data.data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        loop={offers.length > 1}
        className="w-full"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer.id}>
            <div className="relative w-full h-64 md:h-80 lg:h-96">
              <Image
                src={offer.image_url}
                alt={offer.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-2xl">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {offer.title}
                  </h2>
                  {offer.description && (
                    <p className="text-lg md:text-xl mb-4">
                      {offer.description}
                    </p>
                  )}
                  {offer.link_url && (
                    <Link
                      href={offer.link_url}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Learn More
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}