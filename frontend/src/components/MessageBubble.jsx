function MessageBubble({ role, content, isTyping }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      {!isUser && <div className="avatar">✦</div>}
      <div className={`bubble ${isUser ? "user-bubble" : "assistant-bubble"} ${isTyping ? "typing" : ""}`}>
        {content}
      </div>
    </div>
  );
}

export default MessageBubble;