import React from 'react'
import { useReveal } from '../hooks/useReveal'

const ProblemFraming = () => {
  const [ref, visible] = useReveal()
  return (
    <section className="problem">
      <div className="container">
        <div ref={ref} className={`reveal problem__inner${visible ? ' is-visible' : ''}`}>
          <p className="problem__text">
            <strong>Notion</strong> for documents. <strong>Obsidian</strong> for links. <strong>Linear</strong> for tasks. <strong>Google Calendar</strong> for events. <span className="strike">Four tools, four sync failures, one disconnected brain.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProblemFraming
