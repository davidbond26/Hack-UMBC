import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders game title', () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/Hack UMBC Game/i);
  expect(titleElement).toBeInTheDocument();
});
