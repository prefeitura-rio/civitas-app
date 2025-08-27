import { render, screen } from '@testing-library/react'

import { LocaleProvider } from '@/components/providers/i18n-provider'

// Mock do react-aria
jest.mock('react-aria', () => ({
  I18nProvider: ({
    locale,
    children,
  }: {
    locale: string
    children: React.ReactNode
  }) => (
    <div data-testid="i18n-provider" data-locale={locale}>
      {children}
    </div>
  ),
}))

describe('LocaleProvider', () => {
  it('should render children with default pt-BR locale', () => {
    render(
      <LocaleProvider>
        <div>Test Content</div>
      </LocaleProvider>,
    )

    const provider = screen.getByTestId('i18n-provider')
    expect(provider).toHaveAttribute('data-locale', 'pt-BR')
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render children with custom locale', () => {
    render(
      <LocaleProvider locale="en-US">
        <div>Test Content</div>
      </LocaleProvider>,
    )

    const provider = screen.getByTestId('i18n-provider')
    expect(provider).toHaveAttribute('data-locale', 'en-US')
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should pass through children unchanged', () => {
    const TestComponent = () => (
      <span data-testid="test-child">Child Component</span>
    )

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Child Component')).toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    render(
      <LocaleProvider>
        <div>First Child</div>
        <span>Second Child</span>
        <p>Third Child</p>
      </LocaleProvider>,
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })
})
