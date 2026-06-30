import React from 'react'
import { Icons } from './Icons'
import { useReveal } from '../hooks/useReveal'

const HowItWorks = () => {
  const [ref, visible] = useReveal()
  const steps = [
    {
      num: '01 / Capture',
      icon: <Icons.Capture />,
      title: 'Capture',
      body: 'Drop a thought, a task, a meeting note. The editor stays out of the way — no formatting required unless you ask for it.',
    },
    {
      num: '02 / Link',
      icon: <Icons.Link />,
      title: 'Link',
      body: 'Type [[ to reference any note or task. Backlinks form automatically. The graph starts drawing itself while you write.',
    },
    {
      num: '03 / Organize',
      icon: <Icons.Kanban />,
      title: 'Organize',
      body: 'Drag tasks onto the board. Pin events to the calendar. The graph updates live. No sync button, no refresh, no migration.',
    },
    {
      num: '04 / Review',
      icon: <Icons.Graph />,
      title: 'Review',
      body: 'Open the graph. See what you\'ve been thinking about — and what\'s gone quiet. Click a cluster to dive back in.',
    },
  ]

  return (
    <section className="howitworks" id="how-it-works">
      <div className="container">
        <div ref={ref} className={`reveal${visible ? ' is-visible' : ''}`}>
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Four moves. One workflow.</h2>
          <p className="section-lead">
            Opsidian isn't five apps glued together. It's one workflow where every surface feeds the next — capture becomes a link, becomes a task, becomes a review.
          </p>
        </div>

        <div className="howitworks__steps">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step__num">{s.num}</div>
              <div className="step__icon">{s.icon}</div>
              <div className="step__title">{s.title}</div>
              <div className="step__body">{s.body}</div>
              <div className="step__arrow"><Icons.ChevronRight /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
