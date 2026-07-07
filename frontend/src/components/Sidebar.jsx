import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { togglePinChat, deleteChat } from "../api/api.js";

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, view, onChangeView, onChatsUpdated }) {
  const { user, logout } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleMenuToggle = (e, chatId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handlePin = async (e, chatId) => {
    e.stopPropagation();
    await togglePinChat(chatId);
    setOpenMenuId(null);
    onChatsUpdated();
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (confirm("Delete this chat?")) {
      await deleteChat(chatId);
      setOpenMenuId(null);
      onChatsUpdated();
    }
  };

  return (
    <div className="sidebar" onClick={() => setOpenMenuId(null)}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">SAKHA</span>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + New chat
      </button>

      <div className="sidebar-nav">
        <div className={`nav-item ${view === "chat" ? "active" : ""}`} onClick={() => onChangeView("chat")}>
          💬 Assistant
        </div>
        <div className={`nav-item ${view === "reminders" ? "active" : ""}`} onClick={() => onChangeView("reminders")}>
          ⏰ Reminders
        </div>
      </div>

      {view === "chat" && (
        <>
          <div className="chats-label">Chats</div>
          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${chat._id === activeChatId ? "active" : ""}`}
                onClick={() => onSelectChat(chat._id)}
              >
                <span className="chat-item-text">
                  {chat.pinned ? "📌 " : "💬 "}
                  {chat.title}
                </span>
                <button className="chat-menu-btn" onClick={(e) => handleMenuToggle(e, chat._id)}>
                  ⋮
                </button>

                {openMenuId === chat._id && (
                  <div className="chat-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="chat-menu-item" onClick={(e) => handlePin(e, chat._id)}>
                      {chat.pinned ? "📌 Unpin" : "📌 Pin"}
                    </div>
                    <div className="chat-menu-item delete" onClick={(e) => handleDelete(e, chat._id)}>
                      🗑 Delete
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sidebar-footer">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="profile" className="user-avatar-img" />
        ) : (
          <div className="user-avatar">{user?.displayName?.[0] || "U"}</div>
        )}
        <span className="user-name">{user?.displayName || user?.email}</span>
        <button className="logout-btn" onClick={logout} title="Logout">
          ⎋
        </button>
      </div>
    </div>
  );
}

export default Sidebar;