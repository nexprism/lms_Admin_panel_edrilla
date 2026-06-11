import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
    fetchMeetings,
    createMeeting,
    deleteMeeting,
    clearZoomError,
    fetchMeetingParticipants,
    fetchReports,
} from "../../store/slices/zoomSlice";
import { fetchCourses, getAllCourses } from "../../store/slices/course";
import {
    Video,
    Plus,
    Trash2,
    Calendar,
    Clock,
    ChevronRight,
    Users,
    Activity,
    ClipboardList,
    Download,
    Search,
} from "lucide-react";

const formatDuration = (seconds: number) => {
    if (!seconds) return "0m";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatTime = (iso: string) =>
    iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const ZoomMeetings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { meetings, reports, participants, loading, error } = useSelector(
        (state: RootState) => state.zoom
    );
    const courses = useSelector(getAllCourses);

    const [activeTab, setActiveTab] = useState<"upcoming" | "reports">("upcoming");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
    const [selectedMeetingTopic, setSelectedMeetingTopic] = useState<string>("");
    const [participantSearch, setParticipantSearch] = useState("");

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
    const [dateTo, setDateTo] = useState(today);

    const [formData, setFormData] = useState({
        topic: "",
        start_time: "",
        duration: 60,
        agenda: "",
        timezone: "Asia/Kolkata",
        courseId: "",
    });

    useEffect(() => {
        dispatch(fetchCourses({ page: 1, limit: 100 }));
        if (activeTab === "upcoming") {
            dispatch(fetchMeetings());
        } else {
            dispatch(fetchReports({ from: dateFrom, to: dateTo }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing intentional dependency set; preserved to avoid behavior change
    }, [dispatch, activeTab]);

    const handleFetchReports = () => {
        dispatch(fetchReports({ from: dateFrom, to: dateTo }));
    };

    const exportParticipantsCSV = () => {
        const filtered = participants.filter((p: any) =>
            !participantSearch ||
            p.name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
            p.user_email?.toLowerCase().includes(participantSearch.toLowerCase())
        );
        const header = "Name,Email,Join Time,Leave Time,Duration\n";
        const rows = filtered
            .map((p: any) =>
                `"${p.name || ""}","${p.user_email || ""}","${p.join_time || ""}","${p.leave_time || ""}","${formatDuration(p.duration)}"`
            )
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participants_${selectedMeetingId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this meeting?")) {
            dispatch(deleteMeeting(id));
        }
    };

    const handleViewParticipants = (id: string, topic: string, uuid: string) => {
        setSelectedMeetingId(id);
        setSelectedMeetingTopic(topic);
        setParticipantSearch("");
        // Pass the UUID so backend can fetch all past participants correctly
        dispatch(fetchMeetingParticipants({ id, uuid }));
        setIsParticipantsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            start_time: new Date(formData.start_time).toISOString(),
        };
        const result = await dispatch(createMeeting(payload));
        if (createMeeting.fulfilled.match(result)) {
            setIsModalOpen(false);
            setFormData({
                topic: "",
                start_time: "",
                duration: 60,
                agenda: "",
                timezone: "Asia/Kolkata",
                courseId: "",
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Video className="text-brand-500" />
                        Live Classes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your Zoom meetings and analyze past performance
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 font-medium whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Schedule Meeting
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "upcoming"
                        ? "bg-white dark:bg-gray-700 text-brand-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    <Activity size={18} />
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "reports"
                        ? "bg-white dark:bg-gray-700 text-brand-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    <ClipboardList size={18} />
                    Past Meetings
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => dispatch(clearZoomError())} className="text-xl">
                        &times;
                    </button>
                </div>
            )}

            {activeTab === "upcoming" ? (
                <>
                    {loading && meetings.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Video className="text-gray-400 mx-auto mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No upcoming meetings</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule your first meeting to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meetings.map((meeting: any) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => handleDelete(meeting.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-xl">
                                            <Video className="text-brand-500" size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate pr-16">{meeting.topic}</h3>
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar size={14} />
                                                    {new Date(meeting.start_time).toLocaleDateString("en-IN", {
                                                        weekday: "short",
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Clock size={14} />
                                                    {new Date(meeting.start_time).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })} ({meeting.duration}m)
                                                </div>
                                                {meeting.courseId && (
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-500">
                                                        <Activity size={14} />
                                                        Course Linked
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">ID: {meeting.id}</span>
                                        <a
                                            href={meeting.join_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-brand-500 hover:text-brand-600 font-semibold text-sm group/link"
                                        >
                                            Join Now
                                            <ChevronRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                    {/* Date Range Filter */}
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">From:</label>
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 border-none outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">To:</label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom}
                                max={today}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 border-none outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>
                        <button
                            onClick={handleFetchReports}
                            disabled={loading}
                            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Apply"}
                        </button>
                        <span className="text-xs text-gray-400 ml-auto">{reports.length} meeting(s) found</span>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">Topic</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">Duration</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700 text-center">Participants</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No past meetings found for the selected date range.</td>
                                        </tr>
                                    ) : (
                                        reports.map((meeting: any) => (
                                            <tr key={meeting.uuid || meeting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{meeting.topic}</div>
                                                    <div className="text-xs text-gray-400">ID: {meeting.id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {new Date(meeting.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {meeting.duration} mins
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-xs font-bold rounded-full">
                                                        {meeting.participants_count ?? meeting.total_participants ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewParticipants(meeting.id, meeting.topic, meeting.uuid)}
                                                        className="inline-flex items-center gap-1.5 text-brand-500 hover:text-brand-600 font-bold text-sm"
                                                    >
                                                        <Users size={16} />
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Participants Modal */}
            {isParticipantsModalOpen && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/20">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="text-brand-500" />
                                    {selectedMeetingTopic || "Meeting"} — Participants
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Meeting ID: {selectedMeetingId}
                                    {!loading && (
                                        <span className="ml-3 px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-xs font-bold rounded-full">
                                            {participants.length} total
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button onClick={() => setIsParticipantsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        {/* Search + Export */}
                        {!loading && participants.length > 0 && (
                            <div className="px-6 pt-4 flex gap-3">
                                <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-2">
                                    <Search size={16} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={participantSearch}
                                        onChange={(e) => setParticipantSearch(e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                                <button
                                    onClick={exportParticipantsCSV}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                >
                                    <Download size={16} />
                                    Export CSV
                                </button>
                            </div>
                        )}

                        {/* Table */}
                        <div className="p-6 max-h-[55vh] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">Fetching all participants... this may take a moment.</div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No participant data available for this meeting.</div>
                            ) : (() => {
                                const filtered = participants.filter((p: any) =>
                                    !participantSearch ||
                                    p.name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                                    p.user_email?.toLowerCase().includes(participantSearch.toLowerCase())
                                );
                                return (
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400">#</th>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400">Name</th>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400">Email</th>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400">Join</th>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400">Leave</th>
                                                <th className="px-4 py-3 text-xs font-bold uppercase text-gray-400 text-right">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {filtered.map((p: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.name || "Anonymous"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{p.user_email || "—"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatTime(p.join_time)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatTime(p.leave_time)}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-brand-600 text-right">{formatDuration(p.duration)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            })()}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-right">
                            <button
                                onClick={() => setIsParticipantsModalOpen(false)}
                                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Live Class</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Topic</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Weekly Mentorship"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white outline-none"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white outline-none"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (mins)</label>
                                    <input
                                        required
                                        type="number"
                                        min="15"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white outline-none"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Linked Course (Optional)</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white outline-none"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                >
                                    <option value="">No course (All students see this)</option>
                                    {courses.map((course: any) => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1">If selected, only enrolled students will see this meeting.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Agenda</label>
                                <textarea
                                    rows={3}
                                    placeholder="What will be discussed?"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white outline-none resize-none"
                                    value={formData.agenda}
                                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50"
                                >
                                    {loading ? "Scheduling..." : "Create Meeting"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZoomMeetings;
