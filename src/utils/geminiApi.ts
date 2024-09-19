import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyApwCnDaP4kjVYpxg1ctHnaj-7aZyraeGE";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function identificarPlanta(imagenBase64: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Identifica esta planta y proporciona la siguiente información:
  1. Nombre común
  2. Nombre científico
  3. Breve descripción
  4. Características principales (lista de 3-5 puntos)
  5. Regiones donde suele crecer

  Por favor, estructura tu respuesta en formato JSON como este ejemplo:
  {
    "nombreComun": "Ejemplo de planta",
    "nombreCientifico": "Exemplum plantae",
    "descripcion": "Breve descripción de la planta.",
    "caracteristicas": ["Característica 1", "Característica 2", "Característica 3"],
    "regiones": ["Región 1", "Región 2"]
  }`;

  const imagePart = {
    inlineData: {
      data: imagenBase64.split(',')[1],
      mimeType: "image/jpeg"
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("Respuesta de Gemini:", text);
    return text;
  } catch (error) {
    console.error("Error detallado al identificar la planta:", error);
    if (error instanceof Error) {
      throw new Error(`No se pudo identificar la planta. Error: ${error.message}`);
    } else {
      throw new Error("No se pudo identificar la planta por un error desconocido.");
    }
  }
}
