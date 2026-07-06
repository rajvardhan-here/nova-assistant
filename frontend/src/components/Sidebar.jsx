function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">SAKHA</span>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + New chat
      </button>

      <div className="chats-label">Chats</div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`chat-item ${chat._id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat._id)}
          >
            💬 {chat.title}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">RS</div>
        <span>Rajvardhan Singh</span>
      </div>
    </div>
  );
}

export default Sidebar;