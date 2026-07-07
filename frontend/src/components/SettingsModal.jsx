import { useAuth } from "../context/AuthContext.jsx";

function SettingsModal({ onClose }) {
  const { user, logout, calendarConnected } = useAuth();

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-section">
          <div className="settings-label">Account</div>
          <div className="settings-sub">{user?.email}</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Google Calendar</div>
          <div className="settings-sub">
            {calendarConnected ? "🟢 Connected — events sync automatically" : "🔴 Not connected — log out and log in again to connect"}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">About</div>
          <div className="settings-sub">SAKHA v1.0 — your AI companion</div>
        </div>

        <button className="settings-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;