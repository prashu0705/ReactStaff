import React, { useState } from 'react'
import Layout from './components/Layout'
import ComposeView from './views/ComposeView'
import AuditView from './views/AuditView'
import LoginView from './views/LoginView'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [active, setActive] = useState('compose') // 'compose' or 'audit'

  React.useEffect(() => {
    const token = localStorage.getItem('rs_token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />
  }

  const handleSignOut = () => {
    localStorage.removeItem('rs_token')
    setIsAuthenticated(false)
  }

  return (
    <Layout active={active} setActive={setActive} onSignOut={handleSignOut}>
      {active === 'compose' ? <ComposeView /> : <AuditView />}
    </Layout>
  )
}
