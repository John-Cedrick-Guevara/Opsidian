import React, { useEffect } from 'react'
import { Icons } from './Icons'

const DownloadWarningModal = ({ open, onClose, onConfirm, filename }) => {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="dl-modal" role="presentation" onClick={onClose}>
      <div
        className="dl-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dl-modal-title"
        aria-describedby="dl-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="dl-modal__close" onClick={onClose} aria-label="Close">
          <Icons.X />
        </button>

        <div className="dl-modal__badge">Heads up, Windows users</div>
        <h3 id="dl-modal-title" className="dl-modal__title">
          Defender is going to side-eye this download.
        </h3>

        <div id="dl-modal-desc" className="dl-modal__body">
          <p>
            Opsidian isn&apos;t code-signed yet — developer-speak for &ldquo;Microsoft doesn&apos;t
            have our stamp of approval.&rdquo; So <strong>Windows Defender</strong> may block the
            file, yell about an unknown publisher, or make you click through SmartScreen like
            it&apos;s 2009.
          </p>
          <p>
            I know how that looks. Very malware. Very &ldquo;definitely a virus.&rdquo;
            But I&apos;m not trying to hack you — no keyloggers, no crypto miners, no
            &ldquo;upload your entire hard drive to a server in Ohio.&rdquo; It&apos;s a local
            notes app. That&apos;s it. I&apos;m just too cheap to buy a $200/year certificate
            right now.
          </p>
          <div className="dl-modal__steps">
            <p className="dl-modal__steps-title">If Defender gets in the way:</p>
            <ol>
              <li>Temporarily allow the download, or pause real-time protection while you install.</li>
              <li>On SmartScreen: <strong>More info</strong> → <strong>Run anyway</strong>.</li>
              <li>Install, open Opsidian, write something brilliant.</li>
            </ol>
          </div>
          <p className="dl-modal__fineprint">
            Still side-eyeing us? Source is on GitHub — clone it, build it yourself, audit every
            line. I can take the roast.
          </p>
        </div>

        <div className="dl-modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Never mind
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            <Icons.Download />
            <span>Download anyway — I trust you (mostly)</span>
          </button>
        </div>

        {filename && (
          <p className="dl-modal__file">{filename}</p>
        )}
      </div>
    </div>
  )
}

export default DownloadWarningModal
