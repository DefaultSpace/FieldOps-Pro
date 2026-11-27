import { BottomNav } from './components/BottomNav'
import { Materials } from './pages/Materials'
import { Settings } from './pages/Settings'
import { Statistics } from './pages/Statistics'
import { SystemStatus } from './components/SystemStatus'
import { MiniStatus } from './components/MiniStatus'
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
                <SystemStatus />
                <MiniStatus />
                <main className="flex-1 app-main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/completed" element={<Completed />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/archive" element={<Archive />} />
                    </Routes>
                </main>

                {/* Bottom indicator for iOS/Mobile */}
                <BottomNav />
            </div>
        </Router>
    )
}

export default App

