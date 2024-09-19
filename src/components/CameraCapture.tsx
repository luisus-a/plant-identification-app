'use client';  // Añade esta línea al principio del archivo

import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (capturedImage: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      onCapture(imageDataUrl);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay style={{ display: stream ? 'block' : 'none' }} />
      {!stream ? (
        <button onClick={startCamera}>Iniciar cámara</button>
      ) : (
        <>
          <button onClick={captureImage}>Capturar imagen</button>
          <button onClick={stopCamera}>Detener cámara</button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;