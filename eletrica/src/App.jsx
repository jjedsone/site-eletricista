import { useState, useEffect } from 'react'
import PublicWebsite from './PublicWebsite'
import ElectricalServiceApp from './ElectricalServiceApp'

function App() {
  const [currentPage, setCurrentPage] = useState('public')

  useEffect(() => {
    // Verifica a URL para determinar qual página mostrar
    const path = window.location.pathname
    if (path === '/admin' || path === '/admin/') {
      setCurrentPage('admin')
    } else {
      setCurrentPage('public')
    }

    // Listener para mudanças de URL
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('admin')
      } else {
        setCurrentPage('public')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Intercepta cliques em links para navegação interna
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a')
      if (target && target.href) {
        const url = new URL(target.href)
        if (url.origin === window.location.origin) {
          if (url.pathname === '/admin' || url.pathname === '/admin/') {
            e.preventDefault()
            window.history.pushState({}, '', '/admin')
            setCurrentPage('admin')
          } else if (url.pathname === '/' || url.pathname === '') {
            e.preventDefault()
            window.history.pushState({}, '', '/')
            setCurrentPage('public')
          }
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (currentPage === 'admin') {
    return <ElectricalServiceApp />
  }

  return <PublicWebsite />
}

export default App
