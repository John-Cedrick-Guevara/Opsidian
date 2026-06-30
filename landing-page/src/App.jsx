import React, { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemFraming from './components/ProblemFraming'
import FeatureShowcase from './components/FeatureShowcase'
import TrustSection from './components/TrustSection'
import HowItWorks from './components/HowItWorks'
import Download from './components/Download'
import Footer from './components/Footer'
import './assets/styles.css'

function App() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('opsidian-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme = saved || (prefersDark ? 'dark' : 'light')
      document.documentElement.dataset.theme = theme
    } catch (e) {}
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProblemFraming />
        <FeatureShowcase />
        <TrustSection />
        <HowItWorks />
        <Download />
      </main>
      <Footer />
    </>
  )
}

export default App
