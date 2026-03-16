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
    { id: 3, nombre: 'Inventario SISCO', identificador: 'sisco', descripcion: 'Mide estresores, síntomas y afrontamiento.', tiempoEstimado: '10 min - 15 min' },
    { id: 4, nombre: 'Inventario sobre vulnerabilidad al estrés.', identificador: 'bbs', descripcion: 'Evalúa cuál es la predisposición del individuo a verse influenciado por los síntomas de estrés', tiempoEstimado: '10 min - 15 min' },
    { id: 5, nombre: 'Escala de Estresores Académicos', identificador: 'eea', descripcion: 'Valorar el grado en el que el estudiante percibe situaciones o circunstancias del contexto académico', tiempoEstimado: '15 min - 20 min' }
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
    this.indiceSisco = -1;
    this.indiceBBS = 0;
    this.indiceEEA = 0;
    this.mostrarResultadosFinales = false;
  }

  // --- LÓGICA TEST MILLER ---

  public escalaTestVulnerabilidad = [
    'Siempre', 
    'Casi siempre', 
    'Frecuentemente', 
    'Casi nunca', 
    'Nunca'
  ];

  /*
  Categorias para las preguntas Miller y Smith
  1. Salud y Hábitos: Salud física y hábitos de vida
  2. Bienestar y Autocuidado: Bienestar emocional y autocuidado
  3. Red de Apoyo: Red de apoyo social y familiar
  4. Comunicación y Relaciones: Comunicación y relaciones interpersonales
  5. Estabilidad y Gestión: Estabilidad y gestión externa
  */

  public preguntasTestVulnerabilidad = [
    { dim: 'Salud y Hábitos', id: 1, texto: "Hago por lo menos una comida caliente y balanceada al día.",
      ayuda: "Incluyes alimentos de diferentes grupos y si dedicas un tiempo exclusivo para sentarte a comer.", valor: 0 },
    { dim: 'Salud y Hábitos', id: 2, texto: "Por lo menos cuatro noches a la semana duermo de 7 a 8 horas.",
      ayuda: "Evalúa si logras un descanso profundo y continuo la mayoría de las noches para recuperar tu energía.", valor: 0 },
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

  public registroCategMillerSmith: any = {
    'Salud y Hábitos': 0,
    'Bienestar y Autocuidado': 0,
    'Red de Apoyo': 0,
    'Comunicación y Relaciones': 0,
    'Estabilidad y Gestión': 0
  };

  seleccionarOpcionTestVulnerabilidad(pregunta: any, valor: number) {
    if (pregunta.valor && pregunta.valor !== 0) {
      this.registroCategMillerSmith[pregunta.dim] -= pregunta.valor;
    }

    pregunta.valor = valor;
    this.registroCategMillerSmith[pregunta.dim] += valor;

    console.log(`Registro actualizado para ${pregunta.dim}:`, this.registroCategMillerSmith[pregunta.dim]);

    if (this.preguntaActual < this.preguntasTestVulnerabilidad.length - 1) {
      this.preguntaActual++;
    }
    this.capturarYAnalizar();
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
  const puntajeFinal = sumaTotal - 20;

  const detalleCategorias = { ...this.registroCategMillerSmith };

  const user = this.authService.currentUser;
  
  if (user) {
    try {
      await this.authService.guardarResultadoCuestionario(user.uid, {
        identificador: 'Miller',
        puntaje: puntajeFinal,
        tiempo: 300,
        categorias: detalleCategorias,
        fecha: new Date().toISOString()
      });
      alert("Test de Vulnerabilidad guardado con éxito.");
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      alert("Hubo un error al guardar los resultados.");
    }
  }

  this.volverAlMenu();
}

  /*async calcularResultadoTestVulnerabilidad() {
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
  }*/

  // --- LÓGICA TEST CEAU ---
  public indiceCEAU: number = 0;

  public escalaCEAU = [
    'Nada de estrés', 
    'Poco estrés', 
    'Algo de estrés', 
    'Bastante estrés', 
    'Mucho estrés'
  ];

  /*
  Categorias para las preguntas CEAU
  1. Evaluación y Desempeño: Evaluación y desempeño público
  2. Carga y Gestión: Carga de trabajo y gestión del tiempo
  3. Entorno: Entorno social e institucional
  4. Expectativas y Futuro: Expectativas y futuro profesional
  */
  
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

  public registroCEAU: any = {
    'Evaluación y Desempeño': 0,
    'Carga y Gestión': 0,
    'Entorno': 0,
    'Expectativas y Futuro': 0
  };

  seleccionarOpcionCEAU(pregunta: any, valor: number) {
    if (pregunta.valor && pregunta.valor !== 0) {
      this.registroCEAU[pregunta.dim] -= pregunta.valor;
    }

    pregunta.valor = valor;
    this.registroCEAU[pregunta.dim] += valor;

    console.log(`CEAU - Actualizado ${pregunta.dim}:`, this.registroCEAU[pregunta.dim]);

    if (this.indiceCEAU < this.preguntasCEAU.length - 1) {
      this.indiceCEAU++;
    }
    this.capturarYAnalizar();
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
  const sumaTotal = this.preguntasCEAU.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  
  const detalleCategorias: any = { ...this.registroCEAU };

  const datosParaGuardar: any = {
    identificador: 'CEAU',
    puntaje: sumaTotal,
    tiempo: 400,
    categorias: detalleCategorias,
    fecha: new Date().toISOString()
  };

  const user = this.authService.currentUser;
  
  if (user) {
    try {
      await this.authService.guardarResultadoCuestionario(user.uid, datosParaGuardar);
      alert("Cuestionario CEAU guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar CEAU:", error);
      alert("Error al guardar los resultados.");
    }
  }
  
  this.volverAlMenu();
}

  /*async calcularResultadoCEAU() {
    const suma = this.preguntasCEAU.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    const user = this.authService.currentUser;
    if (user) {
      await this.authService.guardarResultadoCuestionario(user.uid, {
        identificador: 'CEAU', puntaje: suma, tiempo: 400
      });
    }
    this.volverAlMenu();
  }*/

  // --- LÓGICA TEST SISCO ---
  public mostrarResultadosFinales: boolean = false;
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
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La competencia con mis compañeros del grupo',
      ayuda: "Consideras que sientes tensión al compararte con los demás o si el ambiente de rivalidad te agobia.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La sobrecarga de tareas y trabajos académicos que tengo que realizar todos los días.',
      ayuda: "Sientes que tienes demasiadas cosas pendientes y que no te da tiempo para terminar todo.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La personalidad y el carácter de los profesores que me imparten clases.',
      ayuda: "La forma de ser de algún docente te genera incomodidad, miedo o malestar.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La forma de evaluación de mis profesores/as (a través de ensayos, trabajos de investigación, búsquedas en Internet, etc.)',
      ayuda: "Te angustia el método que usan para calificarte.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El nivel de exigencia de mis profesores/as',
      ayuda: "Consideras que los profesores piden demasiado o que sus estándares son muy difíciles de alcanzar.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'El tipo de trabajo que me piden los profesores (consulta de temas, fichas de trabajo, ensayos, mapas conceptuales, etc.)',
      ayuda: "Sientes estrés o dificultad por el formato de las tareas que debes entregar constantemente.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Que me toquen profesores/as muy teóricos/as.',
      ayuda: "Te estresa que las clases no sean prácticas o que se basen solo en leer y escuchar teoría.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Mi participación en clase (responder a preguntas, hacer comentarios, etc.)',
      ayuda: "Te da nervios o estrés tener que hablar frente a todos o que el profesor te pregunte algo.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Tener tiempo limitado para hacer el trabajo que me encargan los/as profesores/as.',
      ayuda: "Sientes presión cuando las fechas de entrega son muy ajustadas y estas a contra reloj.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La realización de un examen.',
      ayuda: "Los nervios o estrés que sientes justo antes o durante una evaluación.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Exposición de un tema ante los compañeros de mi grupo.',
      ayuda: "Te resulta estresante ser el centro de atención al explicar un tema frente a la clase.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'La poca claridad que tengo sobre lo que quieren los/as profesores/as.',
      ayuda: "Sientes confusión o frustración cuando no entiendes las instrucciones de una asignación.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Que mis profesores/as estén mal preparados/as.',
      ayuda: "Te genera inseguridad o enojo sentir que el profesor no domina el tema que explica.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'Asistir a clases aburridas o monótonas.',
      ayuda: "La falta de dinamismo en clase te hace sentir desesperación o pérdida de tiempo.", valor: 0 },
    
    { dim: 'Estresores', encabezado: '¿Con qué frecuencia te estresa:', texto: 'No entender los temas que se abordan en la clase.',
      ayuda: "Te sientes abrumado cuando no logras seguir el hilo de lo que se explica en clases.", valor: 0 },
    
    // DIMENSIÓN SÍNTOMAS
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Trastornos en el sueño (insomnio o pesadillas).',
      ayuda: "Notas que te cuesta dormir por pensar en la universidad o tienes sueños agitados.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Fatiga crónica (cansancio permanente).',
      ayuda: "Sientes que, aunque descanses, siempre estás sin fuerzas para empezar el día.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Dolores de cabeza o migraña.',
      ayuda: "Sientes presión o dolor en la cabeza con frecuencia debido al estudio.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Problemas de digestión, dolor abdominal o diarrea.',
      ayuda: "Consideras que tu estómago reacciona con dolor o molestias cuando estás bajo mucha presión.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Rascarse, morderse las uñas, frotarse, etc.',
      ayuda: "Observa si realizas estos movimientos de forma nerviosa o sin darte cuenta cuando estás tenso.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Somnolencia o mayor necesidad de dormir.',
      ayuda: "Sientes que tu cuerpo te pide dormir a todas horas como una forma de escapar del cansancio mental.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Inquietud (incapacidad de relajarse y estar tranquilo).',
      ayuda: "Notas que te cuesta mucho quedarte quieto o apagar la mente para descansar de verdad.", valor: 0 },
    
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
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Aislamiento de los demás.',
      ayuda: "Notas que prefieres estar solo y evitas hablar con amigos o familia para no esforzarte socialmente.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Desgano para realizar las labores académicas.',
      ayuda: "Sientes que no tienes ninguna motivación para abrir los libros o estudiar.", valor: 0 },
    
    { dim: 'Síntomas', encabezado: '¿Con qué frecuencia se te presentan las siguientes reacciones:', texto: 'Aumento o reducción del consumo de alimentos.',
      ayuda: "Observas que el estrés te quita el hambre o te hace comer mucho más.", valor: 0 },

    // DIMENSIÓN AFRONTAMIENTO
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Habilidad asertiva (defender nuestras preferencias, ideas o sentimientos sin dañar a otros).',
      ayuda: "Consideras que logras decir 'no' o expresar lo que sientes con respeto para calmar tu estrés.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Escuchar música o distraerme viendo televisión.',
      ayuda: "Tienes algun modo de entretenimiento para desconectar tu mente de las preocupaciones académicas.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Concentrarse en resolver la situación que me preocupa.',
      ayuda: "Consideras que te pones manos a la obra para solucionar el problema.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Elogiar mi forma de actuar para enfrentar la situación que me preocupa (echarme porras).',
      ayuda: "Te dices palabras positivas a ti mismo para darte ánimos y confianza.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'La religiosidad (hacer oraciones o asistir a misa).',
      ayuda: "Consideras que buscas paz o guía a través de la fé o la oración.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Búsqueda de información sobre la situación que me preocupa.',
      ayuda: "Investigas más sobre el tema que te estresa para sentir que tienes el control.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Solicitar el apoyo de mi familia o de mis amigos.',
      ayuda: "Pides ayuda o compañía a tus seres queridos cuando te sientes sobrepasado.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Ventilación y confidencias (verbalización o plática de la situación que preocupa).',
      ayuda: "Consideras que te ayuda contarle tus problemas a alguien para sentirte más ligero.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Establecer soluciones concretas para resolver la situación que me preocupa.',
      ayuda: "Haces una lista de pasos reales que puedes seguir para que el problema desaparezca.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Analizar lo positivo y negativo de las soluciones pensadas para solucionar la situación que me preocupa.',
      ayuda: "Piensas bien los pros y contras antes de decidir cómo actuar frente al estrés.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Mantener el control sobre mis emociones para que no me afecte lo que me estresa.',
      ayuda: "Intentas estar frío y racional para que las emociones no te nublen el juicio.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Recordar situaciones similares ocurridas anteriormente y pensar en cómo las solucioné.',
      ayuda: "Consideras que usas tu experiencia pasada para darte cuenta de que ya has podido antes y podrás ahora.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Salir a caminar o hacer algún deporte.',
      ayuda: "Sientes que mover el cuerpo te ayuda a despejar la mente y disminuir el estrés.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Elaboración de un plan para enfrentar lo que me estresa y ejecución de sus tareas.',
      ayuda: "Diseñas una estrategia paso a paso y la sigues hasta terminar con lo que te preocupa.", valor: 0 },
    
    { dim: 'Afrontamiento', encabezado: '¿Con qué frecuencia para enfrentar tu estrés te orientas a:', texto: 'Fijarse o tratar de obtener lo positivo de la situación que preocupa.',
      ayuda: "Intentas buscar el lado bueno o el aprendizaje incluso en los momentos difíciles.", valor: 0 }
  ];

  public registroSISCO: any = {
    'Estresores': 0,
    'Síntomas': 0,
    'Afrontamiento': 0
  };

  seleccionarOpcionSisco(valor: number) {
    if (this.indiceSisco === -1) {
      this.siscoNivelGeneral = valor;
      this.indiceSisco = 0;
      return;
    }
    
    const preguntaActual = this.preguntasSisco[this.indiceSisco];

    if (preguntaActual.valor && preguntaActual.valor !== 0) {
      this.registroSISCO[preguntaActual.dim] -= preguntaActual.valor;
    }

    preguntaActual.valor = valor;
    this.registroSISCO[preguntaActual.dim] += valor;

    console.log(`SISCO - Actualizado ${preguntaActual.dim}:`, this.registroSISCO[preguntaActual.dim]);

    if (this.indiceSisco < this.preguntasSisco.length - 1) {
      this.indiceSisco++;
      this.capturarYAnalizar();
    }
  }

  public diagnosticoSISCO: any = {};

