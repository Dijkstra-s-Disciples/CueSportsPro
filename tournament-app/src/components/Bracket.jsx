import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Bracket = () => {
    const { id } = useParams(); // Get the tournament ID from the URL
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState(null);

    // Fetch the tournament data when the component mounts
    useEffect(() => {
        if (!id) {
            setError('Tournament ID is missing');
            return;
        }

        axios.get(`http://localhost:5001/tournament/${id}/bracket`)
            .then((response) => {
                setTournament(response.data);
            })
            .catch((error) => {
                setError('Error fetching bracket');
                console.error(error);
            });
    }, [id]);

    // Function to pair players for each round
    const generateBracket = (players) => {
        // Randomly shuffle the players
        let shuffledPlayers = [...players];
        for (let i = shuffledPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
        }

        // Create the rounds by pairing players
        const rounds = [];
        let roundPlayers = shuffledPlayers;
        while (roundPlayers.length > 1) {
            const round = [];
            for (let i = 0; i < roundPlayers.length; i += 2) {
                round.push({
                    player1: roundPlayers[i],
                    player2: roundPlayers[i + 1] || null, // Handle odd number of players
                    winner: null,
                });
            }
            rounds.push(round);
            // Prepare players for the next round (winners)
            roundPlayers = round.map((match) => match.winner).filter(Boolean);
        }
        return rounds;
    };

    // Render the bracket round-by-round
    const renderRound = (round, roundIndex) => (
        <div key={roundIndex} className="round mb-8">
            <h3 className="text-xl font-semibold text-center mb-4">Round {roundIndex + 1}</h3>
            <div className="flex justify-between">
                {round.map((match, matchIndex) => (
                    <div key={matchIndex} className="match w-1/4 mx-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="matchup text-center text-lg mb-4">
                            <span className="player text-white">{match.player1 ? match.player1.username : 'TBD'}</span>
                            <span className="vs text-white mx-2">vs</span>
                            <span className="player text-white">{match.player2 ? match.player2.username : 'TBD'}</span>
                        </div>
                        {/* Dropdown for selecting winner */}
                        <select
                            value={match.winner || ''}
                            onChange={(e) => {
                                match.winner = e.target.value; // Update the winner selection
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
    );

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!tournament) {
        return <div className="text-center text-white">Loading bracket...</div>;
    }

    const rounds = generateBracket(tournament.players);

    return (
        <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-2xl text-white font-bold mb-8">Bracket for {tournament.name}</h2>
            <div className="bracket">
                {rounds.map((round, index) => renderRound(round, index))}
            </div>
        </div>
    );
};

export default Bracket;
