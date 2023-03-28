import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './main.css'
import App from './app'

createRoot(document.getElementById('dacha')).render(<StrictMode><App /></StrictMode>)
