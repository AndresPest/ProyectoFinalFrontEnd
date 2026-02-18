export interface EstresCuestionario {
  pregunta: string;
  respuesta: string;
}

export interface SeccionTest {
  titulo: string;        // Ej: "3.- Dimensión estresores"
  enunciadoFijo: string; // Ej: "¿Con qué frecuencia te estresa:"
  preguntas: Pregunta[];
}

export interface Pregunta {
  texto: string;         // Ej: "La competencia con los compañeros"
  valor?: number;
}

export const TEST_SISCO: SeccionTest[] = [
  {
    titulo: "3.- Dimensión estresores",
    enunciadoFijo: "¿Con qué frecuencia te estresa:",
    preguntas: [
      { texto: "La competencia con los compañeros del grupo" },
      { texto: "La sobrecarga de tareas y trabajos escolares" },
      { texto: "La personalidad y carácter del profesor" }
    ]
  },
  {
    titulo: "4.- Dimensión síntomas (reacciones)",
    enunciadoFijo: "¿Con qué frecuencia se te presentan las siguientes reacciones cuando estás estresado:",
    preguntas: [
      { texto: "Trastornos en el sueño (insomnio o pesadillas)" },
      { texto: "Fatiga crónica (cansancio permanente)" },
      { texto: "Sentimientos de depresión y tristeza" }
    ]
  }
];