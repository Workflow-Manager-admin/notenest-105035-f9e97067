import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NoteNest app top bar', () => {
  render(<App />);
  const titleElement = screen.getByText(/NoteNest/i);
  expect(titleElement).toBeInTheDocument();
});
