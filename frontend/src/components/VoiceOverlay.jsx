import { useEffect, useRef, useState } from "react";

const STATES = {
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
};

function VoiceOverlay({ onSendMessage, onClose }) {
  const [state, setState] = useState(STATES.LISTENING);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef(null);
  const stoppedRef = useRef(false);
  const voicesRef = useRef([]);
  const stateRef = useRef(STATES.LISTENING);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    stoppedRef.current = false;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice mode isn't supported in this browser. Please use Chrome or Edge.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setState(STATES.THINKING);

      try {
        const assistantReply = await onSendMessage(text);
        setReply(assistantReply);
        speak(assistantReply);
      } catch (err) {
        console.error("Send message error:", err);
        if (!stoppedRef.current) startListening();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setErrorMsg("Microphone access denied. Please allow mic permission and reload.");
        return;
      }
      if (!stoppedRef.current) {
        setTimeout(() => startListening(), 300);
      }
    };

    recognition.onend = () => {
      if (!stoppedRef.current && stateRef.current === STATES.LISTENING) {
        setTimeout(() => startListening(), 200);
      }
    };

    recognitionRef.current = recognition;

    // Auto-start immediately — no click needed
    startListening();

    return () => {
      stoppedRef.current = true;
      recognition.stop();
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickVoice = () => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;

    // Prefer known female English voices
    const femaleNames = ["female", "zira", "samantha", "susan", "google us english", "google uk english female", "heera", "veena"];
    const femaleMatch = voices.find(
      (v) =>
        v.lang?.startsWith("en") &&
        femaleNames.some((name) => v.name.toLowerCase().includes(name))
    );
    if (femaleMatch) return femaleMatch;

    return (
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang?.startsWith("en")) ||
      voices[0]
    );
  };

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^\s*[\*\-•]\s+/gm, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, ". ")
      .trim();
  };

  const speak = (text) => {
    setState(STATES.SPEAKING);
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.02;
    utterance.pitch = 1.1;

    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.onend = () => {
      if (!stoppedRef.current) startListening();
    };
    utterance.onerror = () => {
      if (!stoppedRef.current) startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (stoppedRef.current) return;
    if (stateRef.current === STATES.LISTENING && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setErrorMsg("");
    setTranscript("");
    setReply("");
    setState(STATES.LISTENING);
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }, 100);
  };

  const handleOrbClick = () => {
    if (state === STATES.SPEAKING) {
      window.speechSynthesis.cancel();
      startListening();
    }
  };

  const handleClose = () => {
    stoppedRef.current = true;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    onClose();
  };

  const statusText = {
    [STATES.LISTENING]: "Listening...",
    [STATES.THINKING]: "Thinking...",
    [STATES.SPEAKING]: "Speaking... (tap to interrupt)",
  };

  return (
    <div className="voice-overlay">
      <button className="voice-close-btn" onClick={handleClose}>
        ✕
      </button>

      <div className={`voice-orb ${state}`} onClick={handleOrbClick}>
        <span className="voice-orb-icon">✦</span>
      </div>

      <p className="voice-status">{statusText[state]}</p>

      {errorMsg && <p className="voice-error">{errorMsg}</p>}
      {transcript && <p className="voice-transcript">"{transcript}"</p>}
      {reply && <p className="voice-reply">{reply}</p>}
    </div>
  );
}

export default VoiceOverlay;