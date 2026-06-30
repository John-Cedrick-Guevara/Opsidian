import React from 'react'

const EditorContent = () => (
  <div className="editor-mock__content">
    <div className="editor-mock__title">Q3 Planning</div>
    <div className="editor-mock__heading">Priorities</div>
    <ul className="editor-mock__ul">
      <li className="editor-mock__li">Ship <span className="editor-mock__strong">v0.5</span> — graph perf, mobile beta</li>
      <li className="editor-mock__li">Hire one engineer focused on <span className="editor-mock__color">sync</span></li>
      <li className="editor-mock__li">Write three essays on local-first architecture</li>
    </ul>
    <div className="editor-mock__heading">Notes</div>
    <p className="editor-mock__p">
      The <span className="wikilink">graph view</span> needs to handle 10k nodes without choking. Currently at 2.3k on my workspace and frame rate is fine, but the <span className="wikilink">rendering pipeline</span> is doing too much per frame.
    </p>
    <p className="editor-mock__p">
      Talked to <span className="wikilink">Maya Chen</span> about the <span className="wikilink">sync protocol</span> — she suggested looking at <span className="editor-mock__color editor-mock__color--green">Automerge</span> vs <span className="editor-mock__em">Yjs</span> again.
    </p>
  </div>
)

export default EditorContent
