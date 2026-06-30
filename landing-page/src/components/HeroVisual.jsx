import React from 'react'
import { Icons } from './Icons'
import EditorContent from './EditorContent'
import GraphMock from './GraphMock'

const HeroVisual = () => (
  <div className="hero__visual">
    <div className="app-window">
      <div className="app-window__bar">
        <div className="app-window__dots">
          <span className="app-window__dot app-window__dot--red"></span>
          <span className="app-window__dot app-window__dot--yellow"></span>
          <span className="app-window__dot app-window__dot--green"></span>
        </div>
        <div className="app-window__title">Opsidian — ~/Notes/Q3 Planning.md</div>
      </div>
      <div className="hero-composite">
        <div className="hero-composite__sidebar">
          <div className="hero-composite__sidebar-icon hero-composite__sidebar-icon--active"><Icons.Note /></div>
          <div className="hero-composite__sidebar-icon"><Icons.Graph /></div>
          <div className="hero-composite__sidebar-icon"><Icons.Kanban /></div>
          <div className="hero-composite__sidebar-icon"><Icons.Calendar /></div>
          <div style={{ flex: 1 }}></div>
          <div className="hero-composite__sidebar-icon"><Icons.Settings /></div>
        </div>
        <div className="hero-composite__notelist">
          <div className="notelist__header">Notes · 24</div>
          <div className="notelist__item notelist__item--active">
            <span className="notelist__item-dot"></span>Q3 Planning
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Sync architecture
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Graph view
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Weekly review · Aug 12
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Maya Chen
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Rendering pipeline
          </div>
          <div className="notelist__item">
            <span className="notelist__item-dot"></span>Hiring — sync eng
          </div>
        </div>
        <div className="hero-composite__main">
          <div className="hero-composite__editor">
            <EditorContent />
          </div>
          <div className="hero-composite__graph">
            <GraphMock />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default HeroVisual
