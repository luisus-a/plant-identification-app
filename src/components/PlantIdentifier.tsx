'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import { identificarPlanta } from '../utils/geminiApi';
import LoadingSpinner from './LoadingSpinner';

interface PlantInfo {
  nombreComun: string;
  nombreCientifico: string;
  descripcion: string;
  caracteristicas: string[];
  regiones: string[];
}

const PlantIdentifier: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identifiedPlant, setIdentifiedPlant] = useState<PlantInfo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setShowCamera(false);
    await identifyPlant(imageDataUrl);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        setCapturedImage(imageDataUrl);
        await identifyPlant(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyPlant = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const resultado = await identificarPlanta(imageDataUrl);
      const plantInfo = parsePlantInfo(resultado);
      setIdentifiedPlant(plantInfo);
    } catch (error) {
      console.error("Error al identificar la planta:", error);
      setError("No se pudo identificar la planta. Por favor, intenta con otra imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const parsePlantInfo = (text: string): PlantInfo => {
    try {
      const plantInfo = JSON.parse(text);
      if (
        typeof plantInfo.nombreComun === 'string' &&
        typeof plantInfo.nombreCientifico === 'string' &&
        typeof plantInfo.descripcion === 'string' &&
        Array.isArray(plantInfo.caracteristicas) &&
        Array.isArray(plantInfo.regiones)
      ) {
        return plantInfo as PlantInfo;
      } else {
        throw new Error('La respuesta no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error al parsear la respuesta de Gemini:', error);
      return {
        nombreComun: 'Error',
        nombreCientifico: 'Error',
        descripcion: 'No se pudo procesar la respuesta de Gemini.',
        caracteristicas: ['Error al procesar la respuesta'],
        regiones: ['Desconocido']
      };
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-green-100 to-blue-100 min-h-screen">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-green-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Identificador de Plantas
      </motion.h1>
      
      <motion.div 
        className="flex flex-col space-y-4 mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button 
          onClick={() => setShowCamera(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-lg"
        >
          📷 Capturar imagen con cámara
        </button>
        <label className="bg-green-500 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 shadow-lg text-center">
          📁 Subir imagen
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden"
          />
        </label>
      </motion.div>

      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CameraCapture onCapture={handleCapture} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {capturedImage && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Imagen capturada:</h2>
            <motion.img 
              src={capturedImage} 
              alt="Planta capturada" 
              className="max-w-sm rounded-lg shadow-xl mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <LoadingSpinner />}

      {error && (
        <motion.p 
          className="text-red-500 mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {identifiedPlant && !isLoading && (
          <motion.div 
            className="mt-8 bg-white p-6 rounded-lg shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-green-800">Planta identificada:</h2>
            <motion.p className="text-gray-700 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <strong>Nombre común:</strong> {identifiedPlant.nombreComun}
            </motion.p>
            <motion.p className="text-gray-700 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <strong>Nombre científico:</strong> {identifiedPlant.nombreCientifico}
            </motion.p>
            <motion.p className="text-gray-700 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <strong>Descripción:</strong> {identifiedPlant.descripcion}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <strong className="text-gray-700">Características:</strong>
              <ul className="list-disc list-inside text-gray-700 mt-2">
                {identifiedPlant.caracteristicas.map((carac, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {carac}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.p 
              className="text-gray-700 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <strong>Regiones:</strong> {identifiedPlant.regiones.join(', ')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantIdentifier;