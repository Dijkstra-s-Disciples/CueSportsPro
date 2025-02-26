import React from "react";
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios to make requests

const TournamentList = ({ tournaments, user }) => {

    console.log("Props in TournamentList:", { tournaments, user }); // Check if user is coming in

    // Function to handle registration
    const handleRegister = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to register.');
            return;
        }

        try {
            // Ensure withCredentials is set to true to send the session cookie
            const response = await axios.post(
                `http://localhost:5001/tournament/${tournamentId}/register`,
                { userId: user._id }, // Send userId of the logged-in user
                { withCredentials: true } // Important: sends cookies/session with the request
            );
            alert(response.data.message);
        } catch (error) {
            alert('Error registering for the tournament.');
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-6">🏆 Upcoming Tournaments</h2>
            <h2 className="text-3xl font-bold text-center mb-6">{user}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.length === 0 ? (
                    <p className="text-center">No tournaments available.</p>
                ) : (
                    tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gold-500">
                            <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                            <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                            <p className="text-sm text-gray-300">👥 Players: {tournament.players.length} / 32</p>

                            <div className="mt-4 flex space-x-4">

                                {/* Uncomment the two below lines once user bug is fixed */}
                                {/*{user && (*/}
                                    <button
                                        onClick={() => handleRegister(tournament._id)}
                                        className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                                        disabled={tournament.players.length >= 32}
                                    >
                                        {tournament.players.length >= 32 ? "Tournament Full" : "Register"}
                                    </button>
                                {/*)}*/}

                                {/* View Bracket Button */}
                                <Link to={`/tournament/${tournament._id}/bracket`} className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 transition text-center">
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
