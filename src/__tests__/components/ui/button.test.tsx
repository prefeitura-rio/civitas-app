import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('should render with basic props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })

  it('should render with default variant', () => {
    render(<Button>Default Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input')
  })

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary')
  })

  it('should render with destructive variant', () => {
    render(<Button variant="destructive">Destructive Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('should render with link variant', () => {
    render(<Button variant="link">Link Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('should render with default size', () => {
    render(<Button>Default Size</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'px-4', 'py-2')
  })

  it('should render with sm size', () => {
    render(<Button size="sm">Small Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')
  })

  it('should render with lg size', () => {
    render(<Button size="lg">Large Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'rounded-md', 'px-8')
  })

  it('should render with icon size', () => {
    render(<Button size="icon">Icon Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    render(<Button onClick={mockOnClick}>Clickable Button</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not trigger click when disabled', async () => {
    const user = userEvent.setup()
    render(
      <Button disabled onClick={mockOnClick}>
        Disabled Button
      </Button>,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should render as a link when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should pass through additional props', () => {
    render(
      <Button
        data-testid="custom-button"
        className="custom-class"
        aria-label="Custom label"
      >
        Custom Button
      </Button>,
    )

    const button = screen.getByTestId('custom-button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('should handle type prop', () => {
    render(<Button type="submit">Submit Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should handle form prop', () => {
    render(<Button form="test-form">Form Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('form', 'test-form')
  })

  it('should handle name prop', () => {
    render(<Button name="test-button">Named Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('name', 'test-button')
  })

  it('should handle value prop', () => {
    render(<Button value="test-value">Valued Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('value', 'test-value')
  })

  it('should handle autoFocus prop', () => {
    render(<Button autoFocus>Auto Focus Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle tabIndex prop', () => {
    render(<Button tabIndex={0}>Tab Index Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('tabindex', '0')
  })

  it('should handle aria props', () => {
    render(
      <Button
        aria-expanded="true"
        aria-controls="test-panel"
        aria-describedby="test-description"
      >
        Aria Button
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', 'test-panel')
    expect(button).toHaveAttribute('aria-describedby', 'test-description')
  })

  it('should handle data attributes', () => {
    render(
      <Button data-testid="data-button" data-custom="custom-value">
        Data Button
      </Button>,
    )

    const button = screen.getByTestId('data-button')
    expect(button).toHaveAttribute('data-custom', 'custom-value')
  })

  it('should handle ref forwarding', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Ref Button</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should handle children with complex content', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Icon')
    expect(button).toHaveTextContent('Text')
  })

  it('should handle empty children', () => {
    render(<Button></Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('')
  })

  it('should handle boolean children', () => {
    render(<Button>{true}</Button>)

    const button = screen.getByRole('button')

    expect(button).toHaveTextContent('')
  })

  it('should handle number children', () => {
    render(<Button>{42}</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('42')
  })

  it('should combine multiple variants correctly', () => {
    render(
      <Button variant="outline" size="sm" className="extra-class">
        Combined Button
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input')
    expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')
    expect(button).toHaveClass('extra-class')
  })

  it('should handle loading state', () => {
    render(<Button disabled>Loading...</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Loading...')
  })

  it('should handle long text content', () => {
    const longText =
      'This is a very long button text that should wrap properly and not break the layout'
    render(<Button>{longText}</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent(longText)
  })

  it('should handle special characters in text', () => {
    render(<Button>Button with special chars: !@#$%^&*()</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Button with special chars: !@#$%^&*()')
  })
})
