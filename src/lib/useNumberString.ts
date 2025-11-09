'use client'

import { useCallback, useState } from 'react'

/**
 * Контролируемая числовая строка (только цифры).
 * Подходит для input с числовым вводом, где нужно:
 *  - чистить нецифровые символы
 *  - убирать "0" при фокусе
 *  - отдавать число как строку (легче контролировать leading zero)
 */
export function useNumberString(initial: number | string = ''): [
  value: string,
  setValue: (v: string | number) => void
] {
  const start = initial === 0 ? '0' : String(initial ?? '')
  const [value, _setValue] = useState<string>(digitsOnly(start))

  const setValue = useCallback((v: string | number) => {
    const s = typeof v === 'number' ? String(v) : v
    _setValue(digitsOnly(s))
  }, [])

  return [value, setValue]
}

/** Пропсы для <input> с числовым вводом (убираем '0' при фокусе) */
export function numInputProps(
  value: string,
  setValue: (v: string | number) => void
) {
  return {
    inputMode: 'numeric',
    pattern: '[0-9]*',
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onFocus: () => { if (value === '0') setValue('') },
    onBlur: () => {
      // Нормализуем лидирующие нули: '' оставляем пустым, '000' -> '0'
      if (!value) return
      const v = value.replace(/^0+(?=\d)/, '')
      setValue(v || '0')
    },
  }
}

/** Утилита: безопасно превратить строку в целое */
export function toInt(v: string | number | null | undefined): number {
  if (v == null) return 0
  const s = typeof v === 'number' ? String(v) : v
  const n = parseInt(s || '0', 10)
  return Number.isFinite(n) ? n : 0
}

function digitsOnly(s: string) {
  return s.replace(/[^\d]/g, '')
}

export default useNumberString
