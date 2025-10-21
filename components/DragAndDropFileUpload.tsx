"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiFile, FiCheckCircle, FiX } from "react-icons/fi";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  error?: string;
  currentFile?: string | null;
}

const DragAndDropFileUpload: React.FC<FileUploaderProps> = ({
  onFileChange,
  error,
  currentFile
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        
        // Check if it's an audio file
        if (selectedFile.type.startsWith("audio/")) {
          setFile(selectedFile);
          onFileChange(selectedFile);
        } else {
        //   Handle non-audio file
          alert("Please upload only audio files");
          setFile(null);
          onFileChange(null);
        }
      }
    },
    [onFileChange]
  );

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      {currentFile && !file && (
        <div className="text-sm text-gray-600 mb-2">
          <p>Current file: {currentFile.split('/').pop()}</p>
          <p className="text-xs text-gray-500">Upload a new file to replace the current one</p>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive || isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="text-green-500 text-2xl mb-2" />
            <div className="flex items-center space-x-2">
              <FiFile className="text-gray-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-red-500 hover:text-red-700"
              >
                <FiX />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiUpload className="text-gray-400 text-3xl mb-2" />
            <p className="text-sm text-gray-500 mb-1">
              Drag and drop your audio file here, or click to select
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: MP3, WAV, OGG, M4A
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default DragAndDropFileUpload;



// import React, { useRef, useState } from 'react';
// import { Toast } from 'primereact/toast';
// import { FileUpload } from 'primereact/fileupload';
// import { ProgressBar } from 'primereact/progressbar';
// import { Button } from 'primereact/button';
// import { Tag } from 'primereact/tag';
// import 'primereact/resources/themes/lara-light-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

// interface FileUploaderProps {
//     onFileChange: (file: File | null) => void;
//     error?: string;
//     currentFile?: string | null;
// }

// const DragAndDropFileUpload: React.FC<FileUploaderProps> = ({ onFileChange, error, currentFile }) => {
//     const toast = useRef<Toast>(null);
//     const [totalSize, setTotalSize] = useState(0);
//     const fileUploadRef = useRef<FileUpload>(null);
//     const [file, setFile] = useState<File | null>(null);

//     const onTemplateSelect = (e: any) => {
//         let _totalSize = totalSize;
//         let files = e.files;

//         if (files.length > 0) {
//             const selectedFile = files[0];
//             if (!selectedFile.type.startsWith('audio/')) {
//                 toast.current?.show({ severity: 'error', summary: 'Invalid File', detail: 'Please upload only audio files' });
//                 return;
//             }
//             if (selectedFile.size < 1000000 || selectedFile.size > 5000000) {
//                 toast.current?.show({ severity: 'error', summary: 'Invalid File Size', detail: 'File size must be between 1MB and 5MB' });
//                 return;
//             }
//             _totalSize += selectedFile.size || 0;
//             setFile(selectedFile);
//             onFileChange(selectedFile);
//         }
//         setTotalSize(_totalSize);
//     };

//     const onTemplateRemove = (file: File, callback: Function) => {
//         setTotalSize(totalSize - file.size);
//         setFile(null);
//         onFileChange(null);
//         callback();
//     };

//     const headerTemplate = (options: any) => {
//         const { className, chooseButton, cancelButton } = options;
//         const value = totalSize / 10000;
//         const formattedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

//         return (
//             <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
//                 {chooseButton}
//                 {cancelButton}
//                 <div className="flex align-items-center gap-3 ml-auto">
//                     <span>{formattedValue} / 5 MB</span>
//                     <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
//                 </div>
//             </div>
//         );
//     };

//     const itemTemplate = (inFile: object, props: any) => {
//         const file = inFile as File;
//         return (
//             <div className="flex align-items-center flex-wrap p-2 border-round border-1 surface-border">
//                 <i className="pi pi-file-audio text-2xl text-primary mr-3"></i>
//                 <div className="flex flex-column text-left">
//                     <span className="font-medium">{file.name}</span>
//                     <small className="text-600">{new Date().toLocaleDateString()}</small>
//                 </div>
//                 <Tag value={props.formatSize} severity="warning" className="ml-auto px-3 py-2" />
//                 <Button icon="pi pi-times" className="p-button-rounded p-button-danger ml-3" onClick={() => onTemplateRemove(file, props.onRemove)} />
//             </div>
//         );
//     };

//     return (
//         <div className="w-full p-3 surface-card shadow-2 border-round">
//             {currentFile && !file && (
//                 <div className="text-sm text-gray-600 mb-2">
//                     <p>Current file: {currentFile.split('/').pop()}</p>
//                     <p className="text-xs text-gray-500">Upload a new file to replace the current one</p>
//                 </div>
//             )}
//             <Toast ref={toast} />
//             <FileUpload
//                 ref={fileUploadRef}
//                 name="audio"
//                 accept="audio/*"
//                 customUpload
//                 onSelect={onTemplateSelect}
//                 headerTemplate={headerTemplate}
//                 itemTemplate={itemTemplate}
//                 emptyTemplate={<p className="m-0 text-center text-gray-500">Drag and drop your audio file here, or click to select</p>}
//             />
//             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//         </div>
//     );
// };

// export default DragAndDropFileUpload;
