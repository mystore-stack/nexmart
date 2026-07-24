import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: { variant: { control: { type: 'select', options: ['primary', 'secondary', 'ghost'] } } }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Primary Button', variant: 'primary' }
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' }
};
