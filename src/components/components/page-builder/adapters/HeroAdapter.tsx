import React from "react";
import PremiumHero from "../../components/homepage/PremiumHero";

interface Props {
  section?: any;
}

export default function HeroAdapter({ section }: Props) {
  // Section props from CMS can be mapped here. If empty, render premium hero demo.
  return <PremiumHero />;
}
