import React from 'react';
import { Meta, Story } from '@storybook/react';
import UserList from './UserList';

export default {
  title: 'Admin/UserList',
  component: UserList,
} as Meta;

const Template: Story = (args) => <UserList {...args} />;

export const WithUsers = Template.bind({});
WithUsers.args = {
  users: [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'editor' },
  ],
};
