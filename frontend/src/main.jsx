import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'
import App from './App.jsx'
import './index.css'

datadogRum.init({
    applicationId: 'ed18ff50-c8dd-4c25-8f86-3ca53f7b7bc7',
    clientToken: 'pub3adcdb1ec9c1ef5f2a9c8782738f5be4',
    site: 'datadoghq.com',
    service: 'vibe-mediaplayers',
    env: 'production',
    version: '1.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    plugins: [reactPlugin({ router: false })],
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)