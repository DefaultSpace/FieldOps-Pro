import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { ReminderCenter } from './components/ReminderCenter'
import { Archive } from './pages/Archive'

import { Completed } from './pages/Completed'
import { Profile } from './components/Profile'

function App() {
    return (
        <Router>
            <div className="min-h-screen text-slate-100 flex flex-col">
                <Header />
                <Profile />
                <ReminderCenter />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/completed" element={<Completed />} />
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
