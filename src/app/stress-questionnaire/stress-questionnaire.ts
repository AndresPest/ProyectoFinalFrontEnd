import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { CapturaService } from '../services/captura.service';

interface CuestionarioInfo {
  id: number;
  nombre: string;
  descripcion: string;
  tiempoEstimado: string;
  identificador: string;
}

@Component({
  selector: 'app-stress-questionnaire',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: './stress-questionnaire.html',
  styleUrls: ['./stress-questionnaire.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInTrigger', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class StressQuestionnaireComponent implements AfterViewInit{

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  public consentimientoAceptado: boolean = false;

  constructor(private capturaService: CapturaService) {
    const previo = localStorage.getItem('consentimiento_ia');
    if (previo === 'true') {
      this.consentimientoAceptado = false;
    }
  }

  aceptarConsentimiento() {
    this.consentimientoAceptado = true;
    localStorage.setItem('consentimiento_ia', 'true');
  }

  private authService = inject(AuthService);

  // --- CONFIGURACIÓN INICIAL ---
  public testSeleccionado: string | null = null;
  public preguntaActual: number = 0;

  public listaCuestionarios: CuestionarioInfo[] = [
    { id: 1, nombre: 'Test de Vulnerabilidad al Estrés', identificador: 'miller', descripcion: 'Evalúa vulnerabilidad ante presiones cotidianas.', tiempoEstimado: '5 min - 10 min' },
    { id: 2, nombre: 'Cuestionario de Estrés Académico (CEAU)', identificador: 'ceau', descripcion: 'Identifica estresores en el entorno universitario.', tiempoEstimado: '10 min - 15 min' },
    { id: 3, nombre: 'Inventario SISCO', identificador: 'sisco', descripcion: 'Mide estresores, síntomas y afrontamiento.', tiempoEstimado: '10 min - 15 min' }
  ];

  // --- NAVEGACIÓN GENERAL ---
  seleccionarTest(identificador: string) {
    this.testSeleccionado = identificador;
    this.resetearVariables();
  }

  volverAlMenu() {
    this.testSeleccionado = null;
  }

  resetearVariables() {
    this.preguntaActual = 0;
    this.indiceCEAU = 0;
    this.indiceSisco = 0;
    this.siscoFiltroPasado = false;
    this.mostrarResultadosFinales = false;
  }

  // --- LÓGICA TEST MILLER ---

    public escalaTestVulnerabilidad = [
    'Nunca', 
    'Casi nunca', 
    'Rara vez', 
    'Algunas veces', 
    'Casi siempre', 
    'Siempre'
  ];

  public preguntasTestVulnerabilidad = [
    { id: 1, texto: "Hago por lo menos una comida caliente y balanceada al día.", valor: 0 },
    { id: 2, texto: "Por lo menos cuatro noches a la semana duermo de 7 a 8 horas.", valor: 0 },
    { id: 3, texto: "Doy y recibo afecto regularmente.", valor: 0 },
    { id: 4, texto: "En 50 millas a la redonda poseo, por lo menos, un familiar en el que puedo confiar.", valor: 0 },
    { id: 5, texto: "Por lo menos dos veces a la semana hago ejercicios hasta sudar.", valor: 0 },
    { id: 6, texto: "Fumo menos de media cajetilla de cigarrillos al día.", valor: 0 },
    { id: 7, texto: "Tomo menos de 5 tragos (de bebida alcohólica) a la semana.", valor: 0 },
    { id: 8, texto: "Tengo el peso apropiado para mi estatura.", valor: 0 },
    { id: 9, texto: "Mis ingresos satisfacen mis gastos fundamentales.", valor: 0 },
    { id: 10, texto: "Mis creencias me hacen mas fuerte.", valor: 0 },
    { id: 11, texto: "Asisto regularmente a actividades sociales o del club.", valor: 0 },
    { id: 12, texto: "Tengo una red de amigos y conocidos.", valor: 0 },
    { id: 13, texto: "Tengo uno o más amigos a quienes puedo confiarle mis problemas personales.", valor: 0 },
    { id: 14, texto: "Tengo buena salud (vista, oido, dentadura, etc.).", valor: 0 },
    { id: 15, texto: "Soy capaz de hablar abiertamente sobre mis sentimientos cuando me siento irritado o preocupado.", valor: 0 },
    { id: 16, texto: "Converso regularmente sobre problemas domesticos con las personas que conviven conmigo.", valor: 0 },
    { id: 17, texto: "Por lo menos una vez a la semana hago algo para divertirme.", valor: 0 },
    { id: 18, texto: "Soy capaz de organizar racionalmente mi tiempo.", valor: 0 },
    { id: 19, texto: "Tomo menos de tres tazas de café (o de té o refresco de cola) al día.", valor: 0 },
    { id: 20, texto: "Durante el día me dedico a mi mismo un rato de tranquilidad.", valor: 0 }
  ];

  seleccionarOpcionTestVulnerabilidad(p: any, valor: number) {
    p.valor = valor;
    setTimeout(() => {
      if (this.preguntaActual < this.preguntasTestVulnerabilidad.length - 1) this.preguntaActual++;
    }, 300);
  }

  anteriorPregunta() {
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
    }
  }

  get progresoTestVulnerabilidad(): number {
    return ((this.preguntaActual + 1) / this.preguntasTestVulnerabilidad.length) * 100;
  }

  testCompletado(): boolean {
    return this.preguntasTestVulnerabilidad.every(p => p.valor !== null);
  }

  async calcularResultadoTestVulnerabilidad() {
    const sumaTotal = this.preguntasTestVulnerabilidad.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    const user = this.authService.currentUser;
    const puntajeFinal = sumaTotal - 20;
    let diagnostico = '';
    if (user) {
      await this.authService.guardarResultadoCuestionario(user.uid, {
        identificador: 'Miller', puntaje: sumaTotal - 20, tiempo: 300
      });
      alert("Test de Miller guardado.");
    }
    this.volverAlMenu();
  }

  // --- LÓGICA TEST CEAU ---
  public indiceCEAU: number = 0;

  public escalaCEAU = [
    'Nada de estrés', 
    'Poco estrés', 
    'Algo de estrés', 
    'Bastante estrés', 
    'Mucho estrés'
  ];
  
  public preguntasCEAU = [
    { id: 1, texto: "Realización de exámenes.", valor: 0 },
    { id: 2, texto: "Exposición de trabajo en clase.", valor: 0 },
    { id: 3, texto: "Intervención en el aula (responder o realizar preguntas, debates).", valor: 0 },
    { id: 4, texto: "Tratar con el profesor en su oficina (tutorías, consultas).", valor: 0 },
    { id: 5, texto: "Sobrecarga académica (excesivo número de créditos, trabajos).", valor: 0 },
    { id: 6, texto: "Masificación en las aulas.", valor: 0 },
    { id: 7, texto: "Falta de tiempo para cumplir con las actividades académicas.", valor: 0 },
    { id: 8, texto: "Competitividad entre compañeros.", valor: 0 },
    { id: 9, texto: "Realización de trabajos obligatorios para aprobar asignaturas.", valor: 0 },
    { id: 10, texto: "La tarea de estudio.", valor: 0 },
    { id: 11, texto: "Trabajar en grupo.", valor: 0 },
    { id: 12, texto: "Problemas o conflictos con los profesores.", valor: 0 },
    { id: 13, texto: "Problemas o conflictos con los compañeros.", valor: 0 },
    { id: 14, texto: "Poder asistir a todas las clases.", valor: 0 },
    { id: 15, texto: "Exceso de responsabilidad por cumplir obligaciones académicas.", valor: 0 },
    { id: 16, texto: "Obtener notas elevadas en distintas asignaturas.", valor: 0 },
    { id: 17, texto: "Perspectivas profesionales futuras.", valor: 0 },
    { id: 18, texto: "Elección de materias durante la carrera.", valor: 0 },
    { id: 19, texto: "Mantener o conseguir una beca para estudiar.", valor: 0 },
    { id: 20, texto: "Acabar la carrera en los plazos estipulados.", valor: 0 },
    { id: 21, texto: "Presión familiar por obtener resultados adecuados.", valor: 0 }
  ];

  seleccionarOpcionCEAU(p: any, valor: number) {
    p.valor = valor;
    setTimeout(() => {
      if (this.indiceCEAU < this.preguntasCEAU.length - 1) this.indiceCEAU++;
    }, 300);
  }

  anteriorCEAU() {
    if (this.indiceCEAU > 0) {
      this.indiceCEAU--;
    }
  }

  get progresoCEAU(): number {
    return ((this.indiceCEAU + 1) / this.preguntasCEAU.length) * 100;
  }

  async calcularResultadoCEAU() {
    const suma = this.preguntasCEAU.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    const user = this.authService.currentUser;
    if (user) {
      await this.authService.guardarResultadoCuestionario(user.uid, {
        identificador: 'CEAU', puntaje: suma, tiempo: 400
      });
    }
    this.volverAlMenu();
  }

  // --- LÓGICA TEST SISCO ---
  public mostrarResultadosFinales: boolean = false;
  public siscoFiltroPasado: boolean = false;
  public siscoNivelGeneral: number = 3;
  public indiceSisco: number = 0;

  public escalaSisco = [
    'Nunca', 
    'Casi nunca', 
    'Rara vez', 
    'Algunas veces', 
    'Casi siempre', 
    'Siempre'
  ];

  public resultadosSisco: any = {
    nivelGeneral: 0,
    estresores: 0,
    sintomas: 0,
    afrontamiento: 0
  };

  public preguntasSisco = [
    // DIMENSIÓN ESTRESORES
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La competencia con mis compañeros del grupo', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La sobrecarga de tareas y trabajos escolares que tengo que realizar todos los días.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La personalidad y el carácter de los/as profesores/as que me imparten clases.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La forma de evaluación de mis profesores/as (a través de ensayos, trabajos de investigación, búsquedas en Internet, etc.)', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El nivel de exigencia de mis profesores/as', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El tipo de trabajo que me piden los profesores (consulta de temas, fichas de trabajo, ensayos, mapas conceptuales, etc.)', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Que me toquen profesores/as muy teóricos/as.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Mi participación en clase (responder a preguntas, hacer comentarios, etc.)', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Tener tiempo limitado para hacer el trabajo que me encargan los/as profesores/as.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La realización de un examen.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Exposición de un tema ante los compañeros de mi grupo.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La poca claridad que tengo sobre lo que quieren los/as profesores/as.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Que mis profesores/as estén mal preparados/as.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Asistir a clases aburridas o monótonas.', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'No entender los temas que se abordan en la clase.', valor: 0 },
    
    // DIMENSIÓN SÍNTOMAS
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Trastornos en el sueño (insomnio o pesadillas).', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Fatiga crónica (cansancio permanente).', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Dolores de cabeza o migraña.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Problemas de digestión, dolor abdominal o diarrea.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Rascarse, morderse las uñas, frotarse, etc.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Somnolencia o mayor necesidad de dormir.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Inquietud (incapacidad de relajarse y estar tranquilo).', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Sentimientos de depresión y tristeza (decaído).', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Ansiedad, angustia o desesperación.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Problemas de concentración.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Sentimiento de agresividad o aumento de irritabilidad.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Conflictos o tendencia a polemizar o discutir.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Aislamiento de los demás.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Desgano para realizar las labores escolares.', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Aumento o reducción del consumo de alimentos.', valor: 0 },

    // DIMENSIÓN AFRONTAMIENTO
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Habilidad asertiva (defender nuestras preferencias, ideas o sentimientos sin dañar a otros).', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Escuchar música o distraerme viendo televisión.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Concentrarse en resolver la situación que me preocupa.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Elogiar mi forma de actuar para enfrentar la situación que me preocupa (echarme porras).', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'La religiosidad (hacer oraciones o asistir a misa).', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Búsqueda de información sobre la situación que me preocupa.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Solicitar el apoyo de mi familia o de mis amigos.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Ventilación y confidencias (verbalización o plática de la situación que preocupa).', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Establecer soluciones concretas para resolver la situación que me preocupa.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Analizar lo positivo y negativo de las soluciones pensadas para solucionar la situación que me preocupa.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Mantener el control sobre mis emociones para que no me afecte lo que me estresa.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Recordar situaciones similares ocurridas anteriormente y pensar en cómo las solucione.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Salir a caminar o hacer algún deporte.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Elaboración de un plan para enfrentar lo que me estresa y ejecución de sus tareas.', valor: 0 },
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Fijarse o tratar de obtener lo positivo de la situación que preocupa.', valor: 0 }
  ];

  validarFiltroSisco(respuesta: boolean) {
    if (!respuesta) {
      this.testSeleccionado = null;
      this.volverAlMenu();
    } else {
      this.siscoFiltroPasado = true;
      this.indiceSisco = -1; // Usaremos -1 para mostrar la pregunta de nivel 1-5
    }
  }

