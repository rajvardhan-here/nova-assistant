import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import InputBar from "../components/InputBar.jsx";
import { createChat, getAllChats, getChatMessages, sendMessage } from "../api/api.js";

function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const data = await getAllChats();
    setChats(data);
    if (data.length > 0 && !activeChatId) {
      selectChat(data[0]._id);
    }
  };

  const selectChat = async (chatId) => {
    setActiveChatId(chatId);
    const msgs = await getChatMessages(chatId);
    setMessages(msgs);
  };

  const handleNewChat = async () => {
    const newChat = await createChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat._id);
    setMessages([]);
  };

  const handleSend = async (text) => {
    let chatId = activeChatId;

    // If no chat exists yet, create one first
    if (!chatId) {
      const newChat = await createChat();
      setChats((prev) => [newChat, ...prev]);
      chatId = newChat._id;
      setActiveChatId(chatId);
    }

    // Optimistically show user message
    const tempUserMsg = { role: "user", content: text, _id: Date.now() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const { assistantMessage } = await sendMessage(chatId, text);
      setMessages((prev) => [...prev, assistantMessage]);
      loadChats(); // refresh sidebar titles
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
      />
      <div className="main-panel">
        <ChatWindow messages={messages} loading={loading} />
        <InputBar onSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatPage;