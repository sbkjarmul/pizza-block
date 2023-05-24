import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import { content } from './assets/content'

test('renders text PizzaBlock', () => {
  render(<App />)
  const text = screen.getByText(content.pizzaBlock)
  expect(text).toBeInTheDocument()
})