/*  seleccionarOpcionSisco(valor: number) {
    this.capturarYAnalizar();
    this.preguntasSisco[this.indiceSisco].valor = valor;
    if (this.indiceSisco < this.preguntasSisco.length - 1) {
      setTimeout(() => this.indiceSisco++, 300);
    }
  } */

  seleccionarOpcionSisco(valor: number) {
    this.capturarYAnalizar();
    console.log("Valor seleccionado para SISCO:", valor);
    if (this.indiceSisco === -1) {
      this.siscoNivelGeneral = valor;
      this.indiceSisco = 0;
    } else {
      this.preguntasSisco[this.indiceSisco].valor = valor;
      setTimeout(() => {
        if (this.indiceSisco < this.preguntasSisco.length - 1) {
          this.indiceSisco++;
        }
      }, 300);
    }
  }

  async calcularResultadoSisco() {
    const user = this.authService.currentUser;
    this.resultadosSisco = { estresores: 70, sintomas: 50, afrontamiento: 80 }; // Cálculo simplificado
    if (user) {
      await this.authService.guardarResultadoCuestionario(user.uid, {
        identificador: 'SISCO', puntaje: 70, tiempo: 600
      });
    }
    this.mostrarResultadosFinales = true;
  }

  mostrarPantallaResultados(datos: any) {
    this.resultadosSisco = datos;
    this.mostrarResultadosFinales = true;
    
    // Opcional: Desplazar al inicio para ver el título del análisis
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetearTodoSisco() {
    this.testSeleccionado = null; // Volver al menú de tarjetas
    this.mostrarResultadosFinales = false;
    this.siscoFiltroPasado = false;
    this.indiceSisco = 0;
    this.resultadosSisco = null;
    
    // Limpiamos las respuestas de las preguntas para un nuevo test
    this.preguntasSisco.forEach(p => p.valor = 0);
  }

  // CAPTURA DE IMAGEN EN CADA PREGUNTA PARA OBTENER RESULTADO

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = stream;
      console.log("📷 Cámara iniciada en el cuestionario");
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  }

  // Función auxiliar para identificar la pregunta según el test
  obtenerIndiceActual(): number {
    if (this.testSeleccionado === 'miller') return this.preguntaActual;
    if (this.testSeleccionado === 'ceau') return this.indiceCEAU;
    if (this.testSeleccionado === 'sisco') return this.indiceSisco;
    return -1;
  }

  resultadoEstres: any = null;
  mensajeEstres: string = '';
  porcentajeEstres: string = '';
  cargandoEstres: boolean = false;
  public historialAnalisisFacialCNN: any[] = [];
  public historialAnalisisFacialFaceMesh: any[] = [];

  async capturarYAnalizar() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imagenBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      this.cargandoEstres = true;
      const res = await this.capturaService.analizarEmocionCNN(imagenBase64);
      console.log("Resultado del análisis facial:", res.emocion, res.confianza);
      this.resultadoEstres = res;
      this.mensajeEstres = `${res.emocion} (${(res.confianza * 100).toFixed(1)}%)`;
      this.porcentajeEstres = (res.confianza * 100).toFixed(1);
      
      const datoParaHistorial = {
        test: this.testSeleccionado,
        preguntaIndex: this.obtenerIndiceActual(),
        emocion: res.emocion,
        confianza: res.confianza,
        fecha: new Date().toISOString()
      };
      this.historialAnalisisFacialCNN.push(datoParaHistorial);
      console.log("Historial actualizado:", this.historialAnalisisFacialCNN);

    } catch (error) {
      console.error("Error en análisis facial:", error);
    } finally {
      this.cargandoEstres = false;
    }
  }

  analizarEstresVisual() {
    const deteccionesAltas = this.historialAnalisisFacialCNN.filter(d => 
      d.test === 'miller' && (d.emocion === 'Stress' || d.emocion === 'Anxiety')
    );

    console.log(`Durante el test de Miller, se detectó estrés visual ${deteccionesAltas.length} veces.`);
  }


}