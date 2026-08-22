"use client";

import React from "react";
import "../../styles/design-tokens.css";
import PremiumAnnouncementBar from "./PremiumAnnouncementBar";
import PremiumHeader from "../layout/PremiumHeader";
import PremiumHero from "./PremiumHero";
import FeaturedCategories from "./FeaturedCategories";
import FlashDealsPremium from "./sections/FlashDealsPremium";
import FeaturedProductsPremium from "./sections/FeaturedProductsPremium";
import LuxuryCollections from "./LuxuryCollections";
import FeaturedBrandsPremium from "./FeaturedBrandsPremium";
import BundleDealsPremium from "./sections/BundleDealsPremium";
import MysteryBoxesPremium from "./sections/MysteryBoxesPremium";
import SuperDealsPremium from "./sections/SuperDealsPremium";
import AIRecommendationsPremium from "./AIRecommendationsPremium";
import TrendingAndNewArrivalsPremium from "./sections/TrendingAndNewArrivalsPremium";
import TestimonialsPremium from "./TestimonialsPremium";
import NewsletterPremium from "./NewsletterPremium";
import InstagramGalleryPremium from "./InstagramGalleryPremium";
import PremiumFooter from "./PremiumFooter";

interface HomepageProps {
  data?: any;
}

export function Homepage({ data }: HomepageProps) {
  return (
	<div>
	  <PremiumAnnouncementBar />
	  <PremiumHeader />
	  <main>
		<PremiumHero />
		<FeaturedCategories />
		<FlashDealsPremium />
		<FeaturedProductsPremium />
		<LuxuryCollections />
		<FeaturedBrandsPremium />
		<BundleDealsPremium />
		<MysteryBoxesPremium />
		<SuperDealsPremium />
		<AIRecommendationsPremium />
		<TrendingAndNewArrivalsPremium />
		<TestimonialsPremium />
		<NewsletterPremium />
		<InstagramGalleryPremium />
	  </main>
		<PremiumFooter />
	</div>
  );
}
