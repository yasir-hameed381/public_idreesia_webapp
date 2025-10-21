"use client";
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";

interface DragAndDropFileUploadProps {
  onFileChange: (file: File) => void;
  error?: string;
  accept?: string;
}

const DragAndDropFileUpload: React.FC<DragAndDropFileUploadProps> = ({
  onFileChange,
  error,
  accept = "audio/*",
}) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFilePreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFilePreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Box
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDrop={handleDrop}
      sx={{
        border: "2px dashed grey",
        borderRadius: "8px",
        p: 3,
        textAlign: "center",
        backgroundColor: "grey.100",
        cursor: "pointer",
      }}
    >
      <Typography variant="h6" color="textSecondary" mb={2}>
        Drag & drop a file, or click to browse
      </Typography>
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Browse File
        <input type="file" accept={accept} hidden onChange={handleFileSelect} />
      </Button>

      {filePreview && (
        <Box mt={3}>
          <Typography variant="body1" color="textSecondary" mb={1}>
            File Preview:
          </Typography>
          <audio controls src={filePreview} style={{ width: "100%" }} />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default DragAndDropFileUpload;