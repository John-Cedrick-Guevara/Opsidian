import React from 'react'
import { Icons } from './Icons'
import { useReveal } from '../hooks/useReveal'

const FeatureBlock = ({ tag, title, body, bullets, media, reverse }) => {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`reveal feature${reverse ? ' feature--reverse' : ''}${visible ? ' is-visible' : ''}`}>
      <div className="feature__body-col">
        <div className="feature__tag">{tag}</div>
        <h3 className="feature__title">{title}</h3>
        <p className="feature__body">{body}</p>
        {bullets && bullets.length > 0 && (
          <ul className="feature__bullets">
            {bullets.map((b, i) => (
              <li className="feature__bullet" key={i}>
                <Icons.Check />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="feature__media">{media}</div>
    </div>
  )
}

export default FeatureBlock
