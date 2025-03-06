import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Settings = () => {
    const { userID } = useParams(); // ✅ Uses MongoDB `_id`
    const navigate = useNavigate();
    const [user, setUser] = useState({ privacySettings: 'public', optInTournamentEmails: true, optInNotificationEmails: true });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // ✅ Fetch user settings on mount
    useEffect(() => {
        axios.get(`http://localhost:5001/member/${userID}`)
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    // ✅ Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Send updated settings to backend using `_id`
        axios.put(`http://localhost:5001/member/${userID}`, {
            privacySettings: user.privacySettings,
            optInTournamentEmails: user.optInTournamentEmails,
            optInNotificationEmails: user.optInNotificationEmails,
        })
            .then(() => {
                setMessage('Settings updated successfully!');
                setTimeout(() => navigate(`/profile/${userID}`), 1500);
            })
            .catch((error) => {
                setError('Failed to update settings');
                console.error(error);
            });
    };

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">⚙️ Edit Settings</h2>

            {message && <p className="text-green-500 text-center">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Privacy Settings */}
                <div>
                    <label className="block font-semibold mb-2">Privacy Settings:</label>
                    <div className="flex space-x-4">
                        <label className={`p-2 border-2 rounded-md cursor-pointer ${user.privacySettings === 'public' ? 'border-gold-500' : 'border-gray-600'}`}>
                            <input
                                type="radio"
                                name="privacySettings"
                                value="public"
                                checked={user.privacySettings === 'public'}
                                onChange={() => setUser({ ...user, privacySettings: 'public' })}
                                className="hidden"
                            />
                            Public
                        </label>
                        <label className={`p-2 border-2 rounded-md cursor-pointer ${user.privacySettings === 'private' ? 'border-gold-500' : 'border-gray-600'}`}>
                            <input
                                type="radio"
                                name="privacySettings"
                                value="private"
                                checked={user.privacySettings === 'private'}
                                onChange={() => setUser({ ...user, privacySettings: 'private' })}
                                className="hidden"
                            />
                            Private
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Tournament Emails */}
                    <div className="flex items-center space-x-3">
                        <label className="text-lg font-semibold text-white">Receive Tournament Emails:</label>
                        <input
                            type="checkbox"
                            checked={user.optInTournamentEmails}
                            onChange={() => setUser({ ...user, optInTournamentEmails: !user.optInTournamentEmails })}
                            className="hidden"  // Hides the actual checkbox
                        />
                        <span
                            onClick={() => setUser({ ...user, optInTournamentEmails: !user.optInTournamentEmails })}
                            className={`cursor-pointer text-sm font-medium py-1 px-3 rounded transition duration-200 
                  ${user.optInTournamentEmails ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
      {user.optInTournamentEmails ? 'Disabled' : 'Enable'}
    </span>
                    </div>

                    {/* Notification Emails */}
                    <div className="flex items-center space-x-3">
                        <label className="text-lg font-semibold text-white">Receive Notification Emails:</label>
                        <input
                            type="checkbox"
                            checked={user.optInNotificationEmails}
                            onChange={() => setUser({ ...user, optInNotificationEmails: !user.optInNotificationEmails })}
                            className="hidden"  // Hides the actual checkbox
                        />
                        <span
                            onClick={() => setUser({ ...user, optInNotificationEmails: !user.optInNotificationEmails })}
                            className={`cursor-pointer text-sm font-medium py-1 px-3 rounded transition duration-200 
                  ${user.optInNotificationEmails ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
      {user.optInNotificationEmails ? 'Disabled' : 'Enable'}
    </span>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                >
                    💾 Save Settings
                </button>
            </form>
        </div>
    );
};

export default Settings;
