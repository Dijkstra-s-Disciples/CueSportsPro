import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // React Router
import PlayersList from './components/PlayersList';
import TournamentList from "./components/TournamentList.jsx";
import TournamentCreationForm from "./components/TournamentCreationForm.jsx";
import PastTournaments from "./components/PastTournaments.jsx"; // Import PlayersList component
import SignIn from './components/SignIn';
import DisplayProfile from "./components/Profile.jsx";

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [user, setUser] = useState(null); // Default to null (Hidden by default)

    // This might need a dependency so it will load when a new one is submitted
    // Fetch tournaments on component load
    useEffect(() => {
        axios.get('http://localhost:5001/tournaments')
            .then((response) => setTournaments(response.data))
            .catch((error) => console.log('Error fetching tournaments:', error));
    }, []);

    // Fetch logged-in user
    useEffect(() => {
        axios.get('http://localhost:5001/user', { withCredentials: true })
            .then((response) => {
                console.log("Authenticated User:", response.data);
                setUser(response.data); // Set user data once fetched
            })
            .catch(() => setUser({ role: 'player' })); // Default to 'player' if not authenticated
    }, []);

    // Handle Logout
    const handleLogout = () => {
        axios.post('http://localhost:5001/logout', {}, { withCredentials: true })
            .then(() => {
                setUser(null); // Reset user state
                window.location.href = "/signin"; // Redirect to Sign In page
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

                    {/* User Icon & Logout Button */}
                    {user && user.username ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/profile" className="text-lg">👤 {user.username}</Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                                🚪 Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/signin" className="text-lg hover:text-gold-400 transition">🔐 Sign In</Link>
                    )}
                </header>

                {/* Navigation Bar */}
                <nav className="flex justify-center space-x-6 bg-green-800 p-4 text-lg font-semibold">
                    <Link to="/" className="hover:text-gold-400 transition">🏆 Home</Link>

                    {/* Only show "Create Tournament" if user is NOT a player */}
                    {user && user.role !== 'player' && (
                        <Link to="/create-tournament" className="hover:text-gold-400 transition">➕ Create Tournament</Link>
                    )}

                    <Link to="/players" className="hover:text-gold-400 transition">🎮 Players</Link>
                    <Link to="/past-tournaments" className="hover:text-gold-400 transition">Past Tournaments</Link>
                </nav>

                {/* Main Content */}
                <div className="container mx-auto p-6">
                    <Routes>
                        <Route exact path="/" element={<TournamentList tournaments={tournaments} />} />
                        <Route path="/signin" element={<SignIn />} />

                        {/* Hide the "Create Tournament" page from players by default */}
                        {user && user.role !== 'player' && (
                            <Route path="/create-tournament" element={<TournamentCreationForm />} />
                        )}
                        <Route path="/players" element={<PlayersList />} />
                        <Route path="/past-tournaments" element={<PastTournaments />} />
                        <Route path="/profile" element={<DisplayProfile user={user} />} />
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

// {(user !== null)?
//     <Link to="/profile" className="hover:text-gold-400 transition">Profile</Link>:
//     <Link to="/signin" className="hover:text-gold-400 transition">🔐 Sign In</Link>
// }

export default App;
