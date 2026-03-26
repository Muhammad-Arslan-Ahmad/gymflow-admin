"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { useUpload } from "@/utils/useUpload";

export default function ImageUploadWithWebcam({
  value,
  onChange,
  label = "Photo",
}) {
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [upload, { loading: uploading }] = useUpload();

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setShowWebcam(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Could not access webcam. Please check permissions.");
    }
  };

  // Assign stream to video element after it mounts
  useEffect(() => {
    if (showWebcam && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showWebcam, stream]);

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowWebcam(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        async (blob) => {
          const file = new File([blob], "webcam-photo.jpg", {
            type: "image/jpeg",
          });
          const result = await upload({ file });
          if (result?.url) {
            onChange(result.url);
            stopWebcam();
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await upload({ file });
      if (result?.url) {
        onChange(result.url);
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : showWebcam ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-80 h-60 rounded-lg border-2 border-indigo-500 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check size={16} />
              {uploading ? "Uploading..." : "Capture"}
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload from Computer"}
          </button>
          <button
            type="button"
            onClick={startWebcam}
            disabled={uploading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Camera size={16} />
            Use Webcam
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
