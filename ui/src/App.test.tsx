import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders text PizzaBlock', () => {
    render(<App />);
    const text = screen.getByText(/PizzaBlock/i);
    expect(text).toBeInTheDocument();
});
