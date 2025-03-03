import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5001/user', { withCredentials: true })
            .then((response) => {
                console.log("Authenticated User:", response.data);
                setUser(response.data);
            })
            .catch(() => setUser(null));
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
        <Router>
            <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
                <header className="bg-gray-900 py-6 px-6 shadow-lg flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white">
                        <span className="text-emerald-400">🎱 Cue</span>Sports<span className="text-emerald-400">Pro</span>
                    </h1>
                    {user && user.username ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="bg-gray-800 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <span className="text-emerald-400">👤</span> 
                                <span>{user.username}</span>
                                <span className="ml-1">▼</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                                    <Link to={`/profile/${user._id}`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                        <span className="mr-2">📝</span> View Profile
                                    </Link>
                                    <Link to={`/EditProfile/${user._id}`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                        <span className="mr-2">✏️</span> Edit Profile
                                    </Link>
                                    <Link to={`/settings/${user._id}`} className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                        <span className="mr-2">⚙️</span> Settings
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/dev-panel" className="block px-4 py-3 hover:bg-gray-700 transition flex items-center">
                                            <span className="mr-2">🛠</span> Dev Panel
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition flex items-center">
                                        <span className="mr-2">🚪</span> Sign Out
                                    </button>
                                </div>
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
                        {user && user.role !== 'player' && (
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
                        {user && user.role === 'admin' && (
                            <Link to="/dev-panel" className="px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center">
                                <span className="mr-2">🛠</span> Dev Tab
                            </Link>
                        )}
                    </div>
                </nav>

                <div className="container mx-auto p-6">
                    <Routes>
                        <Route path="/signin" element={<SignIn />} />
                        {user && user.role !== 'player' && (
                            <Route path="/create-tournament" element={<TournamentCreationForm official={user}/>} />
                        )}
                        <Route path="/players" element={<PlayersList />} />
                        <Route path="/past-tournaments" element={<PastTournaments />} />
                        <Route exact path="/" element={<TournamentList user={user} tournaments={tournaments} />} />
                        <Route path="/tournament/:id/bracket" element={<Bracket />} />
                        <Route path="/profile/:userID" element={<DisplayProfile />} />
                        <Route path="/EditProfile/:userID" element={<EditProfile />} />
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

                <footer className="bg-gray-900 text-center p-6 text-sm">
                    <div className="container mx-auto">
                        <p className="text-gray-400">© 2025 CueSportsPro | Developed for Tournament Enthusiasts</p>
                        <div className="mt-2 flex justify-center space-x-4">
                            <span className="text-emerald-400 text-2xl">🎱</span>
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
};

export default App;
