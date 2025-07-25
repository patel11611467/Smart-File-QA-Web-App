// src/components/UserInput.js
import React, { useState } from 'react';

const UserInput = ({ onPromptSubmit }) => {
  const [email, setEmail] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPromptSubmit({ email, prompt });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder="Ask a question about the file"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserInput;
