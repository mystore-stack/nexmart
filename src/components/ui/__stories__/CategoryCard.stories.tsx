import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CategoryCard } from '../CategoryCard';

const meta: Meta<typeof CategoryCard> = {
  title: 'UI/CategoryCard',
  component: CategoryCard,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof CategoryCard>;

export const Default: Story = {
  args: { category: { id: 'c1', name: 'Bags', image: '/images/category-bags.jpg' } }
};
