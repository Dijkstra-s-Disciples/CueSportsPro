import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const Bracket = () => {
    const { id } = useParams(); // Tournament ID
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('Tournament ID is missing');
            return;
        }

        // Fetch tournament data (either players or bracket)
        axios.get(`http://localhost:5001/tournament/${id}/bracket`)
            .then((response) => {
                console.log('Fetched Tournament Data:', response.data); // Debug response data
                setTournament(response.data);
            })
            .catch((error) => {
                setError('Error fetching bracket');
                console.error('Error fetching bracket data:', error);
            });
    }, [id]);

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!tournament) {
        return <div className="text-center text-white">Loading bracket...</div>;
    }

    console.log('Tournament Data in Frontend:', tournament); // Debug tournament data in frontend

    // If the tournament hasn't begun, display the list of players
    if (tournament.status === 'open') {
        return (
            <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
                <h2 className="text-center text-2xl text-white font-bold mb-8">Players Registered for {tournament.name}</h2>
                <ul className="text-white text-lg">
                    {tournament.players.map((player) => (
                        <li key={player._id}>
                            <Link to={`/profile/${player._id}`} className="hover:text-gold-400 transition">
                                {player.username}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // If the tournament is in-progress (or completed), display the persisted bracket
    return (
        <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-2xl text-white font-bold mb-8">Bracket for {tournament.name}</h2>
            <div className="bracket">
                {tournament.bracket.map((round, index) => (
                    <div key={index} className="round mb-8">
                        <h3 className="text-xl font-semibold text-center mb-4">Round {index + 1}</h3>
                        <div className="flex justify-between">
                            {round.map((match, matchIndex) => (
                                <div key={matchIndex} className="match w-1/4 mx-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                                    <div className="matchup text-center text-lg mb-4">
                                        {/* Render player names, using the populated data */}
                                        <span className="player text-white">
                                            {match.player1 ? match.player1.username : "TBD"}
                                        </span>
                                        <span className="vs text-white mx-2">vs</span>
                                        <span className="player text-white">
                                            {match.player2 ? match.player2.username : "TBD"}
                                        </span>
                                    </div>
                                    {/* Optionally, add a dropdown or UI for selecting a winner */}
                                    <select
                                        value={match.winner || ''}
                                        onChange={(e) => {
                                            match.winner = e.target.value;
                                            // Here, you might send an update to the backend to persist the winner.
                                            setTournament({ ...tournament });
                                        }}
                                        className="w-full p-2 rounded-lg bg-blue-500 text-white"
                                    >
                                        <option value="">Select Winner</option>
                                        {match.player1 && <option value={match.player1._id}>{match.player1.username}</option>}
                                        {match.player2 && <option value={match.player2._id}>{match.player2.username}</option>}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bracket;
