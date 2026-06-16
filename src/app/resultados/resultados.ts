import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { Navigation } from '../services/navigation';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DetalleResultadoComponent } from './detallesResultados';
import { Component, OnInit, inject, NgZone } from '@angular/core';
import { Firestore, collection, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface ResultadosCuestionario {
  id: string;
  usuario_id: string;
  identificador_cuestionario: string;
  puntaje_final: number;
  nivel_estres: string;
  categorias?: any;
  // Para Miller y Smith
  categoriaVulnerableLv1?: any;
  categoriaVulnerableLv2?: any;
  categoriaVulnerableLv3?: any;
  // Para CEAU y SISCO
  categoriasResaltantes?: any;
  categoriasAtencion?: any;
  timestamp: any;
  // Para la voz
  analisis_voz?: AnalisisVozGeneral | string;
  duracion?: number;
}

export interface AnalisisFacial {
  id: string;
  cuestionario_id: string;
  usuario_id: string;
  timestamp: any;
  historial_emocionInicialCNN: any[];
  historial_emocionInicialFaceMesh: any[];
  historial_cnn: any[];
  historial_facemesh: any[];
}

export interface AnalisisVozDetallado {
  nombre: string;
  porcentaje: number;
}

export interface AnalisisVozGeneral {
  emocion_dominante?: string;
  detalles_probabilidades?: AnalisisVozDetallado[];
}

interface ResultadoCompleto {
  id: string;
  identificador: string;
  puntaje: number;
  nivel: string;
  categorias?: any;
  // Para Miller y Smith
  categoriaVulnerableLv1?: any;
  categoriaVulnerableLv2?: any;
  categoriaVulnerableLv3?: any;
  // Para CEAU y SISCO
  categoriasResaltantes?: any;
  categoriasAtencion?: any;
  historial_emocionInicialCNN: any[];
  historial_emocionInicialFaceMesh: any[];
  historial_cnn: any[];
  historial_facemesh: any[];
  resultado_analisisInicialCNN: string;
  resultado_analisisInicialFaceMesh: string;
  resultado_cnn: string;
  resultado_facemesh: string;
  timestamp: string;
  // Para la voz
  tiene_voz: boolean;
  resultado_voz: string;
  detalles_voz_probabilidades: AnalisisVozDetallado[];
  duracion_voz: number;
}

const EMOCIONES: Record<string, string> = {
    'happy': 'Feliz',
    'sad': 'Triste',
    'angry': 'Enojado',
    'neutral': 'Neutral',
    'surprise': 'Sorprendido',
    'fear': 'Miedo',
    'disgust': 'Disgustado',
    'no definida': 'No Realizada'
};

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, NavbarComponent,RouterOutlet, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class ResultadosComponent implements OnInit {

  private dialog = inject(MatDialog);

  constructor(private router: Router) {
  }

  verDetalles(resultado: any) {
    this.dialog.open(DetalleResultadoComponent, {
      width: '800px',
      maxWidth: 'none',
      data: resultado,
      autoFocus: false
    });
  }

  private auth = inject(AuthService);
  private zone = inject(NgZone);

  listaResultados: any[] = [];
  loading = true;

  ngOnInit() {
    this.cargarDatos();
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }

  async cargarDatos() {
    this.loading = true;
    try {
      const datosCuestionario: ResultadosCuestionario[] = await this.auth.getResultadosCuestionarios();
      const datosFaciales: AnalisisFacial[] = await this.auth.getAnalisisFacialSesion();
      const resultadosCombinados: ResultadoCompleto[] = [];

      for (let resultadoCuestionario of datosCuestionario) {
        for (let analisisFacial of datosFaciales) {
          if (resultadoCuestionario.id === analisisFacial.cuestionario_id) {

            const tieneVozValida: boolean = !!(
              resultadoCuestionario.analisis_voz && 
              typeof resultadoCuestionario.analisis_voz === 'object' &&
              'emocion_dominante' in resultadoCuestionario.analisis_voz
            );

            const infoVoz = tieneVozValida ? (resultadoCuestionario.analisis_voz as AnalisisVozGeneral) : null;
            
            const resultadoCompleto: ResultadoCompleto = {
              id: resultadoCuestionario.id,
              identificador: resultadoCuestionario.identificador_cuestionario,
              puntaje: resultadoCuestionario.puntaje_final,
              nivel: resultadoCuestionario.nivel_estres,
              categorias: resultadoCuestionario.categorias,
              // Para Miller y Smith
              categoriaVulnerableLv1: resultadoCuestionario.categoriaVulnerableLv1,
              categoriaVulnerableLv2: resultadoCuestionario.categoriaVulnerableLv2,
              categoriaVulnerableLv3: resultadoCuestionario.categoriaVulnerableLv3,
              // Para CEAU y SISCO
              categoriasResaltantes: resultadoCuestionario.categoriasResaltantes,
              categoriasAtencion: resultadoCuestionario.categoriasAtencion,
              historial_emocionInicialCNN: analisisFacial.historial_emocionInicialCNN,
              historial_emocionInicialFaceMesh: analisisFacial.historial_emocionInicialFaceMesh,
              historial_cnn: analisisFacial.historial_cnn,
              historial_facemesh: analisisFacial.historial_facemesh,
              resultado_analisisInicialCNN: this.emocionDominante(analisisFacial.historial_emocionInicialCNN),
              resultado_analisisInicialFaceMesh: this.emocionDominante(analisisFacial.historial_emocionInicialFaceMesh),
              resultado_cnn: this.emocionDominante(analisisFacial.historial_cnn),
              resultado_facemesh: this.emocionDominante(analisisFacial.historial_facemesh),
              tiene_voz: tieneVozValida,
              resultado_voz: tieneVozValida && infoVoz?.emocion_dominante ? infoVoz.emocion_dominante : 'No definida',
              detalles_voz_probabilidades: tieneVozValida && infoVoz?.detalles_probabilidades ? infoVoz.detalles_probabilidades : [],
              duracion_voz: resultadoCuestionario.duracion || 0,
              timestamp: resultadoCuestionario.timestamp
            };
            resultadosCombinados.push(resultadoCompleto);
            console.log("Resultado Completo:", resultadoCompleto);
          }
        }
      }
      
      this.zone.run(() => {
        this.listaResultados = resultadosCombinados;
        this.loading = false;
      });

    } catch (error) {
      console.error("Error al cargar:", error);
      this.zone.run(() => this.loading = false);
    }
  }

  emocionDominante(historial: any[]): string {
    if (!historial || historial.length === 0)
      return "Arreglo Vacio";

    const frecuenciaEmociones: { [key: string]: number } = {};
    let modaEmocion = "";
    let maxFrecuencia = 0;

    for (const emocion of historial) {
      frecuenciaEmociones[emocion] = (frecuenciaEmociones[emocion] || 0) + 1;

      if (frecuenciaEmociones[emocion] > maxFrecuencia) {
        maxFrecuencia = frecuenciaEmociones[emocion];
        modaEmocion = emocion;
      }
    }
    return modaEmocion;
  }
    
  getCategorias(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object';
  }

  getMaximo(nombreTest: string): number {
    const mapeo = {
      'Test de Vulnerabilidad al Estrés - L.H. Miller y A.D. Smith': 80,
      'CEAU - Cuestionario de Estrés Académico en la Universidad': 105,
      'SISCO - Inventario Sistémico Cognoscitivista para el estudio del estrés académico': 5,
      'Inventario Sobre Vulnerabilidad al Estrés (Beech, Burns y Sheffield, 1982)': 22,
      'Inventario de Síntomas de Estrés. Segunda versión - Arturo Barraza Macías': 120
    };
    return (mapeo as any)[nombreTest];
  }

  traducirEmocion(emocion: string): string {
    if (!emocion) return 'Sin datos';
    return EMOCIONES[emocion.toLowerCase()];
  }
  
}