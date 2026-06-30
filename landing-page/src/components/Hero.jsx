import React from 'react'
import { Icons } from './Icons'
import { useReveal } from '../hooks/useReveal'
import HeroVisual from './HeroVisual'

const Hero = () => {
  const [ref, visible] = useReveal()
  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true"></div>
      <div className="container hero__inner">
        <div ref={ref} className={`reveal${visible ? ' is-visible' : ''}`}>
          <div className="hero__pill">
            <span className="hero__pill-dot"></span>
            <span>Local-first · Beta</span>
            <span className="hero__pill-version">v0.4.2</span>
          </div>
          <h1 className="hero__headline">
            Notes, tasks, and a graph that's <em>actually yours</em>.
          </h1>
          <p className="hero__sub">
            Opsidian is a local-first workspace that pairs a distraction-free editor with bi-directional linking, a recurring-task kanban, and a calendar. No account. No sync spinners. No lock-in.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--primary btn--lg" href="#download">
              <Icons.Download />
              <span>Download — free</span>
            </a>
            <a className="btn btn--secondary btn--lg" href="#how-it-works">
              <span>See how it works</span>
              <Icons.ArrowDown />
            </a>
          </div>
          <div className="hero__platforms">
            <Icons.Apple />
            <span>macOS</span>
            <span aria-hidden="true">·</span>
            <Icons.Windows />
            <span>Windows</span>
            <span aria-hidden="true">·</span>
            <Icons.Linux />
            <span>Linux</span>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

export default Hero
