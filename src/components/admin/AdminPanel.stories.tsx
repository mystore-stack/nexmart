import React from 'react';
import { Meta, Story } from '@storybook/react';
import AdminPanel from './AdminPanel';

export default {
  title: 'Admin/AdminPanel',
  component: AdminPanel,
} as Meta;

const Template: Story = (args) => <AdminPanel {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Admin Dashboard',
};
