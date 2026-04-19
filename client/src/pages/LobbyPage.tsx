import { UserProfile } from "../types/game";

interface LobbyPageProps {
  user: UserProfile;
  inQueue: boolean;
  connected: boolean;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onLogout: () => void;
}

export default function LobbyPage({
  user, inQueue, connected, onJoinQueue, onLeaveQueue, onLogout,
}: LobbyPageProps) {
  return (
    <div className="page-center">
      <div className="lobby-container">
        <h1 className="lobby-title">⚔️ Dungeon Architect</h1>
        <p className="lobby-subtitle">Build. Defend. Conquer.</p>

        <div className="card-panel" style={{ minWidth: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{user.username}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {user.wins}W / {user.losses}L
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: connected ? "var(--accent-green)" : "var(--accent-red)",
              }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {connected ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {!inQueue ? (
            <button
              className="btn btn-gold"
              style={{ width: "100%" }}
              onClick={onJoinQueue}
              disabled={!connected}
            >
              🏰 Find Match
            </button>
          ) : (
            <div>
              <div className="queue-status">🔍 Searching for opponent...</div>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", marginTop: 12 }}
                onClick={onLeaveQueue}
              >
                Cancel
              </button>
            </div>
          )}

          <button
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 16 }}
            onClick={onLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
