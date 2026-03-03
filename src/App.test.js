import { render, screen } from '@testing-library/react';
import App from './App';

test('renders e-commerce demo app', () => {
  render(<App />);
  const headingElement = screen.getByText(/e-commerce demo app/i);
  expect(headingElement).toBeInTheDocument();
});
