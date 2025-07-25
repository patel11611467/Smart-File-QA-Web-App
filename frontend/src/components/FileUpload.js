// src/components/FileUpload.js
import React, { useState } from 'react';
import FilePreview from 'reactjs-file-preview';

const FileUpload = ({ onFileChange }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(URL.createObjectURL(selectedFile));
    onFileChange(selectedFile);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {file && <FilePreview preview={file} />}
    </div>
  );
};

export default FileUpload;
