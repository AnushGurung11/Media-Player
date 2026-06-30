import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

function AdminManage() {
  const [songForm, setSongForm] = useState({
    title: "", artist: "", album: "",
    duration: "", url: "", coverArt: "", genre: ""
  });
  const [playlistForm, setPlaylistForm] = useState({ name: "" });

  const [songs, setSongs]         = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [songMsg, setSongMsg]         = useState("");
  const [playlistMsg, setPlaylistMsg] = useState("");
  const [activeTab, setActiveTab]     = useState("songs");
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    fetchSongs();
    fetchPlaylists();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await api.get("/songs");
      setSongs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await api.get("/playlists");
      setPlaylists(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/songs", { ...songForm, duration: Number(songForm.duration) });
      setSongMsg("✅ Song added successfully!");
      setSongForm({ title: "", artist: "", album: "", duration: "", url: "", coverArt: "", genre: "" });
      fetchSongs();
    } catch (err) {
      setSongMsg("❌ " + (err.response?.data?.message || "Failed to add song"));
    } finally {
      setLoading(false);
      setTimeout(() => setSongMsg(""), 3000);
    }
  };

  const handleDeleteSong = async (id) => {
    if (!window.confirm("Delete this song?")) return;
    try { await api.delete(`/songs/${id}`); fetchSongs(); }
    catch (err) { console.error(err); }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/playlists", playlistForm);
      setPlaylistMsg("✅ Playlist created!");
      setPlaylistForm({ name: "" });
      fetchPlaylists();
    } catch (err) {
      setPlaylistMsg("❌ " + (err.response?.data?.message || "Failed to create playlist"));
    } finally {
      setLoading(false);
      setTimeout(() => setPlaylistMsg(""), 3000);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm("Delete this playlist?")) return;
    try { await api.delete(`/playlists/${id}`); fetchPlaylists(); }
    catch (err) { console.error(err); }
  };

  const songFields = [
    { name: "title",    placeholder: "Song title",          required: true  },
    { name: "artist",   placeholder: "Artist name",         required: true  },
    { name: "url",      placeholder: "Audio URL (.mp3)",    required: true  },
    { name: "coverArt", placeholder: "Cover art image URL", required: false },
    { name: "album",    placeholder: "Album name",          required: false },
    { name: "genre",    placeholder: "Genre",                required: false },
    { name: "duration", placeholder: "Duration in seconds",  required: false },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-8 py-10">

        <h1 className="font-['Syne'] text-3xl font-bold text-[#F0EEFF] mb-1">
          Manage Content
        </h1>
        <p className="text-[#6B6B8A] mb-8">
          Add songs and create playlists for your listeners.
        </p>

        <div className="flex gap-2 mb-8 border-b border-violet-900/20">
          {["songs", "playlists"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize
                          transition-all duration-200 border-b-2 -mb-px
                          ${activeTab === tab
                            ? "border-violet-500 text-violet-400"
                            : "border-transparent text-[#6B6B8A] hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "songs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="font-['Syne'] text-lg font-bold text-[#F0EEFF] mb-5">
                Add New Song
              </h2>
              {songMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg mb-4
                                 ${songMsg.startsWith("✅")
                                   ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                   : "error-banner"}`}>
                  {songMsg}
                </div>
              )}
              <form onSubmit={handleAddSong} className="flex flex-col gap-3">
                {songFields.map(({ name, placeholder, required }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="input-label">{name}</label>
                    <input
                      name={name}
                      type={name === "duration" ? "number" : "text"}
                      className="input-field"
                      placeholder={placeholder}
                      value={songForm[name]}
                      onChange={(e) => setSongForm({ ...songForm, [name]: e.target.value })}
                      required={required}
                    />
                  </div>
                ))}
                <button type="submit" className="btn-primary mt-2 py-2.5 text-sm" disabled={loading}>
                  {loading ? "Adding…" : "Add Song"}
                </button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="font-['Syne'] text-lg font-bold text-[#F0EEFF] mb-5">
                All Songs ({songs.length})
              </h2>
              <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                {songs.length === 0 ? (
                  <p className="text-[#6B6B8A] text-sm">No songs yet. Add one!</p>
                ) : songs.map((song) => (
                  <div key={song._id}
                       className="flex items-center gap-3 p-3 rounded-xl
                                  bg-[#1C1C28] border border-violet-900/20
                                  hover:border-violet-500/30 transition-all">
                    <img
                      src={song.coverArt || "https://placehold.co/48x48/1C1C28/6B6B8A?text=♪"}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F0EEFF] truncate">{song.title}</p>
                      <p className="text-xs text-[#6B6B8A] truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSong(song._id)}
                      className="text-xs text-rose-400 hover:text-rose-300
                                 px-2 py-1 rounded-lg hover:bg-rose-500/10
                                 transition-all flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="font-['Syne'] text-lg font-bold text-[#F0EEFF] mb-5">
                Create Playlist
              </h2>
              {playlistMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg mb-4
                                 ${playlistMsg.startsWith("✅")
                                   ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                   : "error-banner"}`}>
                  {playlistMsg}
                </div>
              )}
              <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="input-label">Playlist Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="My awesome playlist"
                    value={playlistForm.name}
                    onChange={(e) => setPlaylistForm({ name: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary mt-2 py-2.5 text-sm" disabled={loading}>
                  {loading ? "Creating…" : "Create Playlist"}
                </button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="font-['Syne'] text-lg font-bold text-[#F0EEFF] mb-5">
                All Playlists ({playlists.length})
              </h2>
              <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                {playlists.length === 0 ? (
                  <p className="text-[#6B6B8A] text-sm">No playlists yet. Create one!</p>
                ) : playlists.map((playlist) => (
                  <div key={playlist._id}
                       className="flex items-center gap-3 p-3 rounded-xl
                                  bg-[#1C1C28] border border-violet-900/20
                                  hover:border-violet-500/30 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-violet-600/20
                                    border border-violet-500/20 flex items-center
                                    justify-center flex-shrink-0">
                      <span className="text-violet-400 text-xl">♫</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F0EEFF] truncate">{playlist.name}</p>
                      <p className="text-xs text-[#6B6B8A]">{playlist.songs?.length || 0} songs</p>
                    </div>
                    <button
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="text-xs text-rose-400 hover:text-rose-300
                                 px-2 py-1 rounded-lg hover:bg-rose-500/10
                                 transition-all flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminManage;