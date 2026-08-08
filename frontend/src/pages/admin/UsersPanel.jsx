import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "../../utils/chartColors";

const VIEWS = [
  { key: "registrations", label: "New Registrations" },
  { key: "activeTime", label: "Active Time" },
  { key: "table", label: "Users Table" },
];

function UsersPanel({
  users,
  usersLoading,
  usersError,
  deletingId,
  handleDelete,
  userAnalytics,
  analyticsLoading,
  analyticsError,
}) {
  const colors = useChartColors();
  const [view, setView] = useState("registrations");

  const activeCount = users.filter((u) => u.isActive).length;

  const chartTooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-lg">Users</h2>
            <p className="text-sm text-muted">
              {usersLoading ? "Loading…" : `${users.length} total · ${activeCount} active`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={view === key ? "btn-primary !px-3 !py-1.5 text-xs" : "btn-outline !px-3 !py-1.5 text-xs"}
                aria-pressed={view === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {view === "registrations" && (
          <div>
            {analyticsLoading && <p className="text-sm text-muted">Loading chart…</p>}
            {analyticsError && <p className="text-sm text-danger">{analyticsError}</p>}
            {userAnalytics && !analyticsLoading && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userAnalytics.registrationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.text }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke={colors.primary} strokeWidth={2} name="New users" />
                </LineChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-muted mt-2">Last 30 days.</p>
          </div>
        )}

        {view === "activeTime" && (
          <div>
            {analyticsLoading && <p className="text-sm text-muted">Loading chart…</p>}
            {analyticsError && <p className="text-sm text-danger">{analyticsError}</p>}
            {userAnalytics && !analyticsLoading && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userAnalytics.activeByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 12, fill: colors.text }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.text }} />
                  <Tooltip labelFormatter={(h) => `${h}:00`} contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" fill={colors.secondary} name="Users last active" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-muted mt-2">
              Based on each user's most recent login hour — an approximation of
              peak activity, not a full session log.
            </p>
          </div>
        )}

        {view === "table" && (
          <div>
            {usersLoading && <p className="text-sm text-muted">Loading users…</p>}
            {usersError && <p className="text-sm text-danger">{usersError}</p>}
            {!usersLoading && users.length === 0 && (
              <p className="text-sm text-muted">No users yet.</p>
            )}
            {!usersLoading && users.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table-vibe min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="font-medium">{u.username}</td>
                        <td className="text-muted">{u.email}</td>
                        <td className="text-muted">{new Date(u.joinedAt).toLocaleDateString()}</td>
                        <td className="text-muted">{new Date(u.lastLogin).toLocaleString()}</td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              u.isActive ? "text-success" : "text-muted"
                            }`}
                          >
                            {u.isActive ? "● Active" : "○ Offline"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u.id}
                            className="btn-danger !px-2.5 !py-1 text-xs"
                          >
                            {deletingId === u.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPanel;
