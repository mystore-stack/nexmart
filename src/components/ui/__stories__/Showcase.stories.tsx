import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Showcase } from '../Showcase';

const meta: Meta<typeof Showcase> = {
  title: 'UI/Showcase',
  component: Showcase,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Showcase>;

export const Default: Story = {};
