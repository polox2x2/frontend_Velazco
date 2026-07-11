import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import styles from './MainLayout.module.css'

export interface MainContext {
  busqueda: string
}

function MainLayout() {
  const [sidebarAbierta, setSidebarAbierta] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  return (
    <div className={styles.layout}>
      <Sidebar
        abierta={sidebarAbierta}
        onCerrar={() => setSidebarAbierta(false)}
      />
      <main className={styles.main}>
        <Header
          onToggleSidebar={() => setSidebarAbierta((v) => !v)}
          busqueda={busqueda}
          onCambiarBusqueda={setBusqueda}
        />
        <div className={styles.content}>
          <Outlet context={{ busqueda } satisfies MainContext} />
        </div>
        <Footer />
      </main>
    </div>
  )
}

export default MainLayout
