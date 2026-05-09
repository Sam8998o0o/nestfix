import {
  CURTAIN_TYPES,
  FLOOR_CEILING_SURCHARGE,
  FLOOR_CEILING_MIN_HEIGHT,
  FLOOR_CEILING_MAX_HEIGHT,
} from './constants'

export function calcWindow(win: {
  typeIdx: number
  width: number
  height: number
}): { price: number; valid: boolean } {
  const type = CURTAIN_TYPES[win.typeIdx]
  if (!type) return { price: 0, valid: false }

  let price = 0

  if (type.mode === 'blind') {
    if (win.width >= 270) return { price: 0, valid: false }
    price = type.flatPrice
  } else {
    const units = Math.ceil(win.width / 30)
    price = Math.round(units * type.ratePerUnit * 100) / 100
  }

  if (win.height >= FLOOR_CEILING_MIN_HEIGHT && win.height <= FLOOR_CEILING_MAX_HEIGHT) {
    price += FLOOR_CEILING_SURCHARGE
  }

  return { price, valid: true }
}