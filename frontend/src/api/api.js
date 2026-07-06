import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const createChat = async () => {
  const res = await axios.post(`${API_BASE}/chats`);
  return res.data;
};

export const getAllChats = async () => {
  const res = await axios.get(`${API_BASE}/chats`);
  return res.data;
};

export const getChatMessages = async (chatId) => {
  const res = await axios.get(`${API_BASE}/chats/${chatId}/messages`);
  return res.data;
};

export const sendMessage = async (chatId, content) => {
  const res = await axios.post(`${API_BASE}/message`, { chatId, content });
  return res.data;
};