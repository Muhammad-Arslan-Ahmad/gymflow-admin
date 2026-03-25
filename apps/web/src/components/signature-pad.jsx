"use client";

import { useState, useRef, useEffect } from "react";
import { PenTool, RotateCcw, X } from "lucide-react";
import { useUpload } from "@/utils/useUpload";

export default function SignaturePad({ value, onChange, label = "Signature" }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);
  const { upload, uploading } = useUpload();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    setIsDrawing(true);
    setHasDrawn(true);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange("");
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "signature.png", { type: "image/png" });
      const url = await upload(file);
      if (url) {
        onChange(url);
      }
    }, "image/png");
  };

  const handleRemove = () => {
    onChange("");
    clearSignature();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Signature"
              className="border-2 border-gray-200 rounded-lg bg-white p-2"
              style={{ maxWidth: "400px", height: "auto" }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="bg-white rounded cursor-crosshair w-full"
              style={{ touchAction: "none" }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
              <PenTool size={12} />
              Draw your signature above
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearSignature}
              disabled={!hasDrawn}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} />
              Clear
            </button>
            <button
              type="button"
              onClick={saveSignature}
              disabled={!hasDrawn || uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Saving..." : "Save Signature"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
