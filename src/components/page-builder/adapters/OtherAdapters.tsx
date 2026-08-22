import React from "react";
import BundleDealsPremium from "../../components/homepage/sections/BundleDealsPremium";
import MysteryBoxesPremium from "../../components/homepage/sections/MysteryBoxesPremium";
import SuperDealsPremium from "../../components/homepage/sections/SuperDealsPremium";
import TrendingAndNewArrivalsPremium from "../../components/homepage/sections/TrendingAndNewArrivalsPremium";
import TestimonialsPremium from "../../components/homepage/TestimonialsPremium";
import NewsletterPremium from "../../components/homepage/NewsletterPremium";
import InstagramGalleryPremium from "../../components/homepage/InstagramGalleryPremium";
import PremiumAnnouncementBar from "../../components/homepage/PremiumAnnouncementBar";

interface Props { section?: any }

export function BundleDealsAdapter({ section }: Props) {
  return <BundleDealsPremium />;
}

export function MysteryBoxesAdapter({ section }: Props) {
  return <MysteryBoxesPremium />;
}

export function SuperDealsAdapter({ section }: Props) {
  return <SuperDealsPremium />;
}

export function TrendingAndNewArrivalsAdapter({ section }: Props) {
  return <TrendingAndNewArrivalsPremium />;
}

export function TestimonialsAdapter({ section }: Props) {
  return <TestimonialsPremium />;
}

export function NewsletterAdapter({ section }: Props) {
  return <NewsletterPremium />;
}

export function InstagramAdapter({ section }: Props) {
  return <InstagramGalleryPremium />;
}

export function AnnouncementBarAdapter({ section }: Props) {
  return <PremiumAnnouncementBar />;
}

export default BundleDealsAdapter;