async calcularResultadoSisco() {
  const analisisCategorias: any = {};
  let sumaPuntajesParaTotal = 0;

  for (const dim in this.registroSISCO) {
    const puntosObtenidos = this.registroSISCO[dim];
    const totalPreguntas = this.preguntasSisco.filter(p => p.dim === dim).length;
    
    const puntosMaximos = totalPreguntas * 5; 
    const porcentaje = (puntosObtenidos / puntosMaximos) * 100;

    analisisCategorias[dim] = {
      puntos: puntosObtenidos,
      porcentaje: Number(porcentaje.toFixed(2)),
      nivel: porcentaje >= 66 ? 'Alto' : porcentaje >= 33 ? 'Moderado' : 'Leve'
    };
    
    sumaPuntajesParaTotal += porcentaje;
  }

  const promedioPorcentualTotal = Number((sumaPuntajesParaTotal / 3).toFixed(2));

  const datosParaGuardar: any = {
    identificador: 'SISCO',
    puntaje: promedioPorcentualTotal,
    tiempo: 600, 
    nivelGeneralFiltro: this.siscoNivelGeneral,
    categorias: analisisCategorias,
    fecha: new Date().toISOString()
  };

  const user = this.authService.currentUser;

  if (user) {
    try {
      await this.authService.guardarResultadoCuestionario(user.uid, datosParaGuardar);
      alert("Inventario SISCO guardado con éxito.");
    } catch (error) {
      console.error("Error al guardar SISCO:", error);
      alert("Error al conectar con la base de datos.");
    }
  }

  // 4. Actualizar estado local y navegar
  this.diagnosticoSISCO = analisisCategorias;
  this.mostrarResultadosFinales = true;
  this.volverAlMenu();
}

  anteriorSISCO() {
    if (this.indiceSisco > 0) {
      this.indiceSisco--;
    }else {
      this.indiceSisco = -1;
    }
  }

  mostrarPantallaResultados(datos: any) {
    this.resultadosSisco = datos;
    this.mostrarResultadosFinales = true;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetearTodoSisco() {
    this.testSeleccionado = null;
    this.mostrarResultadosFinales = false;
    this.indiceSisco = -1;
    this.resultadosSisco = null;
    
    this.preguntasSisco.forEach(p => p.valor = 0);
  }



  // --- LÓGICA TEST INVENTARIO SOBRE VULNERABILIDAD AL ESTRÉS (Beech, Burns y Sheffield, 1982) ---
  public indiceBBS: number = 0;

  public escalaBBS = [
    'Sí', 
    'No', 
  ];

  /*
  Categorias para las preguntas BBS
  1. Sintomas Fisicos: Síntomas físicos y somatización
  2. Fatiga y Alteraciones: Fatiga y alteraciones del sueño
  3. Estado y Tensión: Estado emocional y tensión cognitiva
  4. Reactividad: Reactividad y sensibilidad interpersonal
  5. Toma de Decisiones: Control y toma de decisiones
  */
  
  public preguntasBBS = [
    { dim: 'Sintomas Fisicos', id: 1, texto: "Tendencia a sufrir frecuentes dolores de cabeza.",
      ayuda: "Notas que el dolor de cabeza aparece seguido, especialmente después de un día pesado o estresante.", valor: 0 },
    
    { dim: 'Estado y Tensión', id: 2, texto: "Sensación de estar constantemente en estado de tensión y de no hallarse nunca relajado.",
      ayuda: "Sientes que tu cuerpo está siempre 'alerta' o rígido, como si no pudieras soltar los hombros o descansar de verdad.", valor: 0 },
    
    { dim: 'Fatiga y Alteraciones', id: 3, texto: "Estar excesivamente cansado la mayor parte del tiempo; no sentirse lo suficientemente descansado y fresco después de dormir.",
      ayuda: "Despiertas sintiendo que no dormiste nada y arrastras el cansancio durante todo el día.", valor: 0 },
    
    { dim: 'Sintomas Fisicos', id: 4, texto: "Sensaciones de presión en la cabeza, como si se tuvieran gomas muy tensas alrededor de ella.",
      ayuda: "Identificas esa sensación de presión o apretón constante en la frente o la nuca.", valor: 0 },
    
    { dim: 'Fatiga y Alteraciones', id: 5, texto: "Sensación de falta de energía e impulso; necesidad de todas las reservas de energía para realizar las tareas ordinarias.",
      ayuda: "Sientes que hasta lo más sencillo te requiere un esfuerzo mental y físico enorme.", valor: 0 },
    
    { dim: 'Sintomas Fisicos', id: 6, texto: "Temblores, excesivo sudor, taquicardia.",
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
    
    { dim: 'Sintomas Fisicos', id: 13, texto: "Ser bastante consciente de los procesos del propio organismo; tales como latidos violentos del corazón, pinchazos, etc.",
      ayuda: "Estás demasiado atento a cualquier ruidito o sensación de tu cuerpo, como si algo fuera a fallar.", valor: 0 },
    
    { dim: 'Reactividad', id: 14, texto: "Reaccionar en exceso ante pequeños problemas diarios, tanto en casa como en el trabajo.",
      ayuda: "Explotas o te desesperas muy rápido por cosas sin importancia, como el tráfico o un plato sucio.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 15, texto: "Creer que sucederá lo peor, aún cuando el riesgo es muy pequeño; por ejemplo, no sentirse tranquilo hasta que toda la familia se encuentra, segura, en casa.",
      ayuda: "Sueles imaginar tragedias o accidentes catastróficos aunque todo esté en calma.", valor: 0 },
    
    { dim: 'Toma de Decisiones', id: 16, texto: "Querer llamar a la oficina durante las vacaciones para asegurarse de que todo va bien.",
      ayuda: "Sientes que no puedes desconectarte de tus deberes por miedo a que algo salga mal si no estás vigilando.", valor: 0 },
    
    { dim: 'Reactividad', id: 17, texto: "Tomarse a nivel personal todo aquello que sale mal.",
      ayuda: "Te culpas por errores que no dependen de ti o sientes que el mundo está en tu contra.", valor: 0 },
    
    { dim: 'Sintomas Fisicos', id: 18, texto: "Experimentar sobresaltos cuando suena el teIéfono o se produce algún pequeño ruido extraño.",
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

  anteriorBBS() {
    if (this.indiceBBS > 0) {
      this.indiceBBS--;
    }
  }

  get progresoBBS(): number {
    return ((this.preguntaActual + 1) / this.preguntasBBS.length) * 100;
  }

  public registroBBS: any = {
    'Sintomas Fisicos': 0,
    'Fatiga y Alteraciones': 0,
    'Estado y Tensión': 0,
    'Reactividad': 0,
    'Toma de Decisiones': 0
  };

  seleccionarOpcionBBS(pregunta: any, valor: number) {
    if (pregunta.valor !== 0) {
      const puntoAnterior = pregunta.valor === 2 ? 1 : 0;
      this.registroBBS[pregunta.dim] -= puntoAnterior;
    }

    pregunta.valor = valor;

    const nuevoPunto = valor === 2 ? 1 : 0;
    this.registroBBS[pregunta.dim] += nuevoPunto;

    console.log(`BBS - Vulnerabilidad en ${pregunta.dim}: ${this.registroBBS[pregunta.dim]} puntos`);

    if (this.indiceBBS < this.preguntasBBS.length - 1) {
      this.indiceBBS++;
    }
    
    this.capturarYAnalizar();
  }

async calcularResultadoBBS() {
  // 1. Calculamos la suma total de puntos de vulnerabilidad
  // Recordando que en tu lógica: 1 = Sí (saludable), 2 = No (vulnerable)
  const puntosVulnerabilidadTotales = this.preguntasBBS.reduce((acc, p) => {
    return acc + (p.valor === 2 ? 1 : 0);
  }, 0);

  // 2. Preparamos el desglose por categorías
  // Ya tienes los acumuladores en 'this.registroBBS' gracias a seleccionarOpcionBBS
  const detalleCategorias = { ...this.registroBBS };

  // 3. Objeto de datos con casting 'any' para evitar el error de propiedades conocidas
  const datosParaGuardar: any = {
    identificador: 'BBS',
    puntaje: puntosVulnerabilidadTotales, // Total de indicadores de vulnerabilidad detectados
    tiempo: 400,
    categorias: detalleCategorias,
    fecha: new Date().toISOString()
  };

  const user = this.authService.currentUser;

  if (user) {
    try {
      await this.authService.guardarResultadoCuestionario(user.uid, datosParaGuardar);
      alert("Inventario de Vulnerabilidad BBS guardado con éxito.");
    } catch (error) {
      console.error("Error al guardar BBS:", error);
      alert("No se pudo guardar el resultado. Revisa tu conexión.");
    }
  }

  this.volverAlMenu();
}

  // --- LÓGICA TEST Escala de Estresores Académicos - Cabanach, Souto-Gestal y Franco, (2016) ---
  public indiceEEA: number = 0;

  public escalaEEA = [
    'Nunca', 
    'Alguna vez', 
    'Bastantes veces', 
    'Casi siempre', 
    'Siempre'
  ];

  /*
  Categorias para las preguntas EEA
  1. Deficiencia Metodologicas - Deficiencias metodológicas del profesorado
  2. Sobrecarga - Sobrecarga del estudiante
  3. Creencias Rendimiento - Creencias sobre el rendimiento académico
  4. Intervenciones - Intervenciones en público
  5. Clima Social - Clima social negativo
  6. Examenes - Exámenes
  7. Carencia Contenidos - Carencia de valor de los contenidos
  8. Dificultades Participacion - Dificultades de participación
  */
  
  public preguntasEEA = [
    { dim: 'Intervenciones', id: 1, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando me preguntan en clases.",
      ayuda: "Sientes presión o bloqueo cuando el profesor se dirige a ti directamente frente a los demás.", valor: 0 },
    
    { dim: 'Intervenciones', id: 2, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Si tengo que participar en clases.",
      ayuda: "Sientes estrés al levantar la mano o al decidir dar tu opinión en una charla grupal.", valor: 0 },
    
    { dim: 'Intervenciones', id: 3, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Al salir a la pizarra.",
      ayuda: "Consideras que te genera mucha tensión física o nervios tener que escribir o resolver algo frente a tus compañeros.", valor: 0 },
    
    { dim: 'Intervenciones', id: 4, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Al hacer una exposición o al hablar en público durante un cierto tiempo.",
      ayuda: "Evalúas el nivel de estrés que te provoca ser el centro de atención mientras explicas un tema largo.", valor: 0 },
    
    { dim: 'Examenes', id: 5, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Al hablar de los exámenes.",
      ayuda: "El simple hecho de mencionar las fechas de evaluación ya te genera preocupación o inquietud.", valor: 0 },
    
    { dim: 'Examenes', id: 6, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando tengo exámenes.",
      ayuda: "Sientes mucha presión el día que debes presentar la prueba o durante la realización de la misma.", valor: 0 },
    
    { dim: 'Examenes', id: 7, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Mientras me preparo para los exámenes.",
      ayuda: "Estudiar para una prueba te genera un estado de alerta o nerviosismo constante.", valor: 0 },
    
    { dim: 'Examenes', id: 8, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando se acercan las fechas de los exámenes.",
      ayuda: "Sientes que el estrés aumenta a medida que ves que faltan pocos días para la evaluación.", valor: 0 },
    
    { dim: 'Intervenciones', id: 9, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Si tengo que exponer en público una opinión.",
      ayuda: "Te da miedo ser juzgado por lo que piensas cuando hablas delante de mucha gente.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 10, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor da la clase de una manera determinada y luego nos examina de un modo poco coherente con esa forma de dar la clase.",
      ayuda: "Sientes frustración o inseguridad porque el examen no se parece en nada a lo que vieron en las clases.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 11, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando los profesores no se ponen de acuerdo entre ellos (manifiestan claras discrepancias entre ellos en temas académicos).",
      ayuda: "Te genera confusión que cada profesor diga cosas distintas sobre un mismo tema.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 12, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando no me queda claro cómo he de estudiar una materia.",
      ayuda: "Notas inquietud al no saber por dónde empezar o qué método usar para entender una asignatura difícil.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 13, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando no tengo claro qué exigen en las distintas materias.",
      ayuda: "Sientes estrés al no saber exactamente qué es lo que el profesor espera que aprendas o entregues.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 14, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando los profesores plantean trabajos, actividades o tareas que no tienen mucho que ver entre sí (que son incongruentes).",
      ayuda: "Te agobia sentir que las tareas son desorganizadas o que no tienen un objetivo claro.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 15, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor no plantea de forma clara qué es lo que tenemos que hacer.",
      ayuda: "Sientes estrés cuando las instrucciones de una asignación son vagas o difíciles de entender.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 16, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor plantea trabajos, actividades o tareas que son contradictorios entre sí.",
      ayuda: "Te genera tensión que te pidan cosas que se chocan o se anulan entre ellas.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 17, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando los distintos profesores esperan de nosotros cosas diferentes.",
      ayuda: "Sientes presión al intentar cumplir con las expectativas variadas y a veces opuestas de cada docente.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 18, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor espera de nosotros que sepamos cosas que no nos ha enseñado.",
      ayuda: "Te causa impotencia o nerviosismo de que te exijan conocimientos que nunca explicaron en clase.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 19, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor da por hecho que tenemos conocimientos que en realidad no tenemos.",
      ayuda: "Sientes inquietud cuando se avanza muy rápido asumiendo que ya sabes cosas que aún no dominas.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 20, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando el profesor plantea exámenes claramente incongruentes con lo estudiado/enseñado.",
      ayuda: "Sientes enojo o miedo al ver que en el examen preguntan cosas que no estaban en el programa de estudio.", valor: 0 },
    
    { dim: 'Deficiencia Metodologicas', id: 21, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Cuando existe una clara falta de coherencia entre los contenidos de las distintas materias.",
      ayuda: "Te estresa que las materias parezcan piezas sueltas que no encajan entre sí.", valor: 0 },
    
    { dim: 'Carencia Contenidos', id: 22, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Las asignaturas que cursamos tienen poco que ver con mis expectativas.",
      ayuda: "Sientes desmotivación o estrés al ver que la carrera no es lo que esperabas cuando te inscribiste.", valor: 0 },
    
    { dim: 'Carencia Contenidos', id: 23, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Las asignaturas que cursamos tienen escaso interés.",
      ayuda: "Consideras que te genera pesadez o inquietud tener que dedicar tiempo a temas que no te interesan nada.", valor: 0 },
    
    { dim: 'Carencia Contenidos', id: 24, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Lo que estoy estudiando tiene una escasa utilidad futura.",
      ayuda: "Te estresa sentir que estás perdiendo el tiempo en cosas que no usarás en tu vida profesional.", valor: 0 },
    
    { dim: 'Carencia Contenidos', id: 25, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Las clases a las que asisto son poco prácticas.",
      ayuda: "Notas frustración cuando sientes que todo es teoría y nunca ves cómo aplicar lo aprendido.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 26, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por no saber si mi ritmo de aprendizaje es el adecuado.",
      ayuda: "Sientes dudas o miedo de ir más lento que tus compañeros o de no estar aprendiendo bien.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 27, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el excesivo número de asignaturas que integran el plan de estudios de mi carrera.",
      ayuda: "Sientes agobio por la gran cantidad de materias que tienes que llevar al mismo tiempo.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 28, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque los resultados obtenidos en los exámenes no reflejan, en absoluto, mi trabajo anterior de preparación ni el esfuerzo desarrollado.",
      ayuda: "Consideras la impotencia de esforzarte mucho y aun así no ver buenos resultados en tus notas.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 29, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por las demandas excesivas y variadas que se me hacen.",
      ayuda: "Sientes que te exigen demasiado en muchas asignaturas y no sabes cómo cumplir con todo.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 30, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque rindo claramente por debajo de mis conocimientos.",
      ayuda: "Sientes frustración cuando sabes que conoces el tema, pero a la hora de la verdad no logras demostrarlo.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 31, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el escaso tiempo de que dispongo para estudiar adecuadamente las distintas materias.",
      ayuda: "Notas angustia cuando sientes que los días no tienen suficientes horas para cubrir todo el contenido de las asignaturas.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 32, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el cumplimiento de los plazos o fechas determinadas de las tareas encomendadas.",
      ayuda: "Te genera mucha tensión ver que las fechas límite de entrega se acercan rápido.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 33, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la excesiva cantidad de información que se me proporciona en clase, sin que se indique claramente lo fundamental.",
      ayuda: "Sientes confusión cuando te dan muchísimos contenido y no sabes qué es lo más importante para estudiar.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 34, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el excesivo tiempo que debo dedicarle a la realización de las actividades académicas.",
      ayuda: "Notas cansancio o inquietud porque la universidad consume casi todo tu tiempo personal.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 35, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no creo que pueda hacer frente a las exigencias de la carrera que estudio.",
      ayuda: "Consideras que tienes miedo de no ser capaz de terminar la carrera o de fallar en el camino.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 36, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no dispongo de tiempo para dedicarme a las materias todo lo necesario.",
      ayuda: "Sientes que tus estudios requieren más tiempo del que realmente puedes darles.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 37, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no creo que pueda lograr los objetivos propuestos.",
      ayuda: "Te genera inseguridad dudar de tus propias metas académicas.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 38, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la excesiva carga de trabajo que debo atender.",
      ayuda: "Sientes que la cantidad de asignaciones es una montaña que no dejas de escalar.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 39, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el excesivo número de horas de clase diarias que tengo.",
      ayuda: "Consideras que te agota mentalmente pasar demasiadas horas sentado asistiendo a clases.", valor: 0 },
    
    { dim: 'Sobrecarga', id: 40, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por el ritmo de trabajo o estudio que se nos exige.",
      ayuda: "Sientes que el nivel de rapidez que exige la facultad es muy difícil de seguir sin estresarte.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 41, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque desconozco si mi progreso académico es adecuado.",
      ayuda: "Notas estrés al no tener retroalimentación de si estás avanzando bien o si estás fallando.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 42, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no sé cómo hacer bien las cosas.",
      ayuda: "Consideras que te genera dudas o nervios el sentirte perdido sobre cómo realizar correctamente tus asignaciones.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 43, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no sé qué hacer para que se reconozca mi esfuerzo y mi trabajo.",
      ayuda: "Sientes frustración cuando notas que tu dedicación no es valorada por los profesores.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 44, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no tengo claro cómo conseguir que se valore mi dominio de las materias.",
      ayuda: "Piensas que te estresa no poder demostrar lo mucho que sabes sobre un tema.", valor: 0 },
    
    { dim: 'Dificultades Participacion', id: 45, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no tengo posibilidad alguna o muy escasa de dar mi opinión sobre la metodología de enseñanza de las materias del plan de estudios.",
      ayuda: "Sientes impotencia al sentir que no puedes cambiar la forma en que te enseñan, aunque no te funcione.", valor: 0 },
    
    { dim: 'Creencias Rendimiento', id: 46, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no sé qué hacer para que se reconozca mi valía personal.",
      ayuda: "Consideras que te genera tristeza o inquietud que tu valor como persona parezca depender solo de tus notas.", valor: 0 },
    
    { dim: 'Dificultades Participacion', id: 47, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque las posibilidades de opinar sobre el procedimiento de evaluación de las asignaturas del plan de estudios son muy escasas o nulas.",
      ayuda: "Notas malestar al sentir que no tienes voz ni voto sobre cómo te califican.", valor: 0 },
    
    { dim: 'Dificultades Participacion', id: 48, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Porque no está en mi mano plantear los trabajos, tareas o actividades como me gustaría.",
      ayuda: "Sientes frustración por no tener libertad creativa para sugerir otros tipos de evaluaciones.", valor: 0 },
    
    { dim: 'Clima Social', id: 49, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por los conflictos en las relaciones con otras personas (profesores, compañeros).",
      ayuda: "Evalúa qué tanto te afectan las peleas o tensión con la personas de la universidad.", valor: 0 },
    
    { dim: 'Clima Social', id: 50, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la excesiva competitividad existente en clase.",
      ayuda: "Sientes tensión en un ambiente donde todos parecen querer ser mejores que los demás.", valor: 0 },
    
    { dim: 'Clima Social', id: 51, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la falta de apoyo de los profesores.",
      ayuda: "Consideras que te sientes solo o desprotegido cuando un profesor no te brinda la ayuda que necesitas.", valor: 0 },

    { dim: 'Clima Social', id: 52, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la falta de apoyo de los compañeros.",
      ayuda: "Sientes tristeza o aislamiento si notas que no puedes contar con tus compañeros de clase.", valor: 0 },
    
    { dim: 'Clima Social', id: 53, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la ausencia de un buen ambiente en clase.",
      ayuda: "Un mal entorno de clases hace que ir a estudiar sea una experiencia estresante.", valor: 0 },
    
    { dim: 'Clima Social', id: 54, encabezado: 'Me pongo nervioso o me inquieto...', texto: "Por la existencia de favoritismos en clase.",
      ayuda: "Sientes enojo o injusticia al notar que algunos reciben mejor trato que otros sin razón clara.", valor: 0 },
  ];

  anteriorEEA() {
    if (this.indiceEEA > 0) {
      this.indiceEEA--;
    }
  }

  get progresoEEA(): number {
    return ((this.preguntaActual + 1) / this.preguntasEEA.length) * 100;
  }

  public registroEEA: any = {
    'Sintomas Fisicos': 0,
    'Sobrecarga': 0,
    'Creencias Rendimiento': 0,
    'Intervenciones': 0,
    'Clima Social': 0,
    'Examenes': 0,
    'Carencia Contenidos': 0,
    'Dificultades Participacion': 0
  };

  seleccionarOpcionEEA(pregunta: any, valor: number) {
    if (pregunta.valor && pregunta.valor !== 0) {
      this.registroEEA[pregunta.dim] -= pregunta.valor;
    }

    pregunta.valor = valor;
    this.registroEEA[pregunta.dim] += valor;

    console.log(`EEA - Actualizado ${pregunta.dim}:`, this.registroEEA[pregunta.dim]);

    if (this.indiceEEA < this.preguntasEEA.length - 1) {
      this.indiceEEA++;
    }
    this.capturarYAnalizar();
  }

  public resultadosECEA: any = {};

async calcularResultadoEEA() {
  const diagnosticoCategorias: any = {...this.registroEEA};
  let sumaPromedios = 0;
  let conteoDimensiones = 0;

  // 1. Procesar cada dimensión para obtener el promedio de intensidad
  for (const dim in this.registroEEA) {
    const puntosObtenidos = this.registroEEA[dim];
    const nPreguntas = this.preguntasEEA.filter(p => p.dim === dim).length;
    
    if (nPreguntas > 0) {
      const promedio = puntosObtenidos / nPreguntas;
      
      diagnosticoCategorias[dim] = {
        puntos: puntosObtenidos,
        promedio: Number(promedio.toFixed(2)),
        intensidad: promedio >= 4.0 ? 'Muy Alta' : 
                    promedio >= 3.0 ? 'Alta' : 
                    promedio >= 2.0 ? 'Moderada' : 'Baja'
      };

      sumaPromedios += promedio;
      conteoDimensiones++;
    }
  }

  // 2. Calculamos un puntaje global basado en el promedio de todas las dimensiones
  const puntajeGlobal = conteoDimensiones > 0 ? Number((sumaPromedios / conteoDimensiones).toFixed(2)) : 0;

  // 3. Objeto para Firebase con casting 'any'
  const datosParaGuardar: any = {
    identificador: 'EEA',
    puntaje: puntajeGlobal, // Representa la intensidad promedio general (1-5)
    tiempo: 500,
    categorias: diagnosticoCategorias,
    fecha: new Date().toISOString()
  };

  const user = this.authService.currentUser;

  if (user) {
    try {
      await this.authService.guardarResultadoCuestionario(user.uid, datosParaGuardar);
      alert("Escala de Estresores Académicos guardada con éxito.");
    } catch (error) {
      console.error("Error al guardar EEA:", error);
      alert("Error al guardar en la base de datos.");
    }
  }

  // 4. Actualizar estado local y navegar
  this.resultadosECEA = diagnosticoCategorias;
  this.mostrarResultadosFinales = true;
  this.volverAlMenu();
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


  analizarEstresVisual() {
    const deteccionesAltas = this.historialAnalisisFacialCNN.filter(d => 
      d.test === 'miller' && (d.emocion === 'Stress' || d.emocion === 'Anxiety')
    );

    console.log(`Durante el test de Miller, se detectó estrés visual ${deteccionesAltas.length} veces.`);
  }

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

    const resCNN = await this.capturaService.analizarEmocionCNN(imagenBase64);
    
    const resFaceMesh = await this.capturaService.analizarEmocionFaceMesh({
      imagen: imagenBase64,
      puntos: [] 
    });

    console.log("CNN:", resCNN.emocion);
    console.log("FaceMesh:", resFaceMesh.emocion);

    this.historialAnalisisFacialCNN.push({ ...resCNN, fecha: new Date() });
    this.historialAnalisisFacialFaceMesh.push({ ...resFaceMesh, fecha: new Date() });

  } catch (error) {
      console.error("Error en el análisis:", error);
    } finally {
      this.cargandoEstres = false;
    }
  }

}