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
import InSession from './components/InSession'; // Import the InSession component
import TournamentPlayers from './components/TournamentPlayers'; // Import the new TournamentPlayers component

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown toggle state

    // Fetch logged-in user
    useEffect(() => {
        axios.get('http://localhost:5001/user', { withCredentials: true })
            .then((response) => {
                console.log("Authenticated User:", response.data);
                setUser(response.data);
            })
            .catch(() => setUser({ role: 'player' }));
    }, []);

    // Fetch tournaments on component load
    useEffect(() => {
        axios.get('http://localhost:5001/tournaments')
            .then((response) => setTournaments(response.data))
            .catch((error) => console.log('Error fetching tournaments:', error));
    }, []);

    // Handle Logout
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
            <div className="min-h-screen bg-green-900 text-white">
                {/* Header */}
                <header className="bg-black py-6 flex justify-between items-center px-6">
                    <h1 className="text-4xl font-bold text-gold-500">
                        🎱 Cue Sports Club Tournament Management
                    </h1>

                    {/* User Dropdown */}
                    {user && user.username ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="text-lg flex items-center space-x-2 focus:outline-none"
                            >
                                👤 {user.username} ⬇
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                    <Link
                                        to={`/profile/${user._id}`}
                                        className="block px-4 py-2 hover:bg-gray-700 transition"
                                    >
                                        📝 View Profile
                                    </Link>
                                    <Link
                                        to={`/EditProfile/${user._id}`}
                                        className="block px-4 py-2 hover:bg-gray-700 transition"
                                    >
                                        ✏️ Edit Profile
                                    </Link>
                                    <Link
                                        to={`/settings/${user._id}`}
                                        className="block px-4 py-2 hover:bg-gray-700 transition"
                                    >
                                        ⚙️ Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 transition"
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                    : (
                        <Link to="/signin" className="text-lg hover:text-gold-400 transition">🔐 Sign In</Link>
                    )}
                </header>

                {/* Navigation Bar */}
                <nav className="flex justify-center space-x-6 bg-green-800 p-4 text-lg font-semibold">
                    <Link to="/" className="hover:text-gold-400 transition">🏠 Home</Link>
                    {user && user.role !== 'player' && (
                        <Link to="/create-tournament" className="hover:text-gold-400 transition">➕ Create Tournament</Link>
                    )}
                    <Link to="/players" className="hover:text-gold-400 transition">🎮 Players</Link>
                    <Link to="/past-tournaments" className="hover:text-gold-400 transition">🏆 Past Tournaments</Link>
                    <Link to="/now-in-session" className="hover:text-gold-400 transition">🏁 Now In Session</Link> {/* New Link */}
                </nav>

                {/* Main Content */}
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
                        <Route path="/change-profile" element={<h2 className="text-center text-2xl">Change Profile Page</h2>} />
                        <Route path="/now-in-session" element={<InSession />} /> {/* New Route */}
                        <Route path="/tournament/:id/players" element={<TournamentPlayers user={user} />} /> {/* View Players Route */}
                    </Routes>
                </div>

                {/* Footer */}
                <footer className="bg-black text-center p-4 text-sm">
                    © 2025 Cue Sports Club | Developed for Tournament Enthusiasts 🎱
                </footer>
            </div>
        </Router>
    );
};

export default App;
