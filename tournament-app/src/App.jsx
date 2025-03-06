import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PlayersList from './components/PlayersList';
import TournamentList from "./components/TournamentList.jsx";
import TournamentCreationForm from "./components/TournamentCreationForm.jsx";
import PastTournaments from "./components/PastTournaments.jsx";
import SignIn from './components/SignIn';
import DisplayProfile from "./components/Profile.jsx";
import EditProfile from "./components/EditProfile.jsx";
import Bracket from './components/Bracket';
import Settings from './components/Settings';
import InSession from './components/InSession';
import TournamentPlayers from './components/TournamentPlayers';
import DevPanel from './components/DevPanel';
import NotFound from './components/NotFound';
import './styles/modern.css';

// Wrapper component that applies the correct background based on route
const AppContent = () => {
    const [tournaments, setTournaments] = useState([]);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        axios.get('http://localhost:5001/user', { withCredentials: true })
            .then((response) => {
                setUser(response.data);
            })
            .catch(() => setUser({role: 'viewer'}));
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5001/tournaments')
            .then((response) => setTournaments(response.data))
            .catch((error) => console.log('Error fetching tournaments:', error));
    }, []);

    const handleLogout = () => {
        axios.post('http://localhost:5001/logout', {}, { withCredentials: true })
            .then(() => {
                setUser(null);
                window.location.href = "/signin";
            })
            .catch(error => console.error("Logout error:", error));
    };

    return (
        <>
            <div className={`min-h-screen ${isHomePage ? 'home-parallax-bg' : 'bg-gradient-to-b from-emerald-900 to-emerald-800'} text-white`}>
                {isHomePage && <div className="texture-overlay"></div>}
                <header className="bg-gray-900 py-6 px-6 shadow-lg flex justify-between items-center relative z-[1001]">
                    <h1 className="text-4xl font-bold text-white">
                        <span className="text-emerald-400">🎱 Cue</span>Sports<span className="text-emerald-400">Pro</span>
                    </h1>
                    {user && user.username ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="bg-gray-800 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <img src={user?.profilePicture} alt="Profile"
                                     className="w-10 h-10 rounded-full border-2 border-emerald-500 shadow-lg mr-2" />
                                <span>{user.username}</span>
                                <span className="ml-1">▼</span>
                            </button>
                            {dropdownOpen && (
                                <>
                                    {/* Invisible overlay to capture clicks outside the dropdown */}
                                    <div 
                                        className="fixed inset-0 z-[1998]" 
                                        onClick={() => setDropdownOpen(false)}
                                    ></div>
                                    <div
                                        className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-[1999]">
                                        <Link to={`/profile/${user._id}`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                            <span className="mr-2">📝</span> View Profile
                                        </Link>
                                        <Link to={`/EditProfile`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                            <span className="mr-2">✏️</span> Edit Profile
                                        </Link>
                                        <Link to={`/settings/${user._id}`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                            <span className="mr-2">⚙️</span> Settings
                                        </Link>

                                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition flex items-center">
                                            <span className="mr-2">🚪</span> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link to="/signin" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full transition-all duration-200 shadow-md">
                            🔐 Sign In
                        </Link>
                    )}
                </header>

                <nav className="bg-gray-800 shadow-md">
                    <div className="container mx-auto flex flex-wrap justify-center space-x-1 md:space-x-4 p-3 text-base font-medium">
                        <Link to="/" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                            <span className="mr-2">🏠</span> Home
                        </Link>
                        {user && user.role === 'tournament-official' && (
                            <Link to="/create-tournament" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                                <span className="mr-2">➕</span> Create Tournament
                            </Link>
                        )}
                        <Link to="/players" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                            <span className="mr-2">🎮</span> Players
                        </Link>
                        <Link to="/past-tournaments" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                            <span className="mr-2">🏆</span> Past Tournaments
                        </Link>
                        <Link to="/now-in-session" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                            <span className="mr-2">🏁</span> Now In Session
                        </Link>
                    </div>
                </nav>

                <div className="flex-grow container mx-auto px-4 py-6 relative z-10">
                    <Routes>
                        <Route path="/signin" element={<SignIn />} />
                        {user && user.role === 'tournament-official' && (
                            <Route path="/create-tournament" element={<TournamentCreationForm official={user}/>} />
                        )}
                        <Route path="/players" element={<PlayersList />} />
                        <Route path="/past-tournaments" element={<PastTournaments />} />
                        <Route path="/" element={<TournamentList tournaments={tournaments.filter(t => !t.completed && !t.inSession)} user={user} />} />
                        <Route path="/tournament/:id/bracket" element={<Bracket />} />
                        <Route path="/profile/:userID" element={<DisplayProfile />} />
                        <Route path="/EditProfile" element={<EditProfile />} />
                        <Route path="/settings/:userID" element={<Settings />} />
                        <Route path="/now-in-session" element={<InSession />} />
                        <Route path="/tournament/:id/players" element={<TournamentPlayers user={user} />} />
                        {user && user.role === 'admin' && (
                            <Route path="/dev-panel" element={<DevPanel />} />
                        )}
                        
                        {/* 404 - Catch All Route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
            
            <footer className="bg-gray-900 text-center p-6 text-sm relative z-10">
                <div className="container mx-auto">
                    <p className="text-gray-400">© 2025 CueSportsPro | Developed for Tournament Enthusiasts</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        <span className="text-emerald-400 text-2xl">🎱</span>
                    </div>
                </div>
            </footer>
        </>
    );
};

// Main App component
const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
