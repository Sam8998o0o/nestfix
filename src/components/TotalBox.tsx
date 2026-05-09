'use client'

import { CURTAIN_TYPES, MINIMUM_ORDER } from '@/lib/constants'
import type { WindowData } from '@/lib/types'

type Props = {
  windows: WindowData[]
}

export default function TotalBox({ windows }: Props) {
  const rawTotal = windows.reduce((sum, w) => sum + w.price, 0)
  const minimumApplies = rawTotal > 0 && rawTotal < MINIMUM_ORDER
  const finalTotal = minimumApplies ? MINIMUM_ORDER : rawTotal

  return (
    <div className="bg-primary rounded-[14px] p-5 md:p-6">
      <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
        Estimated Total Installation Fee
      </p>

      {/* Total price */}
      <p className="text-white text-4xl font-bold">
        RM {finalTotal}
      </p>
      {minimumApplies && (
        <p className="text-white/40 text-xs mt-1">Minimum order applies</p>
      )}

      <p className="text-white/50 text-sm mt-2 mb-4">
        {windows.length} window{windows.length !== 1 ? 's' : ''} · confirmed on-site by installer
      </p>

      {/* Per-window breakdown */}
      <div className="border-t border-white/10 pt-4 space-y-2">
        {windows.map((w, i) => {
          const type = CURTAIN_TYPES[w.typeIdx]
          return (
            <div key={w.id} className="flex justify-between text-sm">
              <span className="text-white/60">
                Window {i + 1} — {type.shortType}
              </span>
              <span className={w.valid ? 'text-white font-medium' : 'text-red-400'}>
                {w.valid ? `RM ${w.price}` : 'invalid'}
              </span>
            </div>
          )
        })}
        {minimumApplies && (
          <div className="flex justify-between text-sm pt-1 border-t border-white/10 mt-1">
            <span className="text-white/40 italic">Minimum order</span>
            <span className="text-white/40">RM {MINIMUM_ORDER}</span>
          </div>
        )}
      </div>
    </div>
  )
}
