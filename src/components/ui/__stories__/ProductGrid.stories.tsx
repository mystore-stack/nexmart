import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'UI/ProductGrid',
  component: ProductCard,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Grid: Story = {
  render: () => (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
      <ProductCard product={{id:'p1',title:'Bag A',price:120,image:'/images/sample-product.jpg',rating:4.5}} onAdd={()=>{}} />
      <ProductCard product={{id:'p2',title:'Bag B',price:180,image:'/images/sample-product.jpg',rating:4.2}} onAdd={()=>{}} />
      <ProductCard product={{id:'p3',title:'Bag C',price:210,image:'/images/sample-product.jpg',rating:4.8}} onAdd={()=>{}} />
    </div>
  )
};
