import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'UI/ProductCard',
  component: ProductCard,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  args: {
    product: {
      id: 'prod_1',
      title: 'Artisanal Leather Bag',
      price: 249.0,
      image: '/images/sample-product.jpg',
      rating: 4.7
    },
    onAdd: (id: string) => { alert(`Add ${id}`); }
  }
};
