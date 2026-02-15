import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Archive } from './pages/Archive'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
                <Header />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/archive" element={<Archive />} />
                    </Routes>
                </main>

                {/* Bottom indicator for iOS/Mobile */}
                <div className="fixed bottom-0 left-0 right-0 h-1.5 bg-slate-900 pointer-events-none" />
            </div>
        </Router>
    )
}

export default App
