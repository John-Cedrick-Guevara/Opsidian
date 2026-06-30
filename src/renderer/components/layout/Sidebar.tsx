import React from 'react'
import { useUIStore } from '../../stores/useUIStore'
import { AppView } from '../../types'
import { Icons } from './Icons'
import ThemeToggle from './ThemeToggle'
import iconUrl from '../../assets/icon.png'

export const Sidebar: React.FC = () => {
  const { currentView, setView, sidebarExpanded, toggleSidebar } = useUIStore()

  const navItems: { view: AppView; label: string; icon: React.ComponentType<any> }[] = [
    { view: 'notes', label: 'Notes', icon: Icons.Note },
    { view: 'graph', label: 'Graph View', icon: Icons.Graph },
    { view: 'kanban', label: 'Kanban Board', icon: Icons.Kanban },
    { view: 'calendar', label: 'Calendar', icon: Icons.Calendar }
  ]

  return (
    <div className={`app-sidebar ${!sidebarExpanded ? 'app-sidebar--collapsed' : ''}`}>
      <div className="app-sidebar-header">
        <button
          className="theme-toggle-btn"
          onClick={toggleSidebar}
          title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar width"
        >
          <Icons.Menu className="nav-item-icon" />
        </button>
        <img src={iconUrl} alt="" className="app-sidebar-logo-icon" width={22} height={22} />
        <span className="app-sidebar-logo-text">Opsidian</span>
      </div>

      <nav className="app-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.view
          return (
            <div
              key={item.view}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => setView(item.view)}
              title={!sidebarExpanded ? item.label : undefined}
            >
              <Icon className="nav-item-icon" />
              <span className="nav-item-label">{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div className="app-sidebar-footer">
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Sidebar
