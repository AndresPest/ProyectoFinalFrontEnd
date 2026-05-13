import { Component, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy, Renderer2, Inject, NgZone, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { CapturaService } from '../services/captura.service';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Firestore, collection, query, where, orderBy, getDocs, addDoc } from '@angular/fire/firestore';
import { DOCUMENT } from '@angular/common';

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
  imports: [CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet, MatTooltipModule, RouterModule],
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
export class StressQuestionnaireComponent implements AfterViewInit, OnDestroy {
  
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private mediaStream: MediaStream | null = null;

  constructor(private router: Router, private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {
    const previo = localStorage.getItem('consentimiento');
    if (previo === 'true') this.consentimientoAceptado = true;
  }

  private zone = inject(NgZone);
  private cd = inject(ChangeDetectorRef);

  async ngAfterViewInit() {
    if (!this.consentimientoAceptado) {
      this.bloquearScroll();
    }
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.mediaStream;
    } catch (err) {
      console.error("Error cámara:", err);
    }
  }

  ngOnDestroy() {
    this.detenerCamara();
    this.desbloquearScroll();
  }

  private detenerCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
      console.log("Cámara desactivada exitosamente");
    }
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }

  abrirConfidencialidad() {
    this.zone.run(() => {
      this.consentimientoAceptado = false;
      this.cd.detectChanges();
    });
  }

  private firestore = inject(Firestore);
  public procesando: boolean = false;
  
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private capturaService = inject(CapturaService);

  public consentimientoAceptado: boolean = false;
  public testSeleccionado: string | null = null;
  public mostrarResultadosFinales: boolean = false;

  // Historiales de captura facial
  public historialAnalisisFacialCNN: any[] = [];
  public historialAnalisisFacialFaceMesh: any[] = [];

  public listaCuestionarios: CuestionarioInfo[] = [
    { id: 1, nombre: '¿Qué tanto sientes que te afecta el día a día?', identificador: 'miller',
      descripcion: 'Un repaso por tus hábitos diarios, tus amistades y tu salud ante las presiones del día a día.', tiempoEstimado: '5-10 min'},

    { id: 2, nombre: 'Mi nivel de estrés en la universidad', identificador: 'ceau',
      descripcion: 'Cómo te sientes ante evaluaciones, falta de tiempo y presiones externas (como becas o familia) que se te presentan en la universidad.', tiempoEstimado: '10-15 min'},

    { id: 3, nombre: '¿Cómo reaccionas cuando las cosas se ponen difíciles?', identificador: 'sisco',
      descripcion: 'Qué cosas de la universidad te estresan más, cómo reacciona tu ánimo y qué herramientas usas para que los problemas no te ganen.', tiempoEstimado: '10-15 min'},

    { id: 4, nombre: '¿Qué tanto aguantas antes de estresarte?', identificador: 'bbs',
      descripcion: 'Eres capaz de dejar de pensar en los problemas al llegar a casa o la tensión te sigue a todos lados, afectando tu descanso y tu humor.', tiempoEstimado: '10-15 min'},
      
    { id: 5, nombre: '¿Cómo te avisa tu cuerpo del estrés?', identificador: 'ISE',
      descripcion: 'Cómo el ámbito académico cambia tu conducta, afectando tus ganas de estudiar, tu alimentación y hasta la forma en que te relacionas con los demás.', tiempoEstimado: '15-20 min'}
  ];

  seleccionarTest(id: string) {
    this.testSeleccionado = id;
    this.resetearVariables(); 
  }

  volverAlMenu() { 
    this.testSeleccionado = null;
    this.resetearVariables();
  }
  
  aceptarConsentimiento() {
    this.desbloquearScroll();
    this.consentimientoAceptado = true;
    localStorage.setItem('consentimiento', 'true');
  }

  bloquearScroll() {
    this.renderer.addClass(this.document.body, 'no-scroll');
  }

  desbloquearScroll() {
    this.renderer.removeClass(this.document.body, 'no-scroll');
  }

  resetearVariables() {
    this.indiceMiller = 0;
    this.indiceCEAU = 0;
    this.indiceSisco = -1;
    this.indiceBBS = 0;
    this.indiceISE = 0;
    this.mostrarResultadosFinales = false;
    this.historialAnalisisFacialCNN = [];
    this.historialAnalisisFacialFaceMesh = [];
  }

  ///////// Test de Vulnerabilidad al Estrés - L.H. Miller y A.D. Smith

  public indiceMiller: number = 0;
  public infoMillerSmith: boolean = false;

  get progresoTestVulnerabilidad(): number {
    return (this.preguntasTestVulnerabilidad.length > 0) ? ((this.indiceMiller + 1) / this.preguntasTestVulnerabilidad.length) * 100 : 0;
  }

  anteriorPregunta() {
    if (this.indiceMiller > 0){
      this.indiceMiller--;
      this.historialAnalisisFacialCNN.pop();
      this.historialAnalisisFacialFaceMesh.pop();
    }
  }

  public registroMiller: any = {
    'Salud y Hábitos': 0,
    'Bienestar y Autocuidado': 0,
    'Red de Apoyo': 0,
    'Comunicación y Relaciones': 0,
    'Estabilidad y Gestión': 0
  };
  
  public escalaTestVulnerabilidad = [
    'Siempre',
    'Casi siempre',
    'Frecuentemente',
    'Casi nunca',
    'Nunca'
  ];

  public preguntasTestVulnerabilidad = [
    { dim: 'Salud y Hábitos', id: 1, texto: "Hago por lo menos una comida caliente y balanceada al día.",
      ayuda: "Incluyes alimentos de diferentes grupos y si dedicas un tiempo exclusivo para sentarte a comer.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 2, texto: "Por lo menos cuatro noches a la semana duermo de 7 a 8 horas.",
      ayuda: "Logras un descanso profundo y continuo la mayoría de las noches para recuperar tu energía.", valor: 0 },
    
    { dim: 'Bienestar y Autocuidado', id: 3, texto: "Doy y recibo afecto regularmente.",
      ayuda: "Considera si mantienes contacto físico o emocional cálido con personas cercanas (abrazos, palabras de apoyo).", valor: 0 },
    
    { dim: 'Red de Apoyo', id: 4, texto: "En 50 millas a la redonda tengo, por lo menos, un familiar en el que puedo confiar.",
      ayuda: "Identifica si cuentas con algún pariente cercano que pueda auxiliarte en una emergencia.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 5, texto: "Por lo menos dos veces a la semana hago ejercicios hasta sudar.",
      ayuda: "Realizas actividades físicas para liberar tensión y fortalecer tu cuerpo.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 6, texto: "Fumo menos de media cajetilla de cigarrillos al día.",
      ayuda: "Piensa en cuánto fumas y si sientes que eso te quita energía o te hace cansarte más rápido al respirar.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 7, texto: "Tomo menos de 5 tragos (de bebida alcohólica) a la semana.",
      ayuda: "Considera si mantienes un consumo de alcohol moderado que no interfiera con tu claridad mental o salud.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 8, texto: "Tengo el peso apropiado para mi estatura.",
      ayuda: "Observa si te sientes en un rango de peso saludable que te permita moverte con agilidad y sin fatiga.", valor: 0 },
    
    { dim: 'Estabilidad y Gestión', id: 9, texto: "Mis ingresos satisfacen mis gastos fundamentales.",
      ayuda: "Tu economía actual te permite cubrir tus necesidades básicas sin vivir en un estado de alerta constante.", valor: 0 },
    
    { dim: 'Bienestar y Autocuidado', id: 10, texto: "Mis creencias me hacen mas fuerte.",
      ayuda: "Identifica si tus valores personales, espirituales te brindan esperanza y resiliencia.", valor: 0 },
    
    { dim: 'Red de Apoyo', id: 11, texto: "Asisto regularmente a actividades sociales o del club.",
      ayuda: "Participas en grupos que te hagan sentir parte de una comunidad fuera de tu entorno privado.", valor: 0 },
    
    { dim: 'Red de Apoyo', id: 12, texto: "Tengo una red de amigos y conocidos.",
      ayuda: "Evalúa la cantidad de personas con las que interactúas forman parte de tu círculo social activo.", valor: 0 },
    
    { dim: 'Red de Apoyo', id: 13, texto: "Tengo uno o más amigos a quienes puedo confiarle mis problemas personales.",
      ayuda: "Considera si tienes a alguien especial con quien puedas desahogarte y hablar con total honestidad.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 14, texto: "Tengo buena salud (vista, oido, dentadura, etc.).",
      ayuda: "Evalúa tu bienestar físico general y si tus sentidos te permiten desenvolverte sin incomodidades.", valor: 0 },
    
    { dim: 'Comunicación y Relaciones', id: 15, texto: "Soy capaz de hablar abiertamente sobre mis sentimientos cuando me siento irritado o preocupado.",
      ayuda: "Logras expresar tus emociones difíciles de forma asertiva en lugar de guardártelas.", valor: 0 },
    
    { dim: 'Comunicación y Relaciones', id: 16, texto: "Converso regularmente sobre problemas domesticos con las personas que conviven conmigo.",
      ayuda: "Conversas con las personas que vives para arreglar los problemas de la casa antes de que se vuelvan más grandes.", valor: 0 },
    
    { dim: 'Bienestar y Autocuidado', id: 17, texto: "Por lo menos una vez a la semana hago algo para divertirme.",
      ayuda: "Dedicas tiempo exclusivo a actividades que te generen alegría y desconexión total.", valor: 0 },
    
    { dim: 'Estabilidad y Gestión', id: 18, texto: "Soy capaz de organizar racionalmente mi tiempo.",
      ayuda: "Gestionas bien tus prioridades o sueles sentirte abrumado por las tareas pendientes.", valor: 0 },
    
    { dim: 'Salud y Hábitos', id: 19, texto: "Tomo menos de tres tazas de café (o de té o refresco de cola) al día.",
      ayuda: "Observa tu nivel de consumo de cafeína y cómo afecta tu ritmo o ansiedad durante el día.", valor: 0 },
    
    { dim: 'Bienestar y Autocuidado', id: 20, texto: "Durante el día me dedico a mi mismo un rato de tranquilidad.",
      ayuda: "Tienes momentos de silencio o introspección para calmar tu mente.", valor: 0 }
  ];

  async seleccionarOpcionTestVulnerabilidad(p: any, v: number) {

    if (this.procesando)
      return;

    this.procesando = true;

    if ((this.indiceMiller === this.preguntasTestVulnerabilidad.length - 1) && p.valor !== undefined && p.valor !== null){
      if (this.historialAnalisisFacialCNN.length === this.preguntasTestVulnerabilidad.length) {
        this.historialAnalisisFacialCNN.pop();
        this.historialAnalisisFacialFaceMesh.pop();
      }
    }
    if (p.valor)
      this.registroMiller[p.dim] -= p.valor;

    p.valor = v;
    this.registroMiller[p.dim] += v;

    setTimeout(() => {
      this.capturarYAnalizar();
      if (this.indiceMiller < this.preguntasTestVulnerabilidad.length - 1) {
        this.indiceMiller++;
      } else {
        this.infoMillerSmith = true;
        this.calcularResultadoTestVulnerabilidad(); 
      }
      this.procesando = false;
    }, 300);
  }

  calcularResultadoTestVulnerabilidad() {
    const conteoCateg = this.preguntasTestVulnerabilidad.reduce((acc, p) => { acc[p.dim] = (acc[p.dim] || 0) + 1; return acc; }, {} as any);
    const data = {
      identificador: 'Miller',
      puntajeFinal: this.preguntasTestVulnerabilidad.reduce((a, b) => a + b.valor, 0) - 20,
      categorias: this.registroMiller,
      nPreguntasCategoria: conteoCateg,
      tiempo: 300,
      uid: this.authService.currentUser?.uid
    };
    this.enviarAlBackend(data, 'Miller');
  }

  ///////// CEAU - Cuestionario de Estrés Académico en la Universidad

  public indiceCEAU = 0;
  public infoCEAU: boolean = false;


  get progresoCEAU(): number {
    return (this.preguntasCEAU.length > 0) ? ((this.indiceCEAU + 1) / this.preguntasCEAU.length) * 100 : 0;
  }

  anteriorCEAU() {
    if (this.indiceCEAU > 0){
      this.indiceCEAU--;
      this.historialAnalisisFacialCNN.pop();
      this.historialAnalisisFacialFaceMesh.pop();
    }
  }

  public registroCEAU: any = {
    'Evaluación y Desempeño': 0,
    'Carga y Gestión': 0,
    'Entorno': 0,
    'Expectativas y Futuro': 0
  };
  public escalaCEAU = [
    'Nada de estrés',
    'Poco estrés',
    'Algo de estrés',
    'Bastante estrés',
    'Mucho estrés'
  ];

  public preguntasCEAU = [
    { dim: 'Evaluación y Desempeño', id: 1, texto: "Realización de exámenes.",
      ayuda: "Evalúa qué tanta presión o nervios sientes cuando tienes que presentar una prueba escrita u oral.", valor: 0 },
    
    { dim: 'Evaluación y Desempeño', id: 2, texto: "Exposición de trabajo en clase.",
      ayuda: "Considera el nivel de estrés que te genera hablar en público frente a tus compañeros y el profesor.", valor: 0 },
    
    { dim: 'Evaluación y Desempeño', id: 3, texto: "Intervención en clases (responder o realizar preguntas, debates).",
      ayuda: "Piensa si te genera ansiedad levantar la mano, dar tu opinión o participar activamente en clases.", valor: 0 },
    
    { dim: 'Entorno', id: 4, texto: "Tratar con el profesor en su oficina (tutorías, consultas).",
      ayuda: "Sientes intimidante o estresante tener que ir con el docente para aclarar dudas o pedir ayuda.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 5, texto: "Sobrecarga académica (excesivo número de créditos, trabajos).",
      ayuda: "Sientes que la cantidad de materias o tareas sobrepasa tu capacidad actual para manejarlo todo.", valor: 0 },
    
    { dim: 'Entorno', id: 6, texto: "Masificación en las aulas.",
      ayuda: "Te incomoda o te genera estrés estudiar en salones con demasiada gente o mucho ruido.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 7, texto: "Falta de tiempo para cumplir con las actividades académicas.",
      ayuda: "Sientes que las horas del día no te alcanzan para terminar tus entregas y estudiar lo suficiente.", valor: 0 },
    
    { dim: 'Entorno', id: 8, texto: "Competitividad entre compañeros.",
      ayuda: "Sientes presión por compararte con los demás o si el ambiente de rivalidad te genera tensión.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 9, texto: "Realización de trabajos obligatorios para aprobar asignaturas.",
      ayuda: "Te sientes muy presionado por la obligación de terminar trabajos para no reprobar.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 10, texto: "La tarea de estudio.",
      ayuda: "Sentarte a estudiar por tu cuenta te resulta una carga pesada o estresante.", valor: 0 },
    
    { dim: 'Entorno', id: 11, texto: "Trabajar en grupo.",
      ayuda: "Genera tensión coordinar con otros, repartir tareas o depender de la nota de tus compañeros.", valor: 0 },
    
    { dim: 'Entorno', id: 12, texto: "Problemas o conflictos con los profesores.",
      ayuda: "Sientes el impacto de los desacuerdos, la mala comunicación o la falta de entendimiento con tus docentes.", valor: 0 },
    
    { dim: 'Entorno', id: 13, texto: "Problemas o conflictos con los compañeros.",
      ayuda: "Te afectan las discusiones o la tensión social dentro de tu grupo de estudio o clase.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 14, texto: "Poder asistir a todas las clases.",
      ayuda: "Piensas en la presión que sientes por cumplir con la asistencia obligatoria y no perderte ninguna explicación.", valor: 0 },
    
    { dim: 'Carga y Gestión', id: 15, texto: "Exceso de responsabilidad por cumplir obligaciones académicas.",
      ayuda: "Sientes que te exiges demasiado a ti mismo para ser el estudiante 'perfecto' y no fallar en nada.", valor: 0 },
    
    { dim: 'Evaluación y Desempeño', id: 16, texto: "Obtener notas elevadas en distintas asignaturas.",
      ayuda: "Te genera estrés la ambición o necesidad de sacar siempre calificaciones sobresalientes.", valor: 0 },
    
    { dim: 'Expectativas y Futuro', id: 17, texto: "Perspectivas profesionales futuras.",
      ayuda: "Te provoca estrés pensar en si encontrarás trabajo o si serás un buen profesional.", valor: 0 },
    
    { dim: 'Expectativas y Futuro', id: 18, texto: "Elección de materias durante la carrera.",
      ayuda: "Sientes tensión al tener que decidir qué camino tomar y el miedo a equivocarte de asignatura.", valor: 0 },
    
    { dim: 'Expectativas y Futuro', id: 19, texto: "Mantener o conseguir una beca para estudiar.",
      ayuda: "Analiza la presión económica y académica de depender de una nota mínima para seguir estudiando.", valor: 0 },
    
    { dim: 'Expectativas y Futuro', id: 20, texto: "Acabar la carrera en los plazos estipulados.",
      ayuda: "Sientes la presión del tiempo por graduarte 'cuando toca' y no retrasarte en comparación con otros.", valor: 0 },
    
    { dim: 'Expectativas y Futuro', id: 21, texto: "Presión familiar por obtener resultados adecuados.",
      ayuda: "Te estresa lo que tus padres o familia esperan de ti y de tus calificaciones.", valor: 0 }
  ];

  seleccionarOpcionCEAU(p: any, v: number) {

    if (this.procesando)
      return;

    this.procesando = true;

    if ((this.indiceCEAU === this.preguntasCEAU.length - 1) && p.valor !== undefined && p.valor !== null){
      if (this.historialAnalisisFacialCNN.length === this.preguntasCEAU.length) {
        this.historialAnalisisFacialCNN.pop();
        this.historialAnalisisFacialFaceMesh.pop();
      }
    }

    if (p.valor)
      this.registroCEAU[p.dim] -= p.valor;

    p.valor = v;
    this.registroCEAU[p.dim] += v;

    setTimeout(() => {
      this.capturarYAnalizar();
      if (this.indiceCEAU < this.preguntasCEAU.length - 1) {
        this.indiceCEAU++;
      } else {
        this.infoCEAU = true;
        this.calcularResultadoCEAU();
      }
      this.procesando = false;
    }, 300);
  }

  calcularResultadoCEAU() {
    const conteoCateg = this.preguntasCEAU.reduce((acc, p) => { acc[p.dim] = (acc[p.dim] || 0) + 1; return acc; }, {} as any);
    const data = {
      identificador: 'CEAU',
      puntajeFinal: this.preguntasCEAU.reduce((a, b) => a + b.valor, 0),
      categorias: this.registroCEAU,
      nPreguntasCategoria: conteoCateg,
      tiempo: 400,
      uid: this.authService.currentUser?.uid
    };
    this.enviarAlBackend(data, 'CEAU');
  }

  ///////// SISCO - Inventario Sistémico Cognoscitivista para el estudio del estrés académico

  public indiceSisco = -1;
  public siscoNivelGeneral: number = 0;
  public infoSISCO: boolean = false;

  get progresoSisco(): number {
    if (this.preguntasSisco.length === 0)
      return 0;
    const actual = this.indiceSisco === -1 ? 0 : this.indiceSisco + 1;
    return (actual / this.preguntasSisco.length) * 100;
  }

  anteriorSISCO() {
    if (this.indiceSisco > 0){
      this.indiceSisco--;
      this.historialAnalisisFacialCNN.pop();
      this.historialAnalisisFacialFaceMesh.pop();
    }
    else {
      this.indiceSisco = -1;
    }
  }

  public registroSISCO: any = {
    'Nivel General': 0,
    'Estresores': 0,
    'Síntomas': 0,
    'Afrontamiento': 0
  };
  public escalaSisco = [
    'Nunca',
    'Casi nunca',
    'Rara vez',
    'Algunas veces',
    'Casi siempre',
    'Siempre'
  ];
  
  public preguntasSisco = [
    // DIMENSIÓN ESTRESORES
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La sobrecarga de tareas y trabajos académicos que tengo que realizar todos los días.',
      ayuda: "Sientes que la cantidad de asignaciones supera tu capacidad o el tiempo disponible para terminarlos.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La personalidad y el carácter de los/as profesores/as que me imparten clases.',
      ayuda: "La forma de ser de algún docente te genera incomodidad, miedo o malestar.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La forma de evaluación de mis profesores/as (a través de ensayos, trabajos de investigación, búsquedas en Internet, etc.)',
      ayuda: "Te genera ansiedad la metodología o el tipo de instrumentos que se usan para calificar tu desempeño.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El nivel de exigencia de mis profesores/as.',
      ayuda: "Consideras que los profesores piden demasiado o que sus estándares son muy difíciles de alcanzar.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El tipo de trabajo que me piden los profesores (consulta de temas, fichas de trabajo, ensayos, mapas conceptuales, etc.)',
      ayuda: "Sientes estrés o dificultad por el formato de las tareas que debes entregar constantemente.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Tener tiempo limitado para hacer el trabajo que me encargan los/as profesores/as.',
      ayuda: "Te estresa sentir que los plazos de entrega son demasiado cortos para la complejidad de la asignación.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La poca claridad que tengo sobre lo que quieren los/as profesores/as.',
      ayuda: "Te causa estrés no entender las instrucciones o sentir que las expectativas del profesor son ambiguas.", valor: 0 },
    
    // DIMENSIÓN SÍNTOMAS    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Fatiga crónica (cansancio permanente).',
      ayuda: "Sientes que, aunque descanses, siempre estás sin fuerzas para empezar el día.", valor: 0 },

    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Sentimientos de depresión y tristeza (decaído).',
      ayuda: "Te sientes sin ánimos, con ganas de llorar o con una tristeza que no se va.", valor: 0 },

    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Ansiedad, angustia o desesperación.',
      ayuda: "Sientes un nudo en el pecho, falta de aire o una preocupación excesiva por lo que viene.", valor: 0 },

    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Problemas de concentración.',
      ayuda: "Te distraes con facilidad o te cuesta mucho entender lo que estás leyendo.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Sentimiento de agresividad o aumento de irritabilidad.',
      ayuda: "Sientes que pierdes la paciencia muy rápido o que cualquier cosa te hace enojar.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Conflictos o tendencia a polemizar o discutir.',
      ayuda: "Consideras que estás buscando peleas o discusiones con otros más de lo normal.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Desgano para realizar las labores académicas.',
      ayuda: "Sientes que no tienes ninguna motivación para abrir los libros o estudiar.", valor: 0 },

    // DIMENSIÓN AFRONTAMIENTO
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Concentrarse en resolver la situación que me preocupa.',
      ayuda: "Consideras que te pones manos a la obra para solucionar el problema.", valor: 0 },

    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Establecer soluciones concretas para resolver la situación que me preocupa.',
      ayuda: "Haces una lista de pasos reales que puedes seguir para que el problema desaparezca.", valor: 0 },

    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Analizar lo positivo y negativo de las soluciones pensadas para solucionar la situación que me preocupa.',
      ayuda: "Piensas bien los pros y contras antes de decidir cómo actuar frente al estrés.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Mantener el control sobre mis emociones para que no me afecte lo que me estresa.',
      ayuda: "Intentas estar frío y racional para que las emociones no te nublen el juicio.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Recordar situaciones similares ocurridas anteriormente y pensar en cómo las solucioné.',
      ayuda: "Consideras que usas tu experiencia pasada para darte cuenta de que ya has podido antes y podrás ahora.", valor: 0 },

    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Elaboración de un plan para enfrentar lo que me estresa y ejecución de sus tareas.',
      ayuda: "Diseñas una estrategia paso a paso y la sigues hasta terminar con lo que te preocupa.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Fijarse o tratar de obtener lo positivo de la situación que preocupa.',
      ayuda: "Intentas buscar el lado bueno o el aprendizaje incluso en los momentos difíciles.", valor: 0 }
  ];

  seleccionarOpcionSisco(valor: number) {

    if (this.indiceSisco === -1) {
      this.siscoNivelGeneral = valor; 
      this.registroSISCO['Nivel General'] = valor;
      this.indiceSisco = 0;
      this.procesando = false;
      return;
    }
    
    const preguntaActual = this.preguntasSisco[this.indiceSisco];

    if (this.procesando)
      return;

    this.procesando = true;

    if ((this.indiceSisco === this.preguntasSisco.length - 1) && preguntaActual.valor !== undefined && preguntaActual.valor !== null){
      if (this.historialAnalisisFacialCNN.length === this.preguntasSisco.length) {
        this.historialAnalisisFacialCNN.pop();
        this.historialAnalisisFacialFaceMesh.pop();
      }
    }

    if (preguntaActual.valor && preguntaActual.valor !== 0) 
      this.registroSISCO[preguntaActual.dim] -= preguntaActual.valor;

    preguntaActual.valor = valor;
    this.registroSISCO[preguntaActual.dim] += valor;

    setTimeout(() => {
      this.capturarYAnalizar();      
      if (this.indiceSisco < this.preguntasSisco.length - 1) {
        this.indiceSisco++;
      } else {
        this.infoSISCO = true;
        this.calcularResultadoSisco(); 
      }
      this.procesando = false;
    }, 300);
  }

  calcularResultadoSisco() {
    const conteoCateg = this.preguntasSisco.reduce((acc, p) => { acc[p.dim] = (acc[p.dim] || 0) + 1; return acc; }, {} as any);
    const data = {
      identificador: 'SISCO',
      puntaje: this.preguntasSisco.reduce((a, b) => a + b.valor, 0),
      categorias: this.registroSISCO,
      nPreguntasCategoria: conteoCateg,
      tiempo: 600,
      uid: this.authService.currentUser?.uid
    };
    this.enviarAlBackend(data, 'SISCO');
  }

  ///////// Inventario Sobre Vulnerabilidad al Estrés (Beech, Burns y Sheffield, 1982)

  public indiceBBS = 0;
  public infoBBS: boolean = false;

  get progresoBBS(): number {
    return (this.preguntasBBS.length > 0) ? ((this.indiceBBS + 1) / this.preguntasBBS.length) * 100 : 0;
  }

  anteriorBBS() {
    if (this.indiceBBS > 0){
      this.indiceBBS--;
      this.historialAnalisisFacialCNN.pop();
      this.historialAnalisisFacialFaceMesh.pop();
    }
  }

  public registroBBS: any = {
    'Síntomas Físicos': 0,
    'Fatiga y Alteraciones': 0,
    'Estado y Tensión': 0,
    'Reactividad': 0,
    'Toma de Decisiones': 0
  };
  public escalaBBS = [
    'No',
    'Sí'
  ];

  public preguntasBBS = [
    { dim: 'Síntomas Físicos', id: 1, texto: "Tendencia a sufrir frecuentes dolores de cabeza.",
      ayuda: "Notas que el dolor de cabeza aparece seguido, especialmente después de un día pesado o estresante.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 2, texto: "Sensación de estar constantemente en estado de tensión y de no hallarse nunca relajado.",
      ayuda: "Sientes que tu cuerpo está siempre 'alerta' o rígido, como si no pudieras soltar los hombros o descansar de verdad.", valor: 0 },
    
    { dim: 'Fatiga y Alteraciones', id: 3, texto: "Estar excesivamente cansado la mayor parte del tiempo; no sentirse lo suficientemente descansado y fresco después de dormir.",
      ayuda: "Despiertas sintiendo que no dormiste nada y arrastras el cansancio durante todo el día.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 4, texto: "Sensaciones de presión en la cabeza, como si se tuvieran gomas muy tensas alrededor de ella.",
      ayuda: "Identificas esa sensación de presión o apretón constante en la frente o la nuca.", valor: 0 },
    
    { dim: 'Fatiga y Alteraciones', id: 5, texto: "Sensación de falta de energía e impulso; necesidad de todas las reservas de energía para realizar las tareas ordinarias.",
      ayuda: "Sientes que hasta lo más sencillo te requiere un esfuerzo mental y físico enorme.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 6, texto: "Temblores, excesivo sudor, taquicardia.",
      ayuda: "Notas que tus manos tiemblan, sudas sin calor o sientes que el corazón se te acelera de repente.", valor: 0 },
    
    { dim: 'Fatiga y Alteraciones', id: 7, texto: "Problemas de sueño, pesadillas, sueño sin descansar.",
      ayuda: "Te cuesta quedarte dormido, te despiertas mucho o tienes sueños angustiantes.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 8, texto: "Sensación de ahogo y tensión sin razón para ello.",
      ayuda: "Sientes que te falta el aire o un nudo en la garganta sin que esté pasando algo malo en ese momento.", valor: 0 },
    
    { dim: 'Reactividad', id: 9, texto: "Llegar a la conclusión de que las situaciones nos superan demasiado fácilmente; hacer una montaña de un grano de arena.",
      ayuda: "Sientes que cualquier inconveniente pequeño te parece un desastre imposible de solucionar.", valor: 0 },
    
    { dim: 'Reactividad', id: 10, texto: "Darse cuenta de que los propios sentimientos se hieren con facilidad; ser excesivamente sensible.",
      ayuda: "Sientes que cualquier comentario o gesto de los demás te duele mucho o te lo tomas muy a pecho.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 11, texto: "Encontrar siempre algo por lo que preocuparse.",
      ayuda: "Cuando resuelves un problema, tu mente busca inmediatamente otro tema para estar intranquilo.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 12, texto: "Sentarse para tener un momento de relax y pensar en aspectos negativos del pasado y el futuro.",
      ayuda: "En lugar de descansar, usas tu tiempo libre para darle vueltas a lo que salió mal o a lo que te da miedo.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 13, texto: "Ser bastante consciente de los procesos del propio organismo; tales como latidos violentos del corazón, pinchazos, etc.",
      ayuda: "Estás demasiado atento a cualquier ruidito o sensación de tu cuerpo, como si algo fuera a fallar.", valor: 0 },
    
    { dim: 'Reactividad', id: 14, texto: "Reaccionar en exceso ante pequeños problemas diarios, tanto en casa como en el trabajo.",
      ayuda: "Explotas o te desesperas muy rápido por cosas sin importancia, como el tráfico o un plato sucio.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 15, texto: "Creer que sucederá lo peor, aún cuando el riesgo es muy pequeño; por ejemplo, no sentirse tranquilo hasta que toda la familia se encuentra, segura, en casa.",
      ayuda: "Sueles imaginar tragedias o accidentes catastróficos aunque todo esté en calma.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 16, texto: "Querer llamar a la oficina durante las vacaciones para asegurarse de que todo va bien.",
      ayuda: "Sientes que no puedes desconectarte de tus deberes por miedo a que algo salga mal si no estás vigilando.", valor: 0 },
    
    { dim: 'Reactividad', id: 17, texto: "Tomarse a nivel personal todo aquello que sale mal.",
      ayuda: "Te culpas por errores que no dependen de ti o sientes que el mundo está en tu contra.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 18, texto: "Experimentar sobresaltos cuando suena el teIéfono o se produce algún pequeño ruido extraño.",
      ayuda: "Saltas o te asustas mucho por ruidos comunes que antes no te molestaban.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 19, texto: "No ser capaz de concentrarse, en casa o en el trabajo; distraerse fácilmente por problemas irrelevantes y poco deseados.",
      ayuda: "Sientes que tu mente salta de una preocupación a otra y no te deja enfocarte en lo que estás haciendo.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 20, texto: "Experimentar oleadas de miedo, ansiedad o sensaciones de pánico sin razón aparente.",
      ayuda: "De pronto sientes un miedo intenso que te paraliza, aunque no haya un peligro real cerca.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 21, texto: "Encontrarse muy indeciso; emplear demasiado tiempo para tomar decisiones, dejando a un lado cosas que tienen que hacerse.",
      ayuda: "Te quedas 'trabado' pensando en qué elegir, hasta por cosas pequeñas.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 22, texto: "Sentir que se está perdiendo el control sobre muchas situaciones de la vida propia; que uno es víctima desvalida de las circunstancias.",
      ayuda: "Sientes que ya no manejas tu vida y que las cosas simplemente te pasan sin que puedas hacer nada.", valor: 0 }
  ];

  seleccionarOpcionBBS(p: any, v: number) {

    if (this.procesando)
      return;

    this.procesando = true;

    if ((this.indiceBBS === this.preguntasBBS.length - 1) && p.valor !== undefined && p.valor !== null){
      if (this.historialAnalisisFacialCNN.length === this.preguntasBBS.length) {
        this.historialAnalisisFacialCNN.pop();
        this.historialAnalisisFacialFaceMesh.pop();
      }
    }

    if (p.valor !== 0) {
      const prev = p.valor === 2 ? 1 : 0;
      this.registroBBS[p.dim] -= prev;
    }

    p.valor = v;
    const nuevo = v === 2 ? 1 : 0;
    this.registroBBS[p.dim] += nuevo;

    setTimeout(() => {
      this.capturarYAnalizar();      
      if (this.indiceBBS < this.preguntasBBS.length - 1) {
        this.indiceBBS++;
      } else {
        this.infoBBS = true;
        this.calcularResultadoBBS(); 
      }
      this.procesando = false;
    }, 300);
  }

  calcularResultadoBBS() {
    const conteoCateg = this.preguntasBBS.reduce((acc, p) => { acc[p.dim] = (acc[p.dim] || 0) + 1; return acc; }, {} as any);
    const data = {
      identificador: 'BBS',
      puntajeFinal: this.preguntasBBS.reduce((a, b) => a + (b.valor === 2 ? 1 : 0), 0),
      categorias: this.registroBBS,
      nPreguntasCategoria: conteoCateg,
      tiempo: 400,
      uid: this.authService.currentUser?.uid
    };
    this.enviarAlBackend(data, 'BBS');
  }

  ///////// Inventario de Síntomas de Estrés. Segunda versión - Arturo Barraza Macías

  public indiceISE = 0;
  public infoISE: boolean = false;

  get progresoISE(): number {
    return (this.preguntasISE.length > 0) ? ((this.indiceISE + 1) / this.preguntasISE.length) * 100 : 0;
  }

  anteriorISE() {
    if (this.indiceISE > 0){
      this.indiceISE--;
      this.historialAnalisisFacialCNN.pop();
      this.historialAnalisisFacialFaceMesh.pop();
    }
  }

  public registroISE: any = {
    'Síntomas Fisicos': 0,
    'Síntomas Psicológicos': 0,
    'Síntomas Comportamentales': 0
  };
  public escalaISE = [
    'Nunca',
    'Casi Nunca',
    'A veces',
    'Casi siempre'
  ];

  public preguntasISE = [
    { dim: 'Síntomas Físicos', id: 1, encabezado: 'Siento físicamente que...', texto: "Problemas Digestivos (indigestión, diarrea o estreñimiento).",
      ayuda: "Sientes molestias estomacales, pesadez o cambios en tu ritmo intestinal debido a la tensión académica.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 2, encabezado: 'Siento físicamente que...', texto: "Fatiga o cansancio crónico.",
      ayuda: "Sientes un agotamiento constante que no desaparece con el sueño, como si no tuvieras energía para estudiar.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 3, encabezado: 'Siento físicamente que...', texto: "Hiperventilación (respiración rápida).",
      ayuda: "Sientes que tu respiración se acelera de forma descontrolada cuando piensas en tus responsabilidades.", valor: 0 },
    
    { dim: 'Síntomas Físicos', id: 4, encabezado: 'Siento físicamente que...', texto: "Falta de aire o sensación de sofocación.",
      ayuda: "Experimentas una opresión en el pecho o la sensación de que te falta el aire ante una situación de estrés.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 5, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Disminución de la memoria.",
      ayuda: "Te cuesta recordar datos que ya sabías o sientes que se te borra la información al intentar estudiar.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 6, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Temor, Miedo o Pánico.",
      ayuda: "Sientes un miedo intenso o una sensación de peligro inminente ante evaluaciones o entregas.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 7, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Inquietud y Nerviosismo.",
      ayuda: "Estudiar para una prueba te genera un estado de alerta o nerviosismo constante.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 8, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Preocupación excesiva.",
      ayuda: "No puedes dejar de pensar en los posibles problemas académicos, incluso en tu tiempo libre.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 9, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Pensamiento catastrófico (todo va a salir mal).",
      ayuda: "Imaginas siempre el peor escenario posible, como reprobar, sin motivos reales.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 10, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Dificultad para concentrarse.",
      ayuda: "Te cuesta mantener la atención en una lectura o tarea por más de unos pocos minutos.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 11, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Lentitud de pensamiento.",
      ayuda: "Sientes que procesas la información más despacio de lo habitual o te cuesta reaccionar con rapidez.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 12, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Sensación de inseguridad.",
      ayuda: "Dudas de tus propias capacidades y conocimientos, aunque te hayas preparado correctamente.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 13, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Crisis de angustia o ansiedad.",
      ayuda: "Episodios intensos de malestar repentino que te hacen sentir desbordado por el estrés.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 14, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Irritabilidad, enojo o furia constante o descontrolada.",
      ayuda: "Te molestas con facilidad o respondes de forma agresiva ante situaciones pequeñas del entorno estudiantil.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 15, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Pensamiento desorientado.",
      ayuda: "Sientes confusión o dificultad para organizar tus ideas de manera lógica y coherente.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 16, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Sensación de tener la mente vacía.",
      ayuda: "Momentos en los que sientes que no puedes generar ningún pensamiento o idea, quedándote en blanco.", valor: 0 },
    
    { dim: 'Síntomas Psicológicos', id: 17, encabezado: 'Noto en mis pensamientos o emociones...', texto: "Bloqueo mental.",
      ayuda: "Incapacidad repentina para continuar con una tarea intelectual, a pesar de querer hacerlo.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 18, encabezado: 'He notado en mi conducta...', texto: "Deseos de gritar, golpear o insultar.",
      ayuda: "Sientes impulsos físicos de descargar tu frustración de manera violenta o ruidosa.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 19, encabezado: 'He notado en mi conducta...', texto: "Cambios de humor constantes.",
      ayuda: "Pasas de la tristeza a la euforia o al enojo en periodos cortos de tiempo sin causa aparente.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 20, encabezado: 'He notado en mi conducta...', texto: "Comer en exceso o dejar de hacerlo.",
      ayuda: "Tu apetito se ve alterado por el estrés: comes por ansiedad o se te cierra el estómago por completo.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 21, encabezado: 'He notado en mi conducta...', texto: "Tomar bebidas de contenido alcohólico.",
      ayuda: "Recurres al alcohol con más frecuencia como una vía de escape para aliviar la presión de los estudios.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 22, encabezado: 'He notado en mi conducta...', texto: "Fumar con mayor frecuencia.",
      ayuda: "Aumentas el consumo de tabaco o cigarrillos electrónicos para intentar calmar los nervios.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 23, encabezado: 'He notado en mi conducta...', texto: "Tendencia a ir de un lado a otro sin razón.",
      ayuda: "Caminar por la habitación o moverte constantemente porque no puedes quedarte quieto mientras estudias.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 24, encabezado: 'He notado en mi conducta...', texto: "Retraimiento o aislamiento de los demás.",
      ayuda: "Evitas el contacto con amigos o compañeros, prefiriendo encerrarte solo debido al agobio.", valor: 0 },
    
    { dim: 'Síntomas Comportamentales', id: 25, encabezado: 'He notado en mi conducta...', texto: "Apatía en la forma de vestir o arreglarse.",
      ayuda: "Has perdido el interés por tu apariencia personal o el cuidado de tu imagen debido al desánimo.", valor: 0 },
  ];

  seleccionarOpcionISE(p: any, v: number) {

    if (this.procesando)
      return;

    this.procesando = true;

    if ((this.indiceMiller === this.preguntasTestVulnerabilidad.length - 1) && p.valor !== undefined && p.valor !== null){
      if (this.historialAnalisisFacialCNN.length === this.preguntasTestVulnerabilidad.length) {
        this.historialAnalisisFacialCNN.pop();
        this.historialAnalisisFacialFaceMesh.pop();
      }
    }
  
    if (p.valor)
      this.registroISE[p.dim] -= p.valor;

    p.valor = v;
    this.registroISE[p.dim] += v;

    setTimeout(() => {
    this.capturarYAnalizar();      
      if (this.indiceISE < this.preguntasISE.length - 1) {
        this.indiceISE++;
      } else {
        this.infoISE = true;
        this.calcularResultadoISE(); 
      }
      this.procesando = false;
    }, 300);
  }

  calcularResultadoISE() {
    const conteoCateg = this.preguntasISE.reduce((acc, p) => { acc[p.dim] = (acc[p.dim] || 0) + 1; return acc; }, {} as any);
    const data = {
      identificador: 'ISE',
      puntajeFinal: this.preguntasISE.reduce((a, b) => a + b.valor, 0),
      categorias: this.registroISE,
      nPreguntasCategoria: conteoCateg,
      tiempo: 500,
      uid: this.authService.currentUser?.uid
    };
    this.enviarAlBackend(data, 'ISE');
  }

  ////////// Guardar Feedback de los cuestionarios

  async guardarFeedback(cuestionario: string, feedback: string) {
    if (!feedback || feedback.trim() === '') return;

      try {
        const colRef = collection(this.firestore, 'Feedbacks');
        
        await addDoc(colRef, {
          cuestionario: cuestionario,
          texto: feedback
        });

        alert('Feedback guardado con éxito.');
      } catch (error) {
        console.error('Error al guardar en Firebase:', error);
      }
  }

  ///////// Captura de imagenes para CNN y FaceMesh

  async capturarYAnalizar() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) 
      return;

    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imagenBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const [resCNN, resFaceMesh] = await Promise.all([
        this.capturaService.analizarEmocionCNN(imagenBase64),
        this.capturaService.analizarEmocionFaceMesh({ imagen: imagenBase64, puntos: [] })
      ]);
      const metadata = { pregunta_id: this.obtenerIndiceActual(), timestamp: new Date().toISOString() };
      this.historialAnalisisFacialCNN.push({ ...resCNN, ...metadata });
      this.historialAnalisisFacialFaceMesh.push({ ...resFaceMesh, ...metadata });
    } catch (e) {
        console.error(e); 
      }
  }

  obtenerIndiceActual(): number {
    switch (this.testSeleccionado) {
      case 'miller': return this.indiceMiller;
      case 'ceau': return this.indiceCEAU;
      case 'sisco': return this.indiceSisco;
      case 'bbs': return this.indiceBBS;
      case 'ISE': return this.indiceISE;
      default: return -1;
    }
  }

  ///////// Enviar resultados al backend y Firebase
  private async finalizarYGuardarTodo(id: string, procesado: any) {
    const user = this.authService.currentUser;
    if (!user) return;
    try {
      const docRef = await this.authService.guardarResultadoCuestionario(user.uid, procesado);
      await this.authService.guardarAnalisisFacialCuestionario(user.uid, {
        identificador_cuestionario: id,
        resultado_id: docRef.id,
        historial_cnn: this.historialAnalisisFacialCNN,
        historial_facemesh: this.historialAnalisisFacialFaceMesh
      });
      alert(`Análisis ${id} completado.`);
      this.resetearVariables();
    } catch (e) {
      console.error(e);
      alert("Error al guardar resultados.");}
  }

  private enviarAlBackend(data: any, id: string) {
    const url = 'https://crojas3-detectoremociones.hf.space/api/resultados';
    this.http.post(url, data).subscribe({
      next: (res: any) => this.finalizarYGuardarTodo(id, res),
      error: (err) => console.error("Error backend:", err)
    });
  }
}