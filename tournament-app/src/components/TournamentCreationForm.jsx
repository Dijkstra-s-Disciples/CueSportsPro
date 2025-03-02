import React, {useState} from 'react'
import axios from "axios";

const TournamentCreationForm = ({ official }) => {
    const [tournament, setTournament] = useState()

    const formRef = React.useRef(null);
    const submitNewTournament = (event) => {
        event.preventDefault();
        const formData = new FormData(formRef.current);
        axios.post('http://localhost:5001/tournaments', {name: formData.get("name"), date: formData.get("date"), time: formData.get("time"), ruleset: formData.get("rule-set"), format: formData.get("format")})
            .then((response) => {
                axios.post(`http://localhost:5001/tournament/${response.data.tournament._id}/officiate`, {userId: official._id}, { withCredentials: true })
                    .then(() => {window.location.href="/"})
                    .catch((error) => console.log('Error officiating new tournament:', error));
            })
            .catch((error) => console.log('Error posting new tournament:', error));
    }

    return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-center mb-4 text-gold-400">➕ Create New Tournament</h2>
                <form className="space-y-4" ref={formRef} onSubmit={(event) => submitNewTournament(event)}>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        placeholder="Tournament Name"
                        name="name"
                    />
                    <input
                        type="date"
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md
                        [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-200 [&::-webkit-calendar-picker-indicator]:hue-rotate-180"
                        name="date"
                    />
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        name="time"
                        placeholder="Start Time (example: 12:30 pm, 1:30 am, 02:30 pm)"
                        pattern="(1[0-2]|0?[0-9]):(0[0-9]|[1-5][0-9]|60)\s([aApP][mM])"
                    />
                    <select
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        name="rule-set"
                    >
                        <option value="Singles 8-Ball">Singles 8-Ball</option>
                        <option value="Singles 9-Ball">Singles 9-Ball</option>
                        <option value="Singles 10-Ball">Singles 10-Ball</option>
                        <option value="Doubles 8-Ball">Doubles 8-Ball</option>
                        <option value="Doubles 9-Ball">Doubles 9-Ball</option>
                        <option value="Doubles 10-Ball">Doubles 10-Ball</option>
                    </select>
                    <select
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        name="format"
                    >
                        <option value="single elimination">Single Elimination</option>
                        <option value="round robin">Round Robin</option>
                    </select>
                    <button type="submit" className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition">
                        Create Tournament
                    </button>
                </form>
            </div>
    );

};

export default TournamentCreationForm;