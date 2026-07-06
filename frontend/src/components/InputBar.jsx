import { useState } from "react";

function InputBar({ onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form className="input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Message SAKHA..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">➤</button>
    </form>
  );
}

export default InputBar;