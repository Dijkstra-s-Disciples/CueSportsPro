import React from "react";
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios to make requests

const TournamentList = ({ tournaments, user }) => {

    // Function to handle registration
    const handleRegister = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to register.');
            return;
        }

        // Ensure withCredentials is set to true to send the session cookie
        axios.post(`http://localhost:5001/tournament/${tournamentId}/register`, { userId: user._id }, { withCredentials: true })
            .then(response => {console.log(response.data.message); window.location.href="/";})
            .catch(error => alert('Error registering for the tournament:' + error));
    };

    const handleWithdraw = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to withdraw.');
            return;
        }

        axios.post(`http://localhost:5001/tournament/${tournamentId}/withdraw`, { userId: user._id }, { withCredentials: true })
            .then(response => {console.log(response.data.message); window.location.href="/";})
            .catch(error => alert('Error withdrawing from the tournament:' + error));
    };

    const handleOfficiate = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to officiate.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You do not have permission to officiate a tournament.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5001/tournament/${tournamentId}/officiate`,
                { userId: user._id }, // Send userId of the logged-in user
                { withCredentials: true }
            );
            alert(response.data.message); // Handle success
        } catch (error) {
            alert('Error officiating for the tournament.');
            console.error(error);
        }
    };


    return (
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
                            <p className="text-sm text-gray-300">🕰️ Time: {tournament.time}</p>
                            <p className="text-sm text-gray-300">📜 Rules: {tournament.ruleset}</p>
                            <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                            <p className="text-sm text-gray-300">👥 Players: {tournament.players.length} / 32</p>

                            <div className="mt-4 flex flex-wrap gap-4">
                                {/* TODO: need to refactor below statements so they cannot register for a tournament they are officiating */}
                                {user && user.username ? (
                                    <>
                                        {console.log(user)}
                                        {tournament.players.find(player => player._id === user._id) !== undefined ? (
                                            <button
                                                onClick={() => handleWithdraw(tournament._id)}
                                                className="w-full sm:w-auto bg-red-600 text-black py-2 px-4 rounded-lg hover:bg-red-500 transition"
                                            >
                                                Withdraw
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(tournament._id)}
                                                className="w-full sm:w-auto bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                                                disabled={tournament.players.length >= 32}
                                            >
                                                {tournament.players.length >= 32 ? "Tournament Full" : "Register"}
                                            </button>
                                        )}

                                        {user.role === "tournament-official" && !tournament.tournamentOfficial && (
                                            <button
                                                onClick={() => handleOfficiate(tournament._id)}
                                                className="w-full sm:w-auto bg-green-500 text-black py-2 px-4 rounded-lg hover:bg-green-400 transition"
                                            >
                                                Officiate
                                            </button>
                                        )}
                                    </>
                                ) : null}

                                <Link to={`/tournament/${tournament._id}/bracket`} className="w-full sm:w-auto bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 transition text-center">
                                    View Bracket
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
