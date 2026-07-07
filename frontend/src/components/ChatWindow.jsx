import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.length === 0 && !loading && (
        <div className="empty-state">
          <span className="empty-icon">✦</span>
          <p>Hi, I'm SAKHA. Ask me anything!</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg._id} role={msg.role} content={msg.content} />
      ))}

      {loading && <MessageBubble role="assistant" content="Typing..." isTyping />}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;