import { render, screen } from '@testing-library/react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

describe('Popover Component', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    mockOnOpenChange.mockClear()
  })

  it('should render with basic props', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('should handle open state', () => {
    render(
      <Popover open={true} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Popover Content')).toBeInTheDocument()
  })

  it('should handle closed state', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('should render trigger correctly', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Custom Trigger</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('should render content correctly', () => {
    render(
      <Popover open={true} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>Custom Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })

  it('should handle custom className', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger className="custom-trigger">Trigger</PopoverTrigger>
        <PopoverContent className="custom-content">Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Trigger')).toHaveClass('custom-trigger')
  })

  it('should handle data attributes', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
        <PopoverContent data-testid="content">Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('should handle aria attributes', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger aria-label="Trigger button">Trigger</PopoverTrigger>
        <PopoverContent aria-label="Popover content">Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByLabelText('Trigger button')).toBeInTheDocument()
  })

  it('should handle children as function', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Function Trigger</PopoverTrigger>
        <PopoverContent>Function Content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Function Trigger')).toBeInTheDocument()
  })

  it('should handle empty content', () => {
    render(
      <Popover open={false} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent></PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  it('should handle complex content', () => {
    render(
      <Popover open={true} onOpenChange={mockOnOpenChange}>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>
          <div>
            <h3>Title</h3>
            <p>Description</p>
            <button>Action</button>
          </div>
        </PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})
