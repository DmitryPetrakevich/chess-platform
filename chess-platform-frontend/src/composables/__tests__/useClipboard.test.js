import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClipboard } from '../utils/useClipboard'

describe('useClipboard', () => {
  let originalClipboard

  beforeEach(() => {
    originalClipboard = navigator.clipboard
    
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue()
    }
    
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true
    })
  })

  it('должен копировать текст в буфер обмена', async () => {
    const { copyToClipboard, copied } = useClipboard()
    
    expect(copied.value).toBe(false)
    
    const result = await copyToClipboard('hello world')
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world')
    expect(result).toBe(true)
    expect(copied.value).toBe(true)
  })

  it('должен обрабатывать ошибки', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      },
      configurable: true,
      writable: true
    })

    const { copyToClipboard, copied, error } = useClipboard()
    
    const result = await copyToClipboard('test')
    
    expect(result).toBe(false)
    expect(copied.value).toBe(false)
    expect(error.value).toBe('Не удалось скопировать')
  })
})