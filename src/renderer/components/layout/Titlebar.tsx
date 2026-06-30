import React from 'react'
import iconUrl from '../../assets/icon.png'
import { useNotesStore } from '../../stores/useNotesStore'
import { useUIStore } from '../../stores/useUIStore'

export const Titlebar: React.FC = () => {
  const { currentNote } = useNotesStore()
  const { currentView } = useUIStore()

  const subtitle =
    currentView === 'notes' && currentNote
      ? `Opsidian — ~/Notes/${currentNote.title || 'Untitled'}.md`
      : 'Opsidian'

  return (
    <div className="window-titlebar">
      <div className="window-titlebar-title">
        <img src={iconUrl} alt="" className="window-titlebar-icon" width={16} height={16} />
        <span>{subtitle}</span>
      </div>
    </div>
  )
}

export default Titlebar
