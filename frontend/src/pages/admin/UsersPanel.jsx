import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import { useAdminUsers } from "../../hooks/useAdminUsers";

const VIEWS = [
  { key: "registrations", label: "New Registrations" },
  { key: "activeTime",    label: "Active Time" },
  { key: "table",         label: "Active Users Table" },
];

function UsersPanel() {
  const [view, setView] = useState("registrations");
  const { userAnalytics, loading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const { users, loading: usersLoading, error: usersError, deletingId, handleDelete } = useAdminUsers();

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div>
      <h2>Users</h2>
      <p style={{ color: "gray" }}>
        {users.length} total users · {activeCount} currently active
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: view === key ? "2px solid #333" : "1px solid #ccc",
              backgroundColor: view === key ? "#333" : "white",
              color: view === key ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "registrations" && (
        <>
          {analyticsLoading && <p>Loading chart...</p>}
          {analyticsError && <p style={{ color: "red" }}>{analyticsError}</p>}
          {userAnalytics && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userAnalytics.registrationsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} name="New users" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p style={{ color: "gray", fontSize: "0.85em" }}>Last 30 days.</p>
        </>
      )}

      {view === "activeTime" && (
        <>
          {analyticsLoading && <p>Loading chart...</p>}
          {analyticsError && <p style={{ color: "red" }}>{analyticsError}</p>}
          {userAnalytics && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userAnalytics.activeByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(h) => `${h}:00`} />
                <Bar dataKey="count" fill="#16a34a" name="Users last active" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p style={{ color: "gray", fontSize: "0.85em" }}>
            Based on each user's most recent login hour — an approximation of
            peak activity, not a full session log.
          </p>
        </>
      )}

      {view === "table" && (
        <>
          {usersLoading && <p>Loading users...</p>}
          {usersError && <p style={{ color: "red" }}>{usersError}</p>}
          {!usersLoading && users.length > 0 && (
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                    <td>{new Date(u.lastLogin).toLocaleString()}</td>
                    <td style={{ color: u.isActive ? "green" : "gray" }}>
                      {u.isActive ? "● Active" : "○ Offline"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deletingId === u.id}
                        style={{ color: "red" }}
                      >
                        {deletingId === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default UsersPanel;