import React from 'react'
import { Icons } from './Icons'

const KanbanMock = () => {
  const columns = [
    {
      key: 'todo', label: 'To Do', count: 3, dot: 'todo',
      cards: [
        { title: 'Ship v0.5', tags: [{ label: 'eng', color: 'blue' }] },
        { title: 'Review sync protocol options', tags: [], recurring: 'weekly' },
        { title: 'Update onboarding docs', tags: [{ label: 'docs', color: '' }] },
      ],
    },
    {
      key: 'doing', label: 'Doing', count: 2, dot: 'doing',
      cards: [
        { title: 'Graph perf optimization', tags: [{ label: 'eng', color: 'blue' }, { label: 'p0', color: 'amber' }] },
        { title: 'Mobile beta setup', tags: [{ label: 'eng', color: 'blue' }] },
      ],
    },
    {
      key: 'done', label: 'Done', count: 3, dot: 'done',
      cards: [
        { title: 'Kanban recurrence', tags: [], done: true, recurring: 'weekly' },
        { title: 'Theme toggle', tags: [{ label: 'ui', color: 'green' }], done: true },
        { title: 'Calendar import', tags: [], done: true },
      ],
    },
    {
      key: 'skipped', label: 'Skipped', count: 1, dot: 'skipped',
      cards: [
        { title: 'Custom CSS themes', tags: [{ label: 'deferred', color: '' }], skipped: true },
      ],
    },
  ]

  return (
    <div className="kanban-mock">
      <div className="kanban-mock__header">
        <div className="kanban-mock__title">Board · Engineering</div>
        <div className="kanban-mock__filter">filter: all</div>
      </div>
      <div className="kanban-mock__cols">
        {columns.map(col => (
          <div className="kanban-col" key={col.key}>
            <div className="kanban-col__header">
              <span className={`kanban-col__dot kanban-col__dot--${col.dot}`}></span>
              <span>{col.label}</span>
              <span className="kanban-col__count">{col.count}</span>
            </div>
            {col.cards.map((card, i) => (
              <div
                className={`kanban-card${card.done ? ' kanban-card--done' : ''}${card.skipped ? ' kanban-card--skipped' : ''}`}
                key={i}
              >
                <div className="kanban-card__title">{card.title}</div>
                <div className="kanban-card__meta">
                  {card.recurring && (
                    <span className="kanban-recurring">
                      <Icons.Recurring />
                      <span>{card.recurring}</span>
                    </span>
                  )}
                  {card.tags.map((tag, j) => (
                    <span className={`kanban-tag${tag.color ? ` kanban-tag--${tag.color}` : ''}`} key={j}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanMock
