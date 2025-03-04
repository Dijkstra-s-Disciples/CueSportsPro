import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Bracket.css'; // We'll create this CSS file next

const Bracket = () => {
    const { id } = useParams(); // Tournament ID
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [matchScores, setMatchScores] = useState({});

    // Helper function to safely compare IDs that might be in different formats
    const isSameId = (id1, id2) => {
        if (!id1 || !id2) return false;
        
        // Convert both IDs to strings for comparison
        const str1 = typeof id1 === 'object' && id1._id ? id1._id.toString() : id1.toString();
        const str2 = typeof id2 === 'object' && id2._id ? id2._id.toString() : id2.toString();
        
        return str1 === str2;
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchBracketData = () => {
        if (!id) {
            setError('Tournament ID is missing');
            setLoading(false);
            return;
        }

        // Fetch tournament data (either players or bracket)
        axios.get(`http://localhost:5001/tournament/${id}/bracket`)
            .then((response) => {
                console.log('Fetched Tournament Data:', response.data);
                setTournament(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Error fetching bracket');
                console.error('Error fetching bracket data:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchBracketData();
    }, [id]);

    const handleWinnerSelection = async (roundIndex, matchIndex, winnerId, score1, score2) => {
        if (!winnerId || updating) return;
        
        // Check if tournament is in-progress
        if (tournament.status !== 'in-progress') {
            setError('Cannot update match: Tournament is not in progress');
            return;
        }
        
        setUpdating(true);
        try {
            console.log(`Updating match: Round ${roundIndex}, Match ${matchIndex}, Winner ID: ${winnerId}`);
            
            const response = await axios.post(
                `http://localhost:5001/tournament/${id}/update-match`, 
                {
                    roundIndex,
                    matchIndex,
                    winnerId,
                    score1,
                    score2
                },
                { withCredentials: true }
            );
            
            console.log('Match updated response:', response.data);
            
            // Update the local state with the new bracket data
            setTournament({
                ...tournament,
                bracket: response.data.bracket,
                status: response.data.status
            });
            
            // If tournament is completed, show notification and redirect to past tournaments after a delay
            if (response.data.status === 'completed') {
                setError(null); // Clear any existing errors
                const completionMessage = document.createElement('div');
                completionMessage.className = 'tournament-completion-notification';
                completionMessage.innerHTML = `
                    <div class="notification-content">
                        <h3>Tournament Completed!</h3>
                        <p>The tournament has been completed and moved to past tournaments.</p>
                        <p>Redirecting in 3 seconds...</p>
                    </div>
                `;
                document.body.appendChild(completionMessage);
                
                setTimeout(() => {
                    document.body.removeChild(completionMessage);
                    navigate('/past-tournaments');
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating match:', error);
            let errorMessage = 'Failed to update match winner';
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage += `: ${error.response.data.message || error.response.statusText}`;
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage += ': No response received from server';
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage += `: ${error.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    const getBracketSizeClass = (bracket) => {
        // Just return an empty string for now to avoid any issues
        return '';
    };

    if (error) {
        return (
            <div className="text-center bg-gray-900 p-8 rounded-lg shadow-xl">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={() => {
                        setError(null);
                        fetchBracketData();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (loading || !tournament) {
        return <div className="text-center text-white">Loading bracket...</div>;
    }

    // If the tournament hasn't begun, display the list of players
    if (tournament.status === 'open') {
        return (
            <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
                <h2 className="text-center text-2xl text-white font-bold mb-8">Players Registered for {tournament.name}</h2>
                <ul className="text-white text-lg">
                    {tournament.players.map((player) => (
                        <li key={player._id} className="mb-2 p-2 border-b border-gray-700">
                            <Link to={`/profile/${player._id}`} className="hover:text-gold-400 transition">
                                {player.username}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // If tournament is completed, show the winner and the bracket
    if (tournament.status === 'completed') {
        // Find the winner (the winner of the last match in the last round)
        const lastRound = tournament.bracket[tournament.bracket.length - 1];
        const finalMatch = lastRound[0];
        const winnerId = finalMatch.winner;
        
        // Find the winner object
        const winnerPlayer = finalMatch.player1 && isSameId(winnerId, finalMatch.player1._id)
            ? finalMatch.player1 
            : finalMatch.player2;
        
        return (
            <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
                <h2 className="text-center text-2xl text-white font-bold mb-4">Tournament Completed</h2>
                <div className="winner-announcement text-center p-6 bg-gold-500 text-gray-900 rounded-lg mb-8">
                    <h3 className="text-3xl font-bold mb-2">Winner</h3>
                    <p className="text-2xl">
                        {winnerPlayer ? winnerPlayer.username : "Unknown"}
                    </p>
                </div>
                
                {/* Display the bracket for completed tournament */}
                <div className={`tournament-bracket ${getBracketSizeClass(tournament.bracket)}`}>
                    {tournament.bracket.map((round, roundIndex) => (
                        <div key={roundIndex} className="round">
                            <h3 className="round-title">
                                {roundIndex === tournament.bracket.length - 1 
                                    ? "Final" 
                                    : roundIndex === tournament.bracket.length - 2 
                                        ? "Semi-Finals" 
                                        : `Round ${roundIndex + 1}`}
                            </h3>
                            <div className="matches">
                                {round.map((match, matchIndex) => (
                                    <div 
                                        key={matchIndex} 
                                        className={`match ${match.winner ? 'match-complete' : 'match-pending'}`}
                                    >
                                        <div className="match-players">
                                            <div 
                                                className={`player ${match.player1 && match.winner && 
                                                    isSameId(match.winner, match.player1._id) ? 'winner' : ''}`}
                                            >
                                                {match.player1 ? match.player1.username : "TBD"}
                                            </div>
                                            <div className="vs">vs</div>
                                            <div 
                                                className={`player ${match.player2 && match.winner && 
                                                    isSameId(match.winner, match.player2._id) ? 'winner' : ''}`}
                                            >
                                                {match.player2 ? match.player2.username : "TBD"}
                                            </div>
                                        </div>
                                        
                                        {/* If winner is selected, show who won */}
                                        {match.winner && (
                                            <div className="winner-display">
                                                Winner: {match.player1 && isSameId(match.winner, match.player1._id)
                                                    ? match.player1.username 
                                                    : match.player2 && isSameId(match.winner, match.player2._id)
                                                    ? match.player2.username
                                                    : "Unknown"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-8">
                    <Link to="/past-tournaments" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Back to Past Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    const handleScoreChange = (roundIndex, matchIndex, player, score) => {
        console.log(tournament)
        setMatchScores(prevScores => ({
            ...prevScores,
            [`${roundIndex}-${matchIndex}`]: {
                ...prevScores[`${roundIndex}-${matchIndex}`],
                [player]: score
            }
        }));
    };

    // Check if both fields are at max
    const checkSubmitButtonVisibility = (roundIndex, matchIndex) => {
        const match = matchScores[`${roundIndex}-${matchIndex}`] || {};
        return match.player1 === tournament.scoring || match.player2 === tournament.scoring;
    };

    // If the tournament is in-progress, display the bracket
    return (
        <div className="bracket-container bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-2xl text-white font-bold mb-8">Bracket for {tournament.name}</h2>
            
            {updating && (
                <div className="text-center text-green-400 mb-4">
                    Updating bracket...
                </div>
            )}
            
            {!currentUser && (
                <div className="text-center text-yellow-400 mb-4">
                    You must be signed in as a tournament official to update match results.
                </div>
            )}

            {currentUser && !tournament.officials.some(official => (official._id === currentUser._id)) && (
                <div className="text-center text-yellow-400 mb-4">
                    Only tournament officials can update match results.
                </div>
            )}
            
            <div className={`tournament-bracket ${getBracketSizeClass(tournament.bracket)}`}>
                {tournament.bracket.map((round, roundIndex) => (
                    <div key={roundIndex} className="round">
                        <h3 className="round-title">
                            {roundIndex === tournament.bracket.length - 1 
                                ? "Final" 
                                : roundIndex === tournament.bracket.length - 2 
                                    ? "Semi-Finals" 
                                    : `Round ${roundIndex + 1}`}
                        </h3>
                        <div className="matches">
                            {round.map((match, matchIndex) => (
                                <div 
                                    key={matchIndex} 
                                    className={`match ${match.winner ? 'match-complete' : 'match-pending'}`}
                                >
                                    <div className="match-players">
                                        <div 
                                            className={`player ${match.player1 && match.winner && 
                                                isSameId(match.winner, match.player1._id) ? 'winner' : ''}`}
                                        >
                                            {match.player1 ? match.player1.username : "TBD"}
                                        </div>
                                        <div className="vs">vs</div>
                                        <div 
                                            className={`player ${match.player2 && match.winner && 
                                                isSameId(match.winner, match.player2._id) ? 'winner' : ''}`}
                                        >
                                            {match.player2 ? match.player2.username : "TBD"}
                                        </div>
                                    </div>
                                    
                                    {/* Only show select if both players are assigned, no winner yet, and user is a tournament official */}
                                    {/*{console.log(match.player1, match.player2, !match.winner, )}*/}
                                    {match.player1 && match.player2 && !match.winner &&
                                     currentUser && tournament.officials.some(official => (official._id === currentUser._id)) && (
                                            <form>
                                                <label htmlFor={`player1-${roundIndex}-${matchIndex}`}>{match.player1.username}&#39;s Score</label>
                                                <input
                                                    type="number"
                                                    id={`player1-${roundIndex}-${matchIndex}`}
                                                    value={matchScores[`${roundIndex}-${matchIndex}`]?.player1 || 0}
                                                    onChange={(e) =>
                                                        handleScoreChange(roundIndex, matchIndex, 'player1', parseInt(e.target.value))
                                                    }
                                                    min="0"
                                                    max={tournament.scoring}
                                                />
                                                <br /><br />

                                                <label htmlFor={`player2-${roundIndex}-${matchIndex}`}>{match.player2.username}&#39;s Score</label>
                                                <input
                                                    type="number"
                                                    id={`player2-${roundIndex}-${matchIndex}`}
                                                    value={matchScores[`${roundIndex}-${matchIndex}`]?.player2 || 0}
                                                    onChange={(e) =>
                                                        handleScoreChange(roundIndex, matchIndex, 'player2', parseInt(e.target.value))
                                                    }
                                                    min="0"
                                                    max={tournament.scoring}
                                                />
                                                <br /><br />

                                                {/* Submit button */}
                                                {checkSubmitButtonVisibility(roundIndex, matchIndex) && (
                                                    <button type="button" className="w-full bg-amber-600 text-white py-2 px-4 rounded-full hover:bg-amber-500 transition-all duration-200"
                                                            onClick={() => {handleWinnerSelection(
                                                                roundIndex,
                                                                matchIndex,
                                                                matchScores[`${roundIndex}-${matchIndex}`].player1 >= matchScores[`${roundIndex}-${matchIndex}`].player2 ? match.player1._id : match.player2._id,
                                                                matchScores[`${roundIndex}-${matchIndex}`].player1,
                                                                matchScores[`${roundIndex}-${matchIndex}`].player2)}}>Confirm Results</button>)
                                                }
                                            </form>
                                    )}
                                    
                                    {/* If winner is selected, show who won */}
                                    {match.winner && (
                                        <div className="winner-display">
                                            Winner: {match.player1 && isSameId(match.winner, match.player1._id)
                                                ? match.player1.username 
                                                : match.player2 && isSameId(match.winner, match.player2._id)
                                                ? match.player2.username
                                                : "Unknown"}
                                        </div>
                                    )}
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
