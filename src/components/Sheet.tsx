import type { ReactNode } from 'react'

export function Sheet({ open, onClose, children, color }: { open: boolean; onClose: () => void; children: ReactNode; color?: string }) {
  if (!open) return null
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" style={color ? ({ ['--sheet' as string]: color } as React.CSSProperties) : undefined} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
