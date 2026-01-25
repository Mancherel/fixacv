import { CVProvider } from './context/CVContext'
import { Layout } from './components/Layout'
import { Editor } from './components/Editor'
import { PreviewPanel } from './components/PreviewPanel'

function App() {
  return (
    <CVProvider>
      <Layout editor={<Editor />} preview={<PreviewPanel />} />
    </CVProvider>
  )
}

export default App
