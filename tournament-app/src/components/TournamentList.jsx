import React from "react";


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

export default TournamentList;