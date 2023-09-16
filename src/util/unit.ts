export type Unit = 'dB' | 'Hz' | 'pan' | '%' | ''

export function unitIsLogarithmic(unit: Unit) {
  return ['Hz'].includes(unit)
}

export function formatUnit(value: number, unit: Unit | undefined, decimals: number | undefined) {
  switch (unit) {
    case 'dB':
      return formatDb(value)
    case 'Hz':
      return formatHz(value)
    case 'pan':
      return formatPan(value)
    case '%':
      return formatPercent(value)
    default:
      return value.toFixed(decimals)
  }
}

export function formatDb(value: number, digits?: number) {
  return fixedDigits(value, digits ?? 3) + ' dB'
}

export function formatHz(value: number, digits?: number) {
  if (value < 1000) {
    return fixedDigits(value, digits ?? 3) + ' Hz'
  } else {
    return fixedDigits(value / 1000, digits ?? 3) + ' kHz'
  }
}

export function formatPan(value: number) {
  const int = Math.round(value)
  if (int < 0) return -int + 'L'
  if (int > 0) return int + 'R'
  return 'C'
}

export function formatPercent(value: number, digits?: number) {
  return fixedDigits(value, digits ?? 2) + '%'
}

function fixedDigits(value: number, digits: number): string {
  const abs = Math.abs(value)
  const leadingDigits = abs > 1 ? Math.floor(Math.log10(abs)) + 1 : 1
  return value.toFixed(Math.max(digits - leadingDigits, 0))
}
