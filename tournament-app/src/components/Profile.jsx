import React from 'react';

const DisplayProfile = ({user}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Player Stats</h2>
            <div>
                <div key={user._id} className="border p-4 mb-4">
                    <h3 className="font-semibold">{user.username}</h3>
                    <p>Wins: {user.wins}</p>
                    <p>Losses: {user.losses}</p>
                </div>
            </div>
        </div>
    );
}

export default DisplayProfile;