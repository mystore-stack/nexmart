import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { HeroCarousel } from '../HeroCarousel';

const meta: Meta<typeof HeroCarousel> = {
  title: 'UI/HeroCarousel',
  component: HeroCarousel,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof HeroCarousel>;

const slides = [
  { id: 's1', title: 'Summer Collection', subtitle: 'New arrivals', image: '/images/hero-1.jpg' },
  { id: 's2', title: 'Luxury Handcrafted', subtitle: 'Limited edition', image: '/images/hero-2.jpg' }
];

export const Default: Story = {
  args: { slides, interval: 5000 }
};
