import React, { useEffect, useState } from 'react';

function App() {
    const [form, setForm] = useState({
        id: null,
        topic: '',
        date: '',
        duration: '',
        invited_students: '',
        accepted_invitations: '',
        meeting_type: ''
    });

    const handleFormEdit = (meeting) => {
        setForm(meeting);
    };

    return (
        <div>
            <h1>Meeting Management App</h1>
            <MeetingManager form={form} setForm={setForm} />
            <MeetingTable onEdit={handleFormEdit} />
            <MeetingReport />
        </div>
    );
}

function MeetingManager({ form, setForm }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/meetings/${form.id}` : '/meetings';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save meeting.");
                return res.json();
            })
            .then(() => {
                window.location.reload(); // Reload page to reflect changes
                setForm({
                    id: null,
                    topic: '',
                    date: '',
                    duration: '',
                    invited_students: '',
                    accepted_invitations: '',
                    meeting_type: ''
                });
            })
            .catch(error => alert("Error: " + error.message));
    };

    return (
        <div>
            <h2>Create or Update a Meeting</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="topic" value={form.topic} onChange={handleInputChange} placeholder="Meeting Topic" required />
                <input type="date" name="date" value={form.date} onChange={handleInputChange} required />
                <input type="number" name="duration" value={form.duration} onChange={handleInputChange} placeholder="Duration (minutes)" required />
                <input type="number" name="invited_students" value={form.invited_students} onChange={handleInputChange} placeholder="Invited Students" required />
                <input type="number" name="accepted_invitations" value={form.accepted_invitations} onChange={handleInputChange} placeholder="Accepted Invitations" required />
                <input type="text" name="meeting_type" value={form.meeting_type} onChange={handleInputChange} placeholder="Meeting Type" required />
                <button type="submit">{form.id ? 'Update' : 'Add'} Meeting</button>
            </form>
        </div>
    );
}

function MeetingTable({ onEdit }) {
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [filters, setFilters] = useState({
        topic: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetch('/meetings')
            .then(res => res.json())
            .then(data => {
                setMeetings(data);
                setFilteredMeetings(data); // Initialize filtered list
            })
            .catch(error => console.error("Error fetching meetings:", error));
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const applyFilters = () => {
        let filtered = meetings;

        if (filters.topic) {
            filtered = filtered.filter(meeting =>
                meeting.topic.toLowerCase().includes(filters.topic.toLowerCase())
            );
        }

        if (filters.startDate) {
            filtered = filtered.filter(meeting => meeting.date >= filters.startDate);
        }

        if (filters.endDate) {
            filtered = filtered.filter(meeting => meeting.date <= filters.endDate);
        }

        setFilteredMeetings(filtered);
    };

    const handleDelete = (id) => {
        fetch(`/meetings/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete meeting.");
                setMeetings(meetings.filter(meeting => meeting.id !== id));
                setFilteredMeetings(filteredMeetings.filter(meeting => meeting.id !== id));
            })
            .catch(error => alert("Error: " + error.message));
    };

    return (
        <div>
            <h2>View Current Meetings</h2>
            <div>
                <input
                    type="text"
                    name="topic"
                    value={filters.topic}
                    onChange={handleFilterChange}
                    placeholder="Filter by Topic"
                />
                <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    placeholder="End Date"
                />
                <button onClick={applyFilters}>Apply Filters</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Topic</th>
                        <th>Meeting Type</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Invited Students</th>
                        <th>Accepted Invitations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMeetings.map(meeting => (
                        <tr key={meeting.id}>
                            <td>{meeting.topic}</td>
                            <td>{meeting.meeting_type}</td>
                            <td>{meeting.date}</td>
                            <td>{meeting.duration}</td>
                            <td>{meeting.invited_students}</td>
                            <td>{meeting.accepted_invitations}</td>
                            <td>
                                <button onClick={() => onEdit(meeting)}>Edit</button>
                                <button onClick={() => handleDelete(meeting.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MeetingReport() {
    const [reportData, setReportData] = useState(null);
    const [date, setDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`/meetings/report?date=${date}`)
            .then(res => res.json())
            .then(data => setReportData(data.report[0] || null))
            .catch(error => alert("Error generating report: " + error.message));
    };

    return (
        <div>
            <h2>Generate Meeting Report</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Filter by Date"
                />
                <button type="submit">Generate Report</button>
            </form>
            {reportData ? (
                <div>
                    <h3>Report Results</h3>
                    <p><strong>Average Duration:</strong> {reportData.average_duration} minutes</p>
                    <p><strong>Average Invited Students:</strong> {reportData.average_invited_students}</p>
                    <p><strong>Average Accepted Invitations:</strong> {reportData.average_accepted_invitations}</p>
                    <p><strong>Attendance Rate:</strong> {reportData.average_attendance_rate}%</p>
                </div>
            ) : (
                <p>No report data available for the selected date.</p>
            )}
        </div>
    );
}

export default App;
