import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

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
export class StressQuestionnaireComponent {
  private authService = inject(AuthService);

  // --- CONFIGURACIÓN INICIAL ---
  public testSeleccionado: string | null = null;
  public listaCuestionarios: CuestionarioInfo[] = [
    { id: 1, nombre: 'Test de Vulnerabilidad al Estrés', identificador: 'miller', descripcion: 'Evalúa vulnerabilidad ante presiones cotidianas.', tiempoEstimado: '5 min' },
    { id: 2, nombre: 'Cuestionario de Estrés Académico (CEAU)', identificador: 'ceau', descripcion: 'Identifica estresores en el entorno universitario.', tiempoEstimado: '8 min' },
    { id: 3, nombre: 'Inventario SISCO', identificador: 'sisco', descripcion: 'Mide estresores, síntomas y afrontamiento.', tiempoEstimado: '10 min' }
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
  public preguntaActual: number = 0;
  public escalaTestVulnerabilidad = ['Nunca', 'Casi nunca', 'Rara vez', 'Algunas veces', 'Casi siempre', 'Siempre'];
  public preguntasTestVulnerabilidad = [
    { id: 1, texto: "Hago por lo menos una comida caliente y balanceada al día.", valor: null },
    { id: 2, texto: "Por lo menos cuatro noches a la semana duermo de 7 a 8 horas.", valor: null },
    { id: 3, texto: "Doy y recibo afecto regularmente.", valor: null },
    { id: 4, texto: "En 50 millas a la redonda poseo, por lo menos, un familiar en el que puedo confiar.", valor: null },
    { id: 5, texto: "Por lo menos dos veces a la semana hago ejercicios hasta sudar.", valor: null },
    { id: 6, texto: "Fumo menos de media cajetilla de cigarrillos al día.", valor: null },
    { id: 7, texto: "Tomo menos de 5 tragos (de bebida alcohólica) a la semana.", valor: null },
    { id: 8, texto: "Tengo el peso apropiado para mi estatura.", valor: null },
    { id: 9, texto: "Mis ingresos satisfacen mis gastos fundamentales.", valor: null },
    { id: 10, texto: "Mis creencias me hacen mas fuerte.", valor: null },
    { id: 11, texto: "Asisto regularmente a actividades sociales o del club.", valor: null },
    { id: 12, texto: "Tengo una red de amigos y conocidos.", valor: null },
    { id: 13, texto: "Tengo uno o más amigos a quienes puedo confiarle mis problemas personales.", valor: null },
    { id: 14, texto: "Tengo buena salud (vista, oido, dentadura, etc.).", valor: null },
    { id: 15, texto: "Soy capaz de hablar abiertamente sobre mis sentimientos.", valor: null },
    { id: 16, texto: "Converso regularmente sobre problemas domesticos.", valor: null },
    { id: 17, texto: "Por lo menos una vez a la semana hago algo para divertirme.", valor: null },
    { id: 18, texto: "Soy capaz de organizar racionalmente mi tiempo.", valor: null },
    { id: 19, texto: "Tomo menos de tres tazas de café al día.", valor: null },
    { id: 20, texto: "Durante el día me dedico a mi mismo un rato de tranquilidad.", valor: null }
  ];

  seleccionarOpcionTestVulnerabilidad(p: any, valor: number) {
    p.valor = valor;
    setTimeout(() => {
      if (this.preguntaActual < this.preguntasTestVulnerabilidad.length - 1) this.preguntaActual++;
    }, 300);
  }

  anteriorPregunta() { if (this.preguntaActual > 0) this.preguntaActual--; }

  get progresoTestVulnerabilidad(): number {
    return ((this.preguntaActual + 1) / this.preguntasTestVulnerabilidad.length) * 100;
  }

  async calcularResultadoTestVulnerabilidad() {
    const sumaTotal = this.preguntasTestVulnerabilidad.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    const user = this.authService.currentUser;
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
  public escalaCEAU = ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho'];
  public preguntasCEAU = [
    { id: 1, texto: "Realización de exámenes.", valor: null },
    { id: 2, texto: "Exposición de trabajo en clase.", valor: null },
    { id: 3, texto: "Intervención en el aula.", valor: null },
    { id: 4, texto: "Tratar con el profesor.", valor: null },
    { id: 5, texto: "Sobrecarga académica.", valor: null },
    { id: 6, texto: "Falta de tiempo.", valor: null }
    // Puedes agregar más aquí...
  ];

  seleccionarOpcionCEAU(p: any, valor: number) {
    p.valor = valor;
    setTimeout(() => {
      if (this.indiceCEAU < this.preguntasCEAU.length - 1) this.indiceCEAU++;
    }, 300);
  }

  anteriorCEAU() { if (this.indiceCEAU > 0) this.indiceCEAU--; }

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
  public siscoFiltroPasado: boolean = false;
  public mostrarResultadosFinales: boolean = false;
  public indiceSisco: number = 0;
  public escalaSisco = ['Nunca', 'Casi nunca', 'Rara vez', 'A veces', 'Casi siempre', 'Siempre'];
  public resultadosSisco: any = null;
  public preguntasSisco = [
    { dim: 'Estresores', encabezado: '¿Frecuencia de estrés por:', texto: 'Competencia con compañeros', valor: 0 },
    { dim: 'Estresores', encabezado: '¿Frecuencia de estrés por:', texto: 'Sobrecarga de tareas', valor: 0 },
    { dim: 'Síntomas', encabezado: '¿Frecuencia de:', texto: 'Dolores de cabeza', valor: 0 }
  ];

  validarFiltroSisco(respuesta: boolean) {
    if (!respuesta) this.volverAlMenu();
    else this.siscoFiltroPasado = true;
  }

  seleccionarOpcionSisco(valor: number) {
    this.preguntasSisco[this.indiceSisco].valor = valor;
    if (this.indiceSisco < this.preguntasSisco.length - 1) {
      setTimeout(() => this.indiceSisco++, 300);
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

  resetearTodoSisco() { this.volverAlMenu(); }
}