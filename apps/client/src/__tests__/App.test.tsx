import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders login form when not authenticated', () => {
    render(<App />)
    expect(screen.getByText('Collaborative Document Editor')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
    expect(screen.getByLabelText('Password:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })
})