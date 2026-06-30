import React from 'react'
import { useUIStore } from '../../stores/useUIStore'
import { Icons } from './Icons'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore()

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Icons.Sun className="nav-item-icon" />
      ) : (
        <Icons.Moon className="nav-item-icon" />
      )}
    </button>
  )
}
export default ThemeToggle
