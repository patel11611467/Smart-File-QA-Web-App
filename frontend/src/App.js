import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";



function App() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [docs, setDocs] = useState([]);
  const [exportMessage, setExportMessage] = useState('');
  const [isEnable, setIsEnable ] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  if (!file) return;

  // Create a preview URL
  const previewUrl = URL.createObjectURL(file);
  if(file == "application/msword") {
  const uri = URL.createObjectURL(file);
  setDocs([{ uri, fileName: file.name }]);
  }
  else{
  setPreviewUrl(previewUrl);  
  }
  
  // Now upload
  const form = new FormData();
  form.append('file', file);

  axios.post('http://localhost:4000/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
    // .then(res => console.log('Uploaded, id:', res.data.fileId))
    .then(res => {
      const fid = res.data.fileId;
      console.log('Uploaded, id:', fid);
      setFileId(fid);                                         // 2. Save fileId
    })
    .catch(err => console.error(err));
  };

  const [email, setEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]);
  const [fileId, setFileId] = useState('');

  const handleSubmit = async e => {
  e.preventDefault();
  setIsEnable(true);
  console.log("fileId",fileId);
  try {
    const res = await axios.post('http://localhost:4000/ask',
      { email, prompt, fileId } // now fileId is defined!
    );
    const answer = res.data.answer;
    setResponses(prev => [...prev, { prompt, answer }]);
    setPrompt('');
  } catch (err) {
    console.error('Error calling /ask:', err);
  }
  setIsEnable(false);
};

const exportPdfAndEmail = async ()=>{
 console.log("fileId",fileId);
   try {
    const res = await axios.post('http://localhost:4000/export', {
      fileId,
      email,
    });
    if (res.data.status === 'sent') {
      setExportMessage('✅ Report sent successfully!');
    } else {
      setExportMessage('Unexpected response from server.');
    }
  } catch (err) {
    console.error('Export error:', err);
    setExportMessage(' Error: ' + (err.response?.data?.error || err.message));
  } 
};

  return (
    <div className="container">
      <h1>Smart File QA Web App</h1>

      <input type="file" onChange={handleFileChange} />
      <div className="preview">
      {previewUrl && <iframe  src={previewUrl} width={"100%"} height={"350rem"} />}
      {docs && <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Ask about the file"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          required
        />
        <button type="submit" disabled={isEnable}> {isEnable?"Searching...":"Ask OpenAI"}</button>
      </form>

      <div className="responses">
        {responses.map((r, i) => (
          <div key={i} className="response-item">
            <strong>Q:</strong> {r.prompt}<br />
            <strong>A:</strong> {r.answer}
          </div>
        ))}
      </div>

      <div className="export-button"> 
        <button type ="button" onClick={exportPdfAndEmail} disabled={isEnable}>Export to PDF & Email</button>
      </div>
    </div>
  );
}

export default App;
