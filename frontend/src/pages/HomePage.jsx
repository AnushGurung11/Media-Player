import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

// ── Song Card ────────────────────────────────────────────
function SongCard({ song, onPlay }) {
  return (
    <div className="group card p-4 flex items-center gap-4
                    hover:border-violet-500/40 hover:bg-[#1C1C28]
                    transition-all duration-200 cursor-pointer"
         onClick={() => onPlay(song)}>
      <img
        src={song.coverArt || "https://placehold.co/56x56/1C1C28/6B6B8A?text=♪"}
        alt={song.title}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0
                   group-hover:shadow-[0_0_16px_rgba(124,58,237,0.4)]
                   transition-all duration-200"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#F0EEFF] truncate">{song.title}</p>
        <p className="text-sm text-[#6B6B8A] truncate">{song.artist}</p>
        {song.genre && (
          <span className="text-xs text-violet-400 bg-violet-500/10
                           px-2 py-0.5 rounded-full mt-1 inline-block">
            {song.genre}
          </span>
        )}
      </div>
      {/* Play button — shows on hover */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-600
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      shadow-[0_0_16px_rgba(124,58,237,0.5)]
                      transition-all duration-200 translate-x-2
                      group-hover:translate-x-0">
        <span className="text-white text-sm ml-0.5">▶</span>
      </div>
    </div>
  );
}

// ── Playlist Card ────────────────────────────────────────
function PlaylistCard({ playlist }) {
  const covers = playlist.songs?.slice(0, 4) || [];

  return (
    <div className="group card p-4 hover:border-violet-500/40
                    hover:bg-[#1C1C28] transition-all duration-200
                    cursor-pointer">
      {/* 2x2 cover grid or single cover */}
      <div className="w-full aspect-square rounded-xl overflow-hidden
                      mb-4 bg-[#1C1C28] relative">
        {covers.length >= 4 ? (
          <div className="grid grid-cols-2 w-full h-full">
            {covers.map((song, i) => (
              <img
                key={i}
                src={song.coverArt || `https://placehold.co/100x100/1C1C28/6B6B8A?text=♪`}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          bg-gradient-to-br from-violet-900/40 to-[#1C1C28]">
            <span className="text-violet-400 text-5xl">♫</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0
                        group-hover:opacity-100 transition-all duration-200
                        flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-violet-600
                          flex items-center justify-center
                          shadow-[0_0_20px_rgba(124,58,237,0.6)]">
            <span className="text-white ml-1">▶</span>
          </div>
        </div>
      </div>

      <p className="font-['Syne'] font-bold text-[#F0EEFF] truncate">
        {playlist.name}
      </p>
      <p className="text-sm text-[#6B6B8A] mt-0.5">
        {playlist.songs?.length || 0} songs
      </p>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="font-['Syne'] text-2xl font-bold text-[#F0EEFF]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-[#6B6B8A] mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

// ── Mini Player ──────────────────────────────────────────
function MiniPlayer({ song, onClose }) {
  if (!song) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50
                    bg-[#12121A]/95 backdrop-blur-xl
                    border-t border-violet-900/30
                    px-6 py-3 flex items-center gap-4">
      <img
        src={song.coverArt || "https://placehold.co/48x48/1C1C28/6B6B8A?text=♪"}
        alt={song.title}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#F0EEFF] text-sm truncate">{song.title}</p>
        <p className="text-xs text-[#6B6B8A] truncate">{song.artist}</p>
      </div>
      {song.url && (
        <audio controls autoPlay src={song.url}
               className="h-8 opacity-80 flex-shrink-0
                          [&::-webkit-media-controls-panel]:bg-[#1C1C28]" />
      )}
      <button
        onClick={onClose}
        className="text-[#6B6B8A] hover:text-white text-lg
                   flex-shrink-0 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// ── HomePage ─────────────────────────────────────────────
function HomePage() {
  const [songs,        setSongs]        = useState([]);
  const [playlists,    setPlaylists]    = useState([]);
  const [currentSong,  setCurrentSong]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, playlistsRes] = await Promise.all([
          api.get("/songs"),
          api.get("/playlists"),
        ]);
        setSongs(songsRes.data);
        setPlaylists(playlistsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-violet-400 text-lg animate-pulse">
            Loading your music…
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0A0A0F] pt-14 pb-16 px-6">
        <div className="absolute top-[-100px] left-1/3 w-[500px] h-[500px]
                        rounded-full pointer-events-none
                        bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.2)_0%,transparent_65%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-violet-400 text-sm font-semibold tracking-widest
                        uppercase mb-3">
            Now playing
          </p>
          <h1 className="font-['Syne'] text-5xl font-extrabold text-[#F0EEFF]
                         tracking-tight leading-tight mb-4">
            Your music,<br />your vibe.
          </h1>
          <p className="text-[#6B6B8A] text-lg max-w-md">
            Discover songs and playlists curated just for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-32">

        {/* ── Playlists section ── */}
        {playlists.length > 0 && (
          <section className="mb-14">
            <SectionHeader
              title="Featured Playlists"
              subtitle="Curated collections for every mood"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                            lg:grid-cols-5 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* ── Songs section ── */}
        {songs.length > 0 && (
          <section className="mb-14">
            <SectionHeader
              title="All Songs"
              subtitle={`${songs.length} tracks available`}
            />
            {/* Alternating 2-column card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {songs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onPlay={setCurrentSong}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {songs.length === 0 && playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          py-24 text-center">
            <span className="text-6xl text-violet-900/60 mb-4">♪</span>
            <p className="font-['Syne'] text-xl font-bold text-[#F0EEFF] mb-2">
              No music yet
            </p>
            <p className="text-[#6B6B8A] text-sm">
              Ask your admin to add some songs and playlists.
            </p>
          </div>
        )}
      </div>

      {/* Mini player */}
      <MiniPlayer
        song={currentSong}
        onClose={() => setCurrentSong(null)}
      />
    </Layout>
  );
}

export default HomePage;