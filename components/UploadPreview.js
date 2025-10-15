// components/UploadPreview.js - Updated component
import { useRef } from "react";

export default function UploadPreview({ onDataUrl, className = "" }) {
  const inputRef = useRef();

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onDataUrl(reader.result);
    };
    reader.onerror = () => {
      console.error('File reading failed');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        id="upload-preview"
      />
      <label
        htmlFor="upload-preview"
        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Upload Image
      </label>
    </div>
  );
}
