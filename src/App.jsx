import React, { useState } from 'react'
import Layout from './components/Layout'
import ComposeView from './views/ComposeView'
import AuditView from './views/AuditView'

export default function App() {
  const [active, setActive] = useState('compose') // 'compose' or 'audit'

  return (
    <Layout active={active} setActive={setActive}>
      {active === 'compose' ? <ComposeView /> : <AuditView />}
    </Layout>
  )
}
