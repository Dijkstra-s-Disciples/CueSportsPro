import React from 'react'
import axios from "axios";

const TournamentCreationForm = () => {
    const formRef = React.useRef(null);
    const submitNewTournament = (event) => {
        event.preventDefault();
        const formData = new FormData(formRef.current);
        axios.post('http://localhost:5001/tournaments', {name: formData.get("name"), date: formData.get("date"), time: formData.get("time"), format: formData.get("format")})
            .then((response) => {console.log(response.data); window.location.href="/";})
            .catch((error) => console.log('Error posting new tournament:', error));
        //formRef.current.reset();
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
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        name="date"
                    />
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                        name="time"
                        placeholder="Start Time (example: 12:30 pm, 1:30 AM, 02:30 PM)"
                        pattern="(1[0-2]|0?[0-9]):(0[0-9]|[1-5][0-9]|60)\s([aApP][mM])"
                    />
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