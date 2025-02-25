import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayersList from './components/PlayersList';
import SignIn from './components/SignIn';

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [newTournament, setNewTournament] = useState({ name: '', date: '', format: '' });
    const [user, setUser] = useState(null); // Default to null (Hidden by default)

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
                            <span className="text-lg">👤 {user.username}</span>
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
                </nav>

                {/* Main Content */}
                <div className="container mx-auto p-6">
                    <Routes>
                        <Route exact path="/" element={<TournamentList tournaments={tournaments} />} />
                        <Route path="/signin" element={<SignIn />} />

                        {/* Hide the "Create Tournament" page from players by default */}
                        {user && user.role !== 'player' && (
                            <Route path="/create-tournament" element={<TournamentCreationForm newTournament={newTournament} setNewTournament={setNewTournament} />} />
                        )}

                        <Route path="/players" element={<PlayersList />} />
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

/* Tournament List Component */
const TournamentList = ({ tournaments }) => (
    <div>
        <h2 className="text-3xl font-bold text-center mb-6">🏆 Upcoming Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.length === 0 ? (
                <p className="text-center">No tournaments available.</p>
            ) : (
                tournaments.map((tournament) => (
                    <div key={tournament._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gold-500">
                        <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                        <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                        <button
                            className="mt-4 w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                        >
                            Register
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
);

/* Tournament Creation Form */
const TournamentCreationForm = ({ newTournament, setNewTournament }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-gold-400">➕ Create New Tournament</h2>
        <form className="space-y-4">
            <input
                type="text"
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
            />
            <input
                type="date"
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                value={newTournament.date}
                onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
            />
            <select
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                value={newTournament.format}
                onChange={(e) => setNewTournament({ ...newTournament, format: e.target.value })}
            >
                <option value="single elimination">Single Elimination</option>
                <option value="round robin">Round Robin</option>
            </select>
            <button type="submit" className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition">
                Create Tournament
            </button>
        </form>
    </div>
);

export default App;
