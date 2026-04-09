import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Spinner from '../../components/Spinner'

describe('Spinner Component', () => {
  it('renders with default props', () => {
    const { container } = render(<Spinner />)

    const spinner = container.firstChild
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('rounded-full', 'animate-spin')
  })

  it('applies dark variant classes by default', () => {
    const { container } = render(<Spinner />)

    const spinner = container.firstChild
    expect(spinner).toHaveClass('border-violet-700', 'border-t-transparent')
  })

  it('applies light variant classes when specified', () => {
    const { container } = render(<Spinner variant="light" />)

    const spinner = container.firstChild
    expect(spinner).toHaveClass('border-white/90', 'border-t-transparent')
  })

  it('applies medium size classes by default', () => {
    const { container } = render(<Spinner />)

    const spinner = container.firstChild
    expect(spinner).toHaveClass('w-10', 'h-10', 'border-4')
  })

  it('applies small size classes when specified', () => {
    const { container } = render(<Spinner size="sm" />)

    const spinner = container.firstChild
    expect(spinner).toHaveClass('w-5', 'h-5', 'border-2')
  })

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />)

    const spinner = container.firstChild
    expect(spinner).toHaveClass('custom-class')
  })

  it('combines all classes correctly with light variant and small size', () => {
    const { container } = render(
      <Spinner variant="light" size="sm" className="extra-class" />
    )

    const spinner = container.firstChild
    expect(spinner).toHaveClass(
      'rounded-full',
      'animate-spin',
      'border-white/90',
      'border-t-transparent',
      'w-5',
      'h-5',
      'border-2',
      'extra-class'
    )
  })
})
