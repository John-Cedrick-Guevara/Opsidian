import React from 'react'

const CalendarMock = () => {
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthStart = 5
  const daysInMonth = 31
  const daysInPrev = 31
  const today = 14

  const events = {
    4: [{ label: '1:1 Maya', color: 'accent' }],
    6: [{ label: 'Sprint plan', color: 'blue' }],
    12: [{ label: 'Weekly review', color: 'green' }, { label: 'v0.5 sync', color: 'accent' }],
    14: [{ label: 'v0.5 release', color: 'rose' }, { label: 'Launch post', color: 'amber' }],
    18: [{ label: 'Design rev', color: 'blue' }],
    22: [{ label: 'Weekly review', color: 'green' }],
    26: [{ label: 'Hiring loop', color: 'amber' }],
    28: [{ label: 'Beta sync', color: 'accent' }],
  }

  const cells = []
  for (let i = monthStart - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, out: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, out: false, today: d === today, events: events[d] || [] })
  }
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ day: nextDay++, out: true })
  }

  return (
    <div className="calendar-mock">
      <div className="calendar-mock__header">
        <div className="calendar-mock__month">August 2025</div>
        <div className="calendar-mock__nav">
          <div className="calendar-mock__nav-btn">‹</div>
          <div className="calendar-mock__nav-btn">›</div>
        </div>
      </div>
      <div className="calendar-mock__weekdays">
        {weekdays.map((d, i) => <div className="calendar-mock__weekday" key={i}>{d}</div>)}
      </div>
      <div className="calendar-mock__grid">
        {cells.map((cell, i) => (
          <div
            className={`calendar-day${cell.out ? ' calendar-day--out' : ''}${cell.today ? ' calendar-day--today' : ''}`}
            key={i}
          >
            <div className="calendar-day__num">{cell.day}</div>
            {cell.events && cell.events.map((ev, j) => (
              <div className={`calendar-event calendar-event--${ev.color}`} key={j}>{ev.label}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarMock
