import React from 'react';
import axios from 'axios'; // Import axios to make requests
import { Link } from 'react-router-dom';

const TournamentList = ({ tournaments, user }) => {

    // Function to handle registration
    const handleRegister = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to register.');
            return;
        }

        axios.post(`http://localhost:5001/tournament/${tournamentId}/register`, { userId: user._id }, { withCredentials: true })
            .then(response => { console.log(response.data.message); window.location.href="/"; })
            .catch(error => alert('Error registering for the tournament:' + error));
    };

    const handleWithdraw = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to withdraw.');
            return;
        }

        axios.post(`http://localhost:5001/tournament/${tournamentId}/withdraw`, { userId: user._id }, { withCredentials: true })
            .then(response => { console.log(response.data.message); window.location.href="/"; })
            .catch(error => alert('Error withdrawing from the tournament:' + error));
    }

    const handleOfficiate = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to withdraw.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You must be a tournament official to officiate a tournament');
            return;
        }

        axios.post(`http://localhost:5001/tournament/${tournamentId}/officiate`, {userId: user._id }, { withCredentials: true })
            .then(response => { console.log(response.data.message); window.location.href="/"; })
            .catch(error => alert('Error officiating the tournament:' + error));
    }

    // Function to handle starting the tournament (in-progress)
    const handleStart = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to start the tournament.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You do not have permission to start the tournament.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5001/tournament/${tournamentId}/start`, { userId: user._id }, { withCredentials: true });
            alert(response.data.message);
            window.location.reload(); // Refresh the page to reflect the status change
        } catch (error) {
            alert('Error starting the tournament.');
            console.error(error);
        }
    };

    // Function to handle completing the tournament
    const handleComplete = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to complete the tournament.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You do not have permission to complete the tournament.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5001/tournament/${tournamentId}/complete`, { userId: user._id }, { withCredentials: true });
            alert(response.data.message);
            window.location.reload(); // Refresh the page to reflect the status change
        } catch (error) {
            alert('Error completing the tournament.');
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-6">Upcoming Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.length === 0 ? (
                    <p className="text-center">No tournaments available.</p>
                ) : (
                    tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gold-500">
                            <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                            <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-300">🕰️ Time: {tournament.time}</p>
                            <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                            <p className="text-sm text-gray-300">🥇 First To: {tournament.scoring} {tournament.scoring > 1 ? "Wins" : "Win"}</p>
                            <p className="text-sm text-gray-300">👥 Players: {tournament.players.length} / 32</p>

                            <div className="mt-4 flex space-x-4">
                                {/* Register Button (Only visible to players, not tournament officials) */}
                                {user && user.username && (
                                    <>
                                        {(tournament.players.some(player => player._id === user._id) || tournament.officials.some(official => official === user._id)) ? (
                                            <button
                                                onClick={() => handleWithdraw(tournament._id)}
                                                className="w-full sm:w-auto bg-red-600 text-black py-2 px-4 rounded-lg hover:bg-red-500 transition"
                                            >
                                                {tournament.players.some(player => player._id === user._id) ? "Withdraw" : "Unofficiate"}
                                            </button>
                                        ) : user.role === 'tournament-official' ? (
                                            <>
                                                <button
                                                    onClick={() => handleRegister(tournament._id)}
                                                    className="w-full sm:w-auto bg-blue-500 text-black py-2 px-4 rounded-lg hover:bg-blue-400 transition"
                                                    disabled={tournament.players.length >= 32}
                                                >
                                                    {tournament.players.length >= 32 ? "Tournament Full" : "Register"}
                                                </button>
                                                <button
                                                    onClick={() => handleOfficiate(tournament._id)}
                                                    className="w-full sm:w-auto bg-purple-500 text-black py-2 px-4 rounded-lg hover:bg-purple-400 transition"
                                                >
                                                    Officiate
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(tournament._id)}
                                                className="w-full sm:w-auto bg-blue-500 text-black py-2 px-4 rounded-lg hover:bg-blue-400 transition"
                                                disabled={tournament.players.length >= 32}
                                            >
                                                {tournament.players.length >= 32 ? "Tournament Full" : "Register"}
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Only show "Start Tournament" if the tournament is open */}
                                {user && user.username && tournament.officials.some(official => official === user._id) && tournament.status === 'open' && (
                                    <button
                                        onClick={() => handleStart(tournament._id)}
                                        className="w-full sm:w-auto bg-green-500 text-black py-2 px-4 rounded-lg hover:bg-green-400 transition"
                                    >
                                        Start Tournament
                                    </button>
                                )}

                                {/* Only show "Complete Tournament" if the tournament is in-progress */}
                                {user && user.username && tournament.officials.some(official => official === user._id) && tournament.status === 'in-progress' && (
                                    <button
                                        onClick={() => handleComplete(tournament._id)}
                                        className="w-full sm:w-auto bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition"
                                    >
                                        Complete Tournament
                                    </button>
                                )}

                                {/* "View Players" button for tournaments that are open or in-progress */}
                                <Link to={`/tournament/${tournament._id}/players`} className="w-full sm:w-auto bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition">
                                    View Players
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TournamentList;
