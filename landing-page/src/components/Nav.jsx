import React from 'react'
import { Icons } from './Icons'
import ThemeToggle from './ThemeToggle'
import iconUrl from '../icon.png'

const Nav = () => (
  <header className="nav">
    <div className="container nav__inner">
      <a href="#top" className="nav__logo" aria-label="Opsidian home">
        <span className="nav__logo-mark">
          <img src={iconUrl} alt="" width={28} height={28} className="nav__logo-icon" />
        </span>
        <span>Opsidian</span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a className="nav__link" href="#features">Features</a>
        <a className="nav__link" href="#local-first">Local-first</a>
        <a className="nav__link" href="#how-it-works">How it works</a>
        <a className="nav__link" href="#download">Download</a>
      </nav>
      <div className="nav__actions">
        <ThemeToggle />
        <a className="btn btn--primary nav__cta" href="#download">
          <Icons.Download />
          <span>Download — free</span>
        </a>
      </div>
    </div>
  </header>
)

export default Nav
