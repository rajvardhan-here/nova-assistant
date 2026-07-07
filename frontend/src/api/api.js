import axios from "axios";
import { auth } from "../firebase.js";
import { getGoogleToken } from "../googleToken.js";

const API_BASE = "http://localhost:5000/api";

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  const googleToken = getGoogleToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (googleToken) headers["X-Google-Token"] = googleToken;
  return headers;
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

export const togglePinChat = async (chatId) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${API_BASE}/chats/${chatId}/pin`, {}, { headers });
  return res.data;
};

export const deleteChat = async (chatId) => {
  const headers = await getAuthHeader();
  const res = await axios.delete(`${API_BASE}/chats/${chatId}`, { headers });
  return res.data;
};

export const getAllTasks = async (type) => {
  const headers = await getAuthHeader();
  const url = type ? `${API_BASE}/tasks?type=${type}` : `${API_BASE}/tasks`;
  const res = await axios.get(url, { headers });
  return res.data;
};

export const toggleTaskComplete = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${API_BASE}/tasks/${id}/complete`, {}, { headers });
  return res.data;
};

export const deleteTask = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.delete(`${API_BASE}/tasks/${id}`, { headers });
  return res.data;
};