import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const TournamentPlayers = ({user}) => {
    const { id } = useParams(); // Get the tournament ID from the URL
    const [tournamentData, setTournamentData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('Tournament ID is missing');
            return;
        }

        // Fetch the tournament data (either players or bracket)
        axios.get(`http://localhost:5001/tournament/${id}/bracket`)
            .then((response) => {
                setTournamentData(response.data);
            })
            .catch((error) => {
                setError('Error fetching tournament data');
                console.error(error);
            });
    }, [id]);

    const removePlayer = (playerID) => {
        axios.post(`http://localhost:5001/tournament/${id}/withdraw`, { userId: playerID}, { withCredentials: true })
            .then(() => {
                console.log('Player has been removed.');
                window.location.reload();
            })
            .catch((error) => {
                setError('Error removing player.');
                console.log(error);
            })
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!tournamentData) {
        return <div className="text-center text-white">Loading...</div>;
    }

    return (
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-2xl text-white font-bold mb-8">Players in Tournament: {tournamentData.name}</h2>
            {tournamentData.status === 'open' ? (
                <ul className="text-white text-lg">
                    {tournamentData.players.length === 0 ? (
                        <p className="text-center">No players have registered yet.</p>
                    ) : (
                        tournamentData.players.map((player) => (
                            <div key={player._id}>
                                <li className="py-2">
                                    {player.username}
                                    {/*Need to edit later for only officials for that tournament (edit bracket in server)*/}
                                    {user.role === 'tournament-official' ? (<button className="ml-4 w-full sm:w-auto bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition" onClick={()=>removePlayer(player._id)}>Reject Player</button>) : null}
                                </li>
                            </div>
                        ))
                    )}
                </ul>
            ) : (
                <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Bracket</h3>
                    {/* Render bracket here if status is "in-progress" */}
                    <p>The tournament has started. The bracket is now available.</p>
                    {/* Optionally, you could display the bracket here if needed */}
                    {/* For example: */}
                    {/* <pre>{JSON.stringify(tournamentData.bracket, null, 2)}</pre> */}
                </div>
            )}
        </div>
    );
};

export default TournamentPlayers;
