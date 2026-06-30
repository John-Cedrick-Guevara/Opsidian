import React from 'react'
import iconUrl from '../icon.png'

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-mark">
              <img src={iconUrl} alt="" width={24} height={24} className="footer__logo-icon" />
            </span>
            <span>Opsidian</span>
          </div>
          <p className="footer__tag">
            A local-first workspace for notes, tasks, and a graph that's actually yours.
          </p>
        </div>
        <div className="footer__links">
          <div>
            <div className="footer__col-title">Product</div>
            <a className="footer__link" href="#features">Features</a>
            <a className="footer__link" href="#local-first">Local-first</a>
            <a className="footer__link" href="#how-it-works">How it works</a>
            <a className="footer__link" href="#download">Download</a>
          </div>
          <div>
            <div className="footer__col-title">Resources</div>
            <a className="footer__link" href="#">Docs</a>
            <a className="footer__link" href="#">Changelog</a>
            <a className="footer__link" href="#">Roadmap</a>
            <a className="footer__link" href="#">Community</a>
          </div>
          <div>
            <div className="footer__col-title">Open source</div>
            <a className="footer__link" href="#">GitHub</a>
            <a className="footer__link" href="#">File format spec</a>
            <a className="footer__link" href="#">Sync protocol</a>
            <a className="footer__link" href="#">Contribute</a>
          </div>
          <div>
            <div className="footer__col-title">Legal</div>
            <a className="footer__link" href="#">Privacy</a>
            <a className="footer__link" href="#">License (MIT)</a>
            <a className="footer__link" href="#">Security</a>
            <a className="footer__link" href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div>© 2025 Opsidian. Built for people who keep notes.</div>
        <div className="footer__bottom-links">
          <a className="footer__bottom-link" href="#">Status</a>
          <a className="footer__bottom-link" href="#">RSS</a>
          <a className="footer__bottom-link" href="https://github.com">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
