'use client';

import RecommendationSection from '@/components/RecommendationSection';

export function TrendingSection() {
  return (
    <RecommendationSection
      title="Trending Now"
      fetchUrl="/api/recommendations/trending"
    />
  );
}

export function PersonalSection() {
  return (
    <RecommendationSection
      title="Recommended for You"
      fetchUrl="/api/recommendations/personal"
    />
  );
}

export function BuyAgainSection() {
  return (
    <RecommendationSection
      title="Buy Again"
      fetchUrl="/api/recommendations/buy-again"
    />
  );
}
