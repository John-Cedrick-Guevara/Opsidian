import React from 'react'
import { Icons } from './Icons'

const BacklinksMock = () => (
  <div className="backlinks-mock">
    <div className="backlinks-mock__editor">
      <div className="editor-mock__title" style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Graph view</div>
      <p className="editor-mock__p" style={{ marginBottom: '10px' }}>
        Every note and task in Opsidian is a node. Every <span className="wikilink">wikilink</span> is an edge.
      </p>
      <p className="editor-mock__p" style={{ marginBottom: '10px' }}>
        References are tracked in both directions automatically. The <span className="wikilink">Q3 Planning</span> note links here, and this page links back to it.
      </p>
      <p className="editor-mock__p">
        Type <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8em', padding: '1px 5px', background: 'var(--bg-inset)', borderRadius: '4px', color: 'var(--text-secondary)' }}>[[</span> anywhere to start referencing.
      </p>
    </div>
    <div className="backlinks-mock__panel">
      <div className="backlinks-mock__panel-title">
        <Icons.Link />
        <span>Linked references</span>
        <span className="backlinks-mock__panel-count">3</span>
      </div>
      <div className="backlink-item">
        <div className="backlink-item__title">Q3 Planning</div>
        <div className="backlink-item__ctx">
          The <em>graph view</em> needs to handle 10k nodes without…
        </div>
      </div>
      <div className="backlink-item">
        <div className="backlink-item__title">Sync architecture</div>
        <div className="backlink-item__ctx">
          When the <em>graph view</em> updates, we re-broadcast the diff…
        </div>
      </div>
      <div className="backlink-item">
        <div className="backlink-item__title">Weekly review · Aug 12</div>
        <div className="backlink-item__ctx">
          Opened the <em>graph view</em> and noticed a cluster around…
        </div>
      </div>
    </div>
  </div>
)

export default BacklinksMock
