import type { ReactNode } from 'react'
import { readableDark } from '../lib/util'

type Props = { open: boolean; onClose: () => void; children: ReactNode; color?: string; light?: boolean }

/** Bottom sheet on phones, centred dialog on tablets. `color` is darkened until white text is readable. */
export function Sheet({ open, onClose, children, color, light }: Props) {
  if (!open) return null
  const bg = light ? '#ffffff' : readableDark(color ?? '#1cb0f6')
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className={'sheet' + (light ? ' light' : '')} style={{ ['--sheet' as string]: bg } as React.CSSProperties} onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="sheet-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
