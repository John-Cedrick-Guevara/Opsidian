import React from 'react'
import EditorContent from './EditorContent'

const EditorMock = () => (
  <div className="app-window">
    <div className="app-window__bar">
      <div className="app-window__dots">
        <span className="app-window__dot app-window__dot--red"></span>
        <span className="app-window__dot app-window__dot--yellow"></span>
        <span className="app-window__dot app-window__dot--green"></span>
      </div>
      <div className="app-window__title">Q3 Planning.md</div>
    </div>
    <div style={{ padding: '28px 32px', background: 'var(--bg-elevated)' }}>
      <EditorContent />
    </div>
  </div>
)

export default EditorMock
