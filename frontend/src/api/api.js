import axios from "axios";
import { auth } from "../firebase.js";

const API_BASE = "http://localhost:5000/api";

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const createChat = async () => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${API_BASE}/chats`, {}, { headers });
  return res.data;
};

export const getAllChats = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_BASE}/chats`, { headers });
  return res.data;
};

export const getChatMessages = async (chatId) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${API_BASE}/chats/${chatId}/messages`, { headers });
  return res.data;
};

export const sendMessage = async (chatId, content) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${API_BASE}/message`, { chatId, content }, { headers });
  return res.data;
};