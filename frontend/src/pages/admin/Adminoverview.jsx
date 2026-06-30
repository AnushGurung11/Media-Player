import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

// Single stat card
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Subtle glow accent */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full
                       blur-2xl opacity-30 ${accent}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="font-['Syne'] text-3xl font-extrabold text-[#F0EEFF]">
          {value}
        </p>
        <p className="text-sm text-[#6B6B8A] mt-1">{label}</p>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-8 py-10">

        <h1 className="font-['Syne'] text-3xl font-bold text-[#F0EEFF] mb-1">
          Overview
        </h1>
        <p className="text-[#6B6B8A] mb-8">
          A snapshot of your platform right now.
        </p>

        {loading && (
          <p className="text-violet-400 animate-pulse">Loading stats…</p>
        )}

        {error && <div className="error-banner">{error}</div>}

        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard
                label="Total Songs"
                value={stats.totalSongs}
                icon="♪"
                accent="bg-violet-500"
              />
              <StatCard
                label="Total Playlists"
                value={stats.totalPlaylists}
                icon="♫"
                accent="bg-fuchsia-500"
              />
              <StatCard
                label="Registered Users"
                value={stats.totalUsers}
                icon="◎"
                accent="bg-blue-500"
              />
              <StatCard
                label="Active Now"
                value={stats.activeUsers}
                icon="●"
                accent="bg-emerald-500"
              />
            </div>

            {/* Quick info panel */}
            <div className="card p-6">
              <h2 className="font-['Syne'] text-lg font-bold text-[#F0EEFF] mb-4">
                Platform Health
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between
                                py-2 border-b border-violet-900/10">
                  <span className="text-[#6B6B8A]">Active users right now</span>
                  <span className="text-[#F0EEFF] font-semibold">
                    {stats.activeUsers} / {stats.totalUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between
                                py-2 border-b border-violet-900/10">
                  <span className="text-[#6B6B8A]">Avg. songs per playlist</span>
                  <span className="text-[#F0EEFF] font-semibold">
                    {stats.totalPlaylists > 0
                      ? (stats.totalSongs / stats.totalPlaylists).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOverview;