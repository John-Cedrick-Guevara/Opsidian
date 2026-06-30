import React from 'react'
import { Icons } from './Icons'
import { useReveal } from '../hooks/useReveal'

const Download = () => {
  const [ref, visible] = useReveal()
  const platforms = [
    {
      icon: <Icons.Apple />,
      name: 'macOS',
      meta: 'Universal · 124 MB',
      body: 'Apple Silicon and Intel. DMG install, or brew install opsidian. Minimum macOS 11.',
      action: 'Download .dmg',
      available: true,
    },
    {
      icon: <Icons.Windows />,
      name: 'Windows',
      meta: 'x64 · 138 MB',
      body: 'Windows 10 and 11. MSI installer with auto-update. ARM build available on request.',
      action: 'Download .msi',
      available: true,
    },
    {
      icon: <Icons.Linux />,
      name: 'Linux',
      meta: 'AppImage · 142 MB',
      body: 'AppImage, .deb, and .rpm. Flatpak coming in v0.5. Works on Wayland and X11.',
      action: 'Download',
      available: true,
    },
    {
      icon: <Icons.Apple />,
      name: 'iOS',
      meta: 'iPhone & iPad',
      body: 'Native iOS app, end-to-end encrypted sync with your desktop. Reads the same markdown.',
      action: 'Coming soon',
      available: false,
    },
    {
      icon: <Icons.Android />,
      name: 'Android',
      meta: 'Android 10+',
      body: 'Native Android, same CRDT sync. APK and Play Store. Reads the same markdown.',
      action: 'Coming soon',
      available: false,
    },
    {
      icon: <Icons.GitHub />,
      name: 'Build from source',
      meta: 'MIT licensed',
      body: 'The desktop client is open source. Clone, build, audit, fork. The sync server is a separate binary.',
      action: 'View on GitHub',
      available: true,
      github: true,
    },
  ]

  return (
    <section className="download" id="download">
      <div className="container">
        <div ref={ref} className={`reveal download__header${visible ? ' is-visible' : ''}`}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Download</div>
          <h2 className="download__title">Get Opsidian.</h2>
          <p className="download__sub">
            Free during beta. Local-first forever. No account, no telemetry, no upgrade tiers.
          </p>
        </div>

        <div className="download__cards">
          {platforms.map((p, i) => (
            <div className={`dl-card${!p.available && !p.github ? ' dl-card--soon' : ''}`} key={i}>
              <div className="dl-card__top">
                <div className="dl-card__icon">{p.icon}</div>
                <div>
                  <div className="dl-card__name">{p.name}</div>
                  <div className="dl-card__meta">{p.meta}</div>
                </div>
              </div>
              <div className="dl-card__body">{p.body}</div>
              {p.available ? (
                <a
                  className="dl-card__action"
                  href={p.github ? 'https://github.com' : '#'}
                  target={p.github ? '_blank' : undefined}
                  rel={p.github ? 'noopener noreferrer' : undefined}
                >
                  <span>{p.action}</span>
                  <Icons.ArrowRight />
                </a>
              ) : (
                <div className="dl-card__action dl-card__action--soon">
                  <span>{p.action}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="download__footnote">
          Desktop beta is stable enough for daily use. Mobile is in private TestFlight — <a href="#top">join the waitlist</a>.
        </p>
      </div>
    </section>
  )
}

export default Download
