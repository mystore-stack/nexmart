import React from "react";
import FeaturedBrandsPremium from "../../components/homepage/FeaturedBrandsPremium";

interface Props { section?: any }

export default function FeaturedBrandsAdapter({ section }: Props) {
	const cmsBrands = section?.payload?.brands;

  // If CMS provided brands exist, pass them to the premium component so
  // the admin dashboard edits reflect immediately on the homepage without
  // duplicating markup. Otherwise render the default premium component.
  if (Array.isArray(cmsBrands) && cmsBrands.length > 0) {
	return <FeaturedBrandsPremium brands={cmsBrands} />;
  }

  return <FeaturedBrandsPremium />;
}
