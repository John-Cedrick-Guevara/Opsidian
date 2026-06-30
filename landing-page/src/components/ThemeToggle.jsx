import React from 'react'
import { Icons } from './Icons'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle = () => {
  const { theme, toggle } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__sun"><Icons.Sun /></span>
      <span className="theme-toggle__moon"><Icons.Moon /></span>
    </button>
  )
}

export default ThemeToggle
