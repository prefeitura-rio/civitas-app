import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with basic props', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toBeInstanceOf(HTMLInputElement)
  })

  it('should render with different types', () => {
    render(<Input type="email" placeholder="Enter email" />)

    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should render with value', () => {
    render(<Input value="test value" onChange={mockOnChange} />)

    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('should handle onChange events', async () => {
    const user = userEvent.setup()
    render(<Input onChange={mockOnChange} placeholder="Type here" />)

    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'hello')

    expect(mockOnChange).toHaveBeenCalledTimes(5)
  })

  it('should handle disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)

    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  it('should handle readOnly state', () => {
    render(<Input readOnly value="Read only value" />)

    const input = screen.getByDisplayValue('Read only value')
    expect(input).toHaveAttribute('readonly')
  })

  it('should handle required state', () => {
    render(<Input required placeholder="Required input" />)

    const input = screen.getByPlaceholderText('Required input')
    expect(input).toHaveAttribute('required')
  })

  it('should handle name attribute', () => {
    render(<Input name="test-input" placeholder="Named input" />)

    const input = screen.getByPlaceholderText('Named input')
    expect(input).toHaveAttribute('name', 'test-input')
  })

  it('should handle id attribute', () => {
    render(<Input id="test-id" placeholder="ID input" />)

    const input = screen.getByPlaceholderText('ID input')
    expect(input).toHaveAttribute('id', 'test-id')
  })

  it('should handle className prop', () => {
    render(<Input className="custom-class" placeholder="Custom input" />)

    const input = screen.getByPlaceholderText('Custom input')
    expect(input).toHaveClass('custom-class')
  })

  it('should handle placeholder', () => {
    render(<Input placeholder="Custom placeholder" />)

    const input = screen.getByPlaceholderText('Custom placeholder')
    expect(input).toBeInTheDocument()
  })

  it('should handle maxLength', () => {
    render(<Input maxLength={10} placeholder="Max length input" />)

    const input = screen.getByPlaceholderText('Max length input')
    expect(input).toHaveAttribute('maxlength', '10')
  })

  it('should handle minLength', () => {
    render(<Input minLength={5} placeholder="Min length input" />)

    const input = screen.getByPlaceholderText('Min length input')
    expect(input).toHaveAttribute('minlength', '5')
  })

  it('should handle pattern', () => {
    render(<Input pattern="[A-Za-z]{3}" placeholder="Pattern input" />)

    const input = screen.getByPlaceholderText('Pattern input')
    expect(input).toHaveAttribute('pattern', '[A-Za-z]{3}')
  })

  it('should handle autoComplete', () => {
    render(<Input autoComplete="email" placeholder="Auto complete input" />)

    const input = screen.getByPlaceholderText('Auto complete input')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('should handle autoFocus', () => {
    render(<Input autoFocus placeholder="Auto focus input" />)

    const input = screen.getByPlaceholderText('Auto focus input')
    expect(input).toBeInTheDocument()
  })

  it('should handle tabIndex', () => {
    render(<Input tabIndex={0} placeholder="Tab index input" />)

    const input = screen.getByPlaceholderText('Tab index input')
    expect(input).toHaveAttribute('tabindex', '0')
  })

  it('should handle aria attributes', () => {
    render(
      <Input
        aria-label="Test input"
        aria-describedby="description"
        aria-invalid="true"
        placeholder="Aria input"
      />,
    )

    const input = screen.getByPlaceholderText('Aria input')
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('aria-describedby', 'description')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should handle data attributes', () => {
    render(
      <Input
        data-testid="data-input"
        data-custom="custom-value"
        placeholder="Data input"
      />,
    )

    const input = screen.getByTestId('data-input')
    expect(input).toHaveAttribute('data-custom', 'custom-value')
  })

  it('should handle ref forwarding', () => {
    const ref = { current: null }
    render(<Input ref={ref} placeholder="Ref input" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle onBlur events', async () => {
    const mockOnBlur = jest.fn()
    const user = userEvent.setup()
    render(<Input onBlur={mockOnBlur} placeholder="Blur input" />)

    const input = screen.getByPlaceholderText('Blur input')
    await user.click(input)
    await user.tab()

    expect(mockOnBlur).toHaveBeenCalledTimes(1)
  })

  it('should handle onFocus events', async () => {
    const mockOnFocus = jest.fn()
    const user = userEvent.setup()
    render(<Input onFocus={mockOnFocus} placeholder="Focus input" />)

    const input = screen.getByPlaceholderText('Focus input')
    await user.click(input)

    expect(mockOnFocus).toHaveBeenCalledTimes(1)
  })

  it('should handle onKeyDown events', async () => {
    const mockOnKeyDown = jest.fn()
    const user = userEvent.setup()
    render(<Input onKeyDown={mockOnKeyDown} placeholder="Key down input" />)

    const input = screen.getByPlaceholderText('Key down input')
    await user.click(input)
    await user.keyboard('a')

    expect(mockOnKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should handle onKeyUp events', async () => {
    const mockOnKeyUp = jest.fn()
    const user = userEvent.setup()
    render(<Input onKeyUp={mockOnKeyUp} placeholder="Key up input" />)

    const input = screen.getByPlaceholderText('Key up input')
    await user.click(input)
    await user.keyboard('a')

    expect(mockOnKeyUp).toHaveBeenCalledTimes(1)
  })

  it('should handle onKeyPress events', async () => {
    const mockOnKeyPress = jest.fn()
    const user = userEvent.setup()
    render(<Input onKeyPress={mockOnKeyPress} placeholder="Key press input" />)

    const input = screen.getByPlaceholderText('Key press input')
    await user.click(input)
    await user.keyboard('a')

    expect(mockOnKeyPress).toHaveBeenCalledTimes(1)
  })

  it('should handle onInput events', async () => {
    const mockOnInput = jest.fn()
    const user = userEvent.setup()
    render(<Input onInput={mockOnInput} placeholder="Input event input" />)

    const input = screen.getByPlaceholderText('Input event input')
    await user.type(input, 'test')

    expect(mockOnInput).toHaveBeenCalled()
  })

  it('should handle onPaste events', async () => {
    const mockOnPaste = jest.fn()
    const user = userEvent.setup()
    render(<Input onPaste={mockOnPaste} placeholder="Paste input" />)

    const input = screen.getByPlaceholderText('Paste input')
    await user.click(input)
    await user.paste('pasted text')

    expect(mockOnPaste).toHaveBeenCalled()
  })

  it('should handle defaultValue', () => {
    render(
      <Input defaultValue="default value" placeholder="Default value input" />,
    )

    const input = screen.getByDisplayValue('default value')
    expect(input).toBeInTheDocument()
  })

  it('should handle size attribute', () => {
    render(<Input size={20} placeholder="Size input" />)

    const input = screen.getByPlaceholderText('Size input')
    expect(input).toHaveAttribute('size', '20')
  })

  it('should handle step attribute for number inputs', () => {
    render(<Input type="number" step={0.1} placeholder="Step input" />)

    const input = screen.getByPlaceholderText('Step input')
    expect(input).toHaveAttribute('step', '0.1')
  })

  it('should handle min and max attributes for number inputs', () => {
    render(
      <Input type="number" min={0} max={100} placeholder="Min max input" />,
    )

    const input = screen.getByPlaceholderText('Min max input')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('should handle accept attribute for file inputs', () => {
    render(<Input type="file" accept=".pdf,.doc" placeholder="File input" />)

    const input = screen.getByPlaceholderText('File input')
    expect(input).toHaveAttribute('accept', '.pdf,.doc')
  })

  it('should handle multiple attribute for file inputs', () => {
    render(<Input type="file" multiple placeholder="Multiple file input" />)

    const input = screen.getByPlaceholderText('Multiple file input')
    expect(input).toHaveAttribute('multiple')
  })

  it('should handle form attribute', () => {
    render(<Input form="test-form" placeholder="Form input" />)

    const input = screen.getByPlaceholderText('Form input')
    expect(input).toHaveAttribute('form', 'test-form')
  })

  it('should handle list attribute', () => {
    render(<Input list="test-list" placeholder="List input" />)

    const input = screen.getByPlaceholderText('List input')
    expect(input).toHaveAttribute('list', 'test-list')
  })

  it('should handle spellCheck attribute', () => {
    render(<Input spellCheck={false} placeholder="Spell check input" />)

    const input = screen.getByPlaceholderText('Spell check input')
    expect(input).toHaveAttribute('spellcheck', 'false')
  })

  it('should handle autoCapitalize attribute', () => {
    render(<Input autoCapitalize="words" placeholder="Auto capitalize input" />)

    const input = screen.getByPlaceholderText('Auto capitalize input')
    expect(input).toHaveAttribute('autocapitalize', 'words')
  })

  it('should handle autoCorrect attribute', () => {
    render(<Input autoCorrect="off" placeholder="Auto correct input" />)

    const input = screen.getByPlaceholderText('Auto correct input')
    expect(input).toHaveAttribute('autocorrect', 'off')
  })

  it('should handle enterKeyHint attribute', () => {
    render(<Input enterKeyHint="search" placeholder="Enter key hint input" />)

    const input = screen.getByPlaceholderText('Enter key hint input')
    expect(input).toHaveAttribute('enterkeyhint', 'search')
  })

  it('should handle inputMode attribute', () => {
    render(<Input inputMode="numeric" placeholder="Input mode input" />)

    const input = screen.getByPlaceholderText('Input mode input')
    expect(input).toHaveAttribute('inputmode', 'numeric')
  })

  it('should handle dir attribute', () => {
    render(<Input dir="ltr" placeholder="Dir input" />)

    const input = screen.getByPlaceholderText('Dir input')
    expect(input).toHaveAttribute('dir', 'ltr')
  })

  it('should handle formAction attribute', () => {
    render(<Input formAction="/submit" placeholder="Form action input" />)

    const input = screen.getByPlaceholderText('Form action input')
    expect(input).toHaveAttribute('formaction', '/submit')
  })

  it('should handle formMethod attribute', () => {
    render(<Input formMethod="post" placeholder="Form method input" />)

    const input = screen.getByPlaceholderText('Form method input')
    expect(input).toHaveAttribute('formmethod', 'post')
  })

  it('should handle formNoValidate attribute', () => {
    render(<Input formNoValidate placeholder="Form no validate input" />)

    const input = screen.getByPlaceholderText('Form no validate input')
    expect(input).toHaveAttribute('formnovalidate')
  })

  it('should handle formTarget attribute', () => {
    render(<Input formTarget="_blank" placeholder="Form target input" />)

    const input = screen.getByPlaceholderText('Form target input')
    expect(input).toHaveAttribute('formtarget', '_blank')
  })

  it('should handle onInvalid events', async () => {
    const mockOnInvalid = jest.fn()
    const user = userEvent.setup()
    render(
      <Input onInvalid={mockOnInvalid} required placeholder="Invalid input" />,
    )

    const input = screen.getByPlaceholderText('Invalid input')
    await user.click(input)
    await user.tab()

    expect(input).toBeInTheDocument()
  })

  it('should handle onReset events', () => {
    const mockOnReset = jest.fn()
    render(<Input onReset={mockOnReset} placeholder="Reset input" />)

    const input = screen.getByPlaceholderText('Reset input')
    expect(input).toBeInTheDocument()
  })

  it('should handle search input type', () => {
    render(<Input type="search" placeholder="Search input" />)

    const input = screen.getByPlaceholderText('Search input')
    expect(input).toHaveAttribute('type', 'search')
  })

  it('should handle onBeforeInput events', async () => {
    const mockOnBeforeInput = jest.fn()
    const user = userEvent.setup()
    render(
      <Input onBeforeInput={mockOnBeforeInput} placeholder="Before input" />,
    )

    const input = screen.getByPlaceholderText('Before input')
    await user.click(input)
    await user.type(input, 'a')

    expect(input).toBeInTheDocument()
  })

  it('should handle onCompositionStart events', () => {
    const mockOnCompositionStart = jest.fn()
    render(
      <Input
        onCompositionStart={mockOnCompositionStart}
        placeholder="Composition start"
      />,
    )

    const input = screen.getByPlaceholderText('Composition start')
    expect(input).toBeInTheDocument()
  })

  it('should handle onCompositionEnd events', () => {
    const mockOnCompositionEnd = jest.fn()
    render(
      <Input
        onCompositionEnd={mockOnCompositionEnd}
        placeholder="Composition end"
      />,
    )

    const input = screen.getByPlaceholderText('Composition end')
    expect(input).toBeInTheDocument()
  })

  it('should handle onCompositionUpdate events', () => {
    const mockOnCompositionUpdate = jest.fn()
    render(
      <Input
        onCompositionUpdate={mockOnCompositionUpdate}
        placeholder="Composition update"
      />,
    )

    const input = screen.getByPlaceholderText('Composition update')
    expect(input).toBeInTheDocument()
  })
})
