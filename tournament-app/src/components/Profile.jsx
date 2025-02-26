import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import axios from "axios";

const DisplayProfile = () => {
    const { userID } = useParams();
    console.log(userID);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Fetch the tournament data when the component mounts
    useEffect(() => {
        if (!userID) {
            setError('User ID is missing');
            return;
        }

        axios.get(`http://localhost:5001/member/${userID}`)
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    if (error || !user) {
        return <div className="text-center text-red-500">{error}</div>;
    }

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