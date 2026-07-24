import '../globals.css';
import React from 'react';
import { ThemeProvider } from '../src/components/ui/ThemeProvider';

export const decorators = [
  (Story) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
  a11y: {
    element: '#root'
  }
};
