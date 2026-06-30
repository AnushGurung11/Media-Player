import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-8 py-10">

        <h1 className="font-['Syne'] text-3xl font-bold text-[#F0EEFF] mb-1">
          Users
        </h1>
        <p className="text-[#6B6B8A] mb-6">
          {users.length} registered · {activeCount} active now
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by username or email..."
          className="input-field max-w-sm mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-violet-400 animate-pulse">Loading users…</p>
        ) : (
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_120px_120px_80px]
                            gap-4 px-6 py-3 border-b border-violet-900/20
                            text-xs font-semibold uppercase tracking-wider
                            text-[#6B6B8A]">
              <span>Username</span>
              <span>Email</span>
              <span>Joined</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Rows */}
            {filteredUsers.length === 0 ? (
              <p className="text-[#6B6B8A] text-sm px-6 py-8 text-center">
                No users found.
              </p>
            ) : filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_1fr_120px_120px_80px]
                           gap-4 px-6 py-4 items-center
                           border-b border-violet-900/10 last:border-0
                           hover:bg-violet-900/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-violet-600/20
                                  border border-violet-500/30 flex items-center
                                  justify-center text-violet-300 font-semibold
                                  text-sm flex-shrink-0">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#F0EEFF] truncate">
                    {user.username}
                  </span>
                </div>

                <span className="text-sm text-[#6B6B8A] truncate">
                  {user.email}
                </span>

                <span className="text-sm text-[#6B6B8A]">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0
                                    ${user.isActive
                                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                      : "bg-[#6B6B8A]"}`} />
                  <span className={`text-xs font-medium
                                    ${user.isActive ? "text-emerald-400" : "text-[#6B6B8A]"}`}>
                    {user.isActive ? "Active" : timeAgo(user.lastLogin)}
                  </span>
                </span>

                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-xs text-rose-400 hover:text-rose-300
                             text-right transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;