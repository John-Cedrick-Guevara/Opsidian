import React from 'react'
import { Icons } from './Icons'
import { useReveal } from '../hooks/useReveal'

const TrustSection = () => {
  const [ref, visible] = useReveal()
  const points = [
    {
      icon: <Icons.HardDrive />,
      title: 'Plain markdown on disk',
      body: 'Every note is a .md file in a folder you choose. Open it in vim, grep it, back it up to a thumb drive. The app is just a viewer.',
    },
    {
      icon: <Icons.WifiOff />,
      title: 'Works offline, always',
      body: 'No spinners when the wifi drops. No "reconnecting…" banner. The app doesn\'t know whether you\'re online, and it doesn\'t care.',
    },
    {
      icon: <Icons.UserX />,
      title: 'No account required',
      body: 'Download, open, write. No email confirmation, no workspace setup, no "verify your domain." Your data isn\'t tied to a login.',
    },
    {
      icon: <Icons.Lock />,
      title: 'Optional E2E sync',
      body: 'If you want sync across desktop and mobile, flip it on. End-to-end encrypted, CRDT-based, and works through any S3-compatible bucket.',
    },
  ]

  return (
    <section className="trust" id="local-first">
      <div className="container">
        <div ref={ref} className={`reveal${visible ? ' is-visible' : ''}`}>
          <div className="section-eyebrow">Local-first</div>
          <h2 className="section-title">Local-first isn't a feature. It's the architecture.</h2>
          <p className="section-lead">
            Most apps treat your device as a thin client. Opsidian treats it as the source of truth. The cloud is optional, the file format is open, and the app keeps working the day our servers disappear.
          </p>
        </div>

        <div className="trust__grid">
          <div className="trust__points">
            {points.map((p, i) => (
              <div key={i}>
                <div className="trust-point__icon">{p.icon}</div>
                <div className="trust-point__title">{p.title}</div>
                <div className="trust-point__body">{p.body}</div>
              </div>
            ))}
          </div>

          <div className="trust__visual">
            <div className="trust__visual-bar">
              <div className="app-window__dots">
                <span className="app-window__dot app-window__dot--red"></span>
                <span className="app-window__dot app-window__dot--yellow"></span>
                <span className="app-window__dot app-window__dot--green"></span>
              </div>
              <div className="trust__visual-path">
                <span className="tilde">~</span>/Opsidian
              </div>
            </div>
            <div className="trust__visual-body">
              <div className="trust-file"><span className="trust-file__name">Notes/</span></div>
              <div className="trust-file trust-file__indent">Q3 Planning.md</div>
              <div className="trust-file trust-file__indent">Sync architecture.md</div>
              <div className="trust-file trust-file__indent">Graph view.md</div>
              <div className="trust-file trust-file__indent">Maya Chen.md</div>
              <div className="trust-file"><span className="trust-file__name">Tasks/</span></div>
              <div className="trust-file trust-file__indent">recurring.json <span className="trust-file__comment"># your weekly review, etc.</span></div>
              <div className="trust-file"><span className="trust-file__name">Calendar/</span></div>
              <div className="trust-file trust-file__indent">2025-08.ics</div>
              <div className="trust-file"><span className="trust-file__name">.opsidian/</span></div>
              <div className="trust-file trust-file__indent">graph.cache <span className="trust-file__comment"># derived, deletable</span></div>
              <div className="trust-file trust-file__indent"><span className="trust-file__accent">sync.enc</span> <span className="trust-file__comment"># only if you opt in</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustSection
