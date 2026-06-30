import React from 'react'
import { useReveal } from '../hooks/useReveal'
import FeatureBlock from './FeatureBlock'
import EditorMock from './EditorMock'
import BacklinksMock from './BacklinksMock'
import GraphMock from './GraphMock'
import KanbanMock from './KanbanMock'
import CalendarMock from './CalendarMock'

const FeatureShowcase = () => {
  const [headerRef, headerVisible] = useReveal()
  return (
    <section className="features" id="features">
      <div className="container">
        <div ref={headerRef} className={`reveal features__header${headerVisible ? ' is-visible' : ''}`}>
          <div className="section-eyebrow">Everything in one place</div>
          <h2 className="section-title">Five surfaces, one workspace, zero sync conflicts.</h2>
          <p className="section-lead">
            Each tool below ships in the same file format, against the same graph, on the same device. The editor isn't a separate app from the board; they're two views of the same underlying notes.
          </p>
        </div>

        <FeatureBlock
          tag="Editor"
          title="A writing surface that gets out of the way"
          body="Bold, italic, headings, font sizes, font colors — just enough formatting, none of the toolbar clutter. Slash commands for everything else, markdown shortcuts for the rest."
          bullets={[
            'Markdown shortcuts: **, *, #, -, >',
            'Slash menu for blocks, embeds, and tasks',
            'No autosave spinner — writes go to disk every keystroke',
          ]}
          media={<EditorMock />}
        />

        <FeatureBlock
          tag="Linking"
          title="Notes that know about each other"
          body="Type [[ to reference any note or task. Every backlink is tracked automatically — no maintenance tax, no orphan pages, no separate 'tags' system to keep in sync."
          bullets={[
            'Bi-directional references, updated in real time',
            'Backlinks panel surfaces every incoming reference',
            'Rename a note and every link follows',
          ]}
          media={<BacklinksMock />}
          reverse
        />

        <FeatureBlock
          tag="Graph"
          title="See how your thinking connects"
          body="Every link becomes an edge. Watch clusters form around projects, people, and ideas you keep coming back to. Drag nodes to pin them, click to filter, hover to preview."
          bullets={[
            'Handles 10k+ nodes without dropping frames',
            'Filter by tag, by backlink depth, by recency',
            'Live updates as you write — no rebuild step',
          ]}
          media={
            <div className="app-window">
              <div className="app-window__bar">
                <div className="app-window__dots">
                  <span className="app-window__dot app-window__dot--red"></span>
                  <span className="app-window__dot app-window__dot--yellow"></span>
                  <span className="app-window__dot app-window__dot--green"></span>
                </div>
                <div className="app-window__title">Graph view · 2,341 nodes · 5,892 edges</div>
              </div>
              <div style={{ height: '360px', background: 'var(--bg-subtle)' }}>
                <GraphMock />
              </div>
            </div>
          }
        />

        <FeatureBlock
          tag="Tasks"
          title="A board that handles recurrence"
          body="To Do, Doing, Done, Skipped. Drag tasks across columns. Set a recurrence — daily, weekly, monthly — and watch completed cards respawn on schedule, with full history."
          bullets={[
            'Recurring tasks: daily / weekly / monthly / custom',
            'Skipped is a first-class state, not a hack',
            'Every card is a note — full editor, full links',
          ]}
          media={<KanbanMock />}
          reverse
        />

        <FeatureBlock
          tag="Calendar"
          title="Events alongside your notes"
          body="Google Calendar–style event creation and viewing, tied back to the notes and tasks they relate to. No tab-switching to figure out what a meeting was about."
          bullets={[
            'Attach a note to any event — opens in one click',
            'Recurring events with the same engine as recurring tasks',
            'Local ICS import — your calendar doesn\'t need the cloud',
          ]}
          media={<CalendarMock />}
        />
      </div>
    </section>
  )
}

export default FeatureShowcase
