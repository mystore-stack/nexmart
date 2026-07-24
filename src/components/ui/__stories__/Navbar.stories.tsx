import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '../Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'UI/Navbar',
  component: Navbar,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
