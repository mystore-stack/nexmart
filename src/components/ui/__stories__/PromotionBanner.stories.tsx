import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PromotionBanner } from '../PromotionBanner';

const meta: Meta<typeof PromotionBanner> = {
  title: 'UI/PromotionBanner',
  component: PromotionBanner,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof PromotionBanner>;

export const Default: Story = {
  args: { title: 'Summer Sale', subtitle: 'Up to 40% off selected items', cta: 'Shop Now', image: '/images/promo.jpg' }
};
