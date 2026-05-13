import { useApp } from '../context/AppContext'
import '../styles/Toast.css'

export default function Toast() {
  const { toastMsg } = useApp()
  return <div className={`toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>
}
