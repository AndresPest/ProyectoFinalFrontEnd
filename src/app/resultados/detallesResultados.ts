import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Chart, registerables } from 'chart.js';
import { trigger, transition, style, animate } from '@angular/animations';
Chart.register(...registerables);

interface Sugerencia {
  texto: string;
  imagen?: string;
  link?: string;
}

export const SUGERENCIAS: { [categoria: string]: Sugerencia[] } = {
  // Sugerencias para indicadores fisiologicos
  'Salud y Hábitos': [    // Miller
    { 
      texto: 'Establece una rutina de sueño regular de al menos 7 horas.',
      imagen: 'https://i.postimg.cc/m2PPFXGw/img1.png' 
    },
    { 
      texto: 'Reduce el consumo de cafeína y estimulantes después de las 4 PM.',
      imagen: 'https://i.postimg.cc/2jcqypgt/img2.png'
    },
    {
      texto: 'Bebe al menos 2 litros de agua al día y realiza una caminata o ejercicio fisico durante al menos 15min.',
      imagen: 'https://i.postimg.cc/CMPZ5y9X/img3.png'
    }
  ],'Síntomas': [   // SISCO
    { 
      texto: 'Practica la respiración diafragmática durante 5 minutos.',
      imagen: 'https://i.postimg.cc/8kKFc8xK/img4.png' 
    },
    { 
      texto: 'Si sientes tensión muscular, aplica calor local o toma una ducha tibia.',
      imagen: 'https://i.postimg.cc/YqvvmnHH/img8.png'
    },
    {
      texto: 'Realiza estiramientos suaves de cuello y hombros.',
      imagen: 'https://i.postimg.cc/5NXXF7Mk/img5.png' 
    }
  ],'Fatiga y Alteraciones': [   // BBS
    { 
      texto: 'Implementa pausas activas cada 90 minutos de trabajo.',
      imagen: 'https://i.postimg.cc/8P77rKSQ/img6.png'
    },
    { 
      texto: 'Evita el uso de pantallas 30 minutos antes de dormir.',
      imagen: 'https://i.postimg.cc/4NYYhLgR/img7.png'
    },
    {
      texto: 'Realiza una caminata ligera de 15 minutos al aire libre.',
      imagen: 'https://i.postimg.cc/X7rryHb7/img9.png'
    }
  ],'Síntomas Físicos': [   // BBS y ISE
    { 
      texto: 'Escucha a tu cuerpo; si los sintomas persisten, consulta a un profesional.',
      imagen: 'https://i.postimg.cc/gk1nyVzc/img10.png' 
    },
    { 
      texto: 'Practica la relajación muscular progresiva de Jacobson.',
      imagen: 'https://i.postimg.cc/KvCR7PGF/img11.png'
    }
  ],
  // Sugerencias para indicadores psicoemocionales
  'Bienestar y Autocuidado': [{
      texto: 'Dedica al menos 20 minutos al día a un pasatiempo que disfrutes.',
      imagen: 'https://i.postimg.cc/gk1nyVz8/img12.png'
    },{
      texto: 'Escribe tres cosas por las que estés agradecido hoy.',
      imagen: 'https://i.postimg.cc/k4j528Yn/img41.png'
    }],
  'Estado y Tensión': [{
      texto: 'Utiliza técnicas de Mindfulness para anclarte en el presente.',
      imagen: 'https://i.postimg.cc/JzJtps0Z/img13.png'
    },{
      texto: 'Escucha música relajante o sonidos de la naturaleza.',
      imagen: 'https://i.postimg.cc/kg8DT2GQ/img14.png'
    }],
  'Reactividad': [{
      texto: 'Antes de responder en momentos de ira, cuenta hasta diez y respira.',
      imagen: 'https://i.postimg.cc/Z530wWnL/img15.png'
    },{
      texto: 'Identifica los detonantes de tu estrés para anticiparte a ellos.',
      imagen: 'https://i.postimg.cc/kg8DT2Gp/img16.png'
    }],
  'Síntomas Psicológicos': [{
      texto: 'No te aisles; conversa sobre cómo te sientes con alguien de confianza.',
      imagen: 'https://i.postimg.cc/GpCtVbs1/img17.png'
    },{
      texto: 'Limita el tiempo de exposición a noticias negativas.',
      imagen: 'https://i.postimg.cc/GmY9X4tX/img18.png'
    }],
  // Sugerencias para indicadores de gestión y trabajo
  'Evaluación y Desempeño': [{
      texto: 'Define metas pequeñas y alcanzables para evitar la frustración.',
      imagen: 'https://i.postimg.cc/K8L401jp/img19.jpg'
    },{
      texto: 'Reconoce tus logros semanales, por pequeños que sean.',
      imagen: 'https://i.postimg.cc/t4P7Bs7Q/img20.png'
    }],
  'Carga y Gestión': [{
      texto: 'Usa la técnica Pomodoro (25 min trabajo / 5 min descanso).',
      imagen: 'https://i.postimg.cc/pdHr4P53/img21.png'
    },{
      texto: 'Aprende a delegar tareas que no requieren tu supervisión directa.',
      imagen: 'https://i.postimg.cc/VN8vpz0V/img22.png'
    }],
  'Expectativas y Futuro': [{
      texto: 'Céntrate en lo que puedes controlar hoy, no en la incertidumbre del mañana.',
      imagen: 'https://i.postimg.cc/zfrv6qRr/img23.png'
    },{
      texto: 'Divide tus proyectos grandes en pasos individuales mínimos.',
      imagen: 'https://i.postimg.cc/QMJCrvpj/img24.png'
    }],
  'Toma de Decisiones': [{
      texto: 'Evita tomar decisiones importantes cuando estés muy cansado o emocional.',
      imagen: 'https://i.postimg.cc/R0Lhz2cV/img25.png'
    },{
      texto: 'Haz una lista de pros y contras para visualizar mejor tus opciones.',
      imagen: 'https://i.postimg.cc/PqQJk0mx/img26.png'
    }],
  'Estabilidad y Gestión': [{
      texto: 'Organiza tu espacio de trabajo para reducir el ruido visual.',
      imagen: 'https://i.postimg.cc/9fY0jsG7/img27.png'
    },{
      texto: 'Establece límites claros entre tu vida laboral y personal.',
      imagen: 'https://i.postimg.cc/Ls35MGz5/img28.png'
    }],
  // Sugerencias para indicadores sociales y de entorno
  'Red de Apoyo': [{
      texto: 'Llama a un amigo o familiar con el que no hayas hablado hace tiempo.',
      imagen: 'https://i.postimg.cc/3wFNHzg4/img29.png'
    },{
      texto: 'Participa en actividades grupales o comunitarias.',
      imagen: 'https://i.postimg.cc/s24xRbpP/img30.png'
    }],
  'Comunicación y Relaciones': [{
      texto: 'Practica la escucha activa en tus conversaciones.',
      imagen: 'https://i.postimg.cc/W4wzPxMn/img31.png'
    },{
      texto: 'Expresa tus necesidades de forma asertiva, sin agresividad.',
      imagen: 'https://i.postimg.cc/43QyTjzw/img32.png'
    }],
  'Entorno': [{
      texto: 'Asegúrate de tener una iluminación adecuada en tu lugar de estancia.',
      imagen: 'https://i.postimg.cc/gJcJc4D3/img33.png'
    },{
      texto: 'Ventila los espacios cerrados durante al menos 10 minutos.',
      imagen: 'https://i.postimg.cc/RFCFCGRR/img34.png'
    }],
  'Síntomas Comportamentales': [{
      texto: 'Observa si has cambiado tus hábitos alimenticios por ansiedad.',
      imagen: 'https://i.postimg.cc/3RrRr913/img40.png'
    },{
      texto: 'Intenta mantener tus rutinas básicas incluso en días difíciles.',
      imagen: 'https://i.postimg.cc/gJM0xRt9/img35.png'
    }],
  // Sugerencias para indicadores de respuesta / afrontamiento
  'Estresores': [{
      texto: 'Identifica qué situaciones externas están drenando tu energía.',
      imagen: 'https://i.postimg.cc/26j6jTws/img36.png'
    },{
      texto: 'Aprende a decir "no" a compromisos que sobrecarguen tu agenda.',
      imagen: 'https://i.postimg.cc/j5q5qvXk/img37.png'
    }],
  'Afrontamiento': [{
      texto: 'Utiliza el humor como herramienta para aliviar la tensión.',
      imagen: 'https://i.postimg.cc/xCjCjg5Y/img39.png'
    },{
      texto: 'Practica la autocompasión: no seas tan duro contigo mismo.',
      imagen: 'https://i.postimg.cc/0Q5Q5Znv/img38.png'
    }],

};

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './detallesResultados.html',
  styleUrls: ['./detallesResultados.scss'],
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

export class DetalleResultadoComponent implements OnInit {

  public data = inject(MAT_DIALOG_DATA);
  public listaCategorias: string[] = [];
  imgZoomSelected: string | null = null;

  ngOnInit() {
    
    setTimeout(() => {
      this.crearGrafica('canvasCNN', this.data.historial_cnn, 'Análisis Facial (CNN)');
      this.crearGrafica('canvasFaceMesh', this.data.historial_facemesh, 'Análisis Facial (FaceMesh)');
    }, 100);

    if (this.data?.categorias) {
      this.listaCategorias = Object.keys(this.data.categorias || {});
      this.generarSugerencias();
    }
  }

  public categorias = Object.keys(this.data.categorias);
  public sugerenciasFiltradas: Sugerencia[] = [];

  generarSugerencias() {
    const resultados: Sugerencia[] = [];
    const categoriasProcesadas = new Set<string>();

    const fuentesPrioridad = [
      this.data.categoriaVulnerableLv3,
      this.data.categoriasAtencion,
      this.data.categoriaVulnerableLv2,
      this.data.categoriasResaltantes,
      this.data.categoriaVulnerableLv1
    ];

    fuentesPrioridad.forEach(fuente => {
      if (fuente) {
        const nombresCategorias = Array.isArray(fuente) ? fuente : Object.keys(fuente);

        nombresCategorias.forEach(cat => {
          if (SUGERENCIAS[cat] && !categoriasProcesadas.has(cat)) {
            resultados.push(...SUGERENCIAS[cat]); 
            categoriasProcesadas.add(cat);
          }
        });
      }
    });

    // Mostrar las primeras 6 sugerencias
    //this.sugerenciasFiltradas = resultados.slice(0, 6);
    this.sugerenciasFiltradas = resultados;

    if (this.sugerenciasFiltradas.length === 0) {
      this.sugerenciasFiltradas.push({
        texto: 'Mantén una hidratación adecuada y realiza pausas activas.'
      });
    }
  }

  crearGrafica(canvasId: string, historial: any[], titulo: string) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx || !historial) return;
    
    const traduccionEmociones: { [key: string]: string } = {
      'happy': 'Feliz',
      'sad': 'Triste',
      'angry': 'Enojado',
      'neutral': 'Neutral',
      'surprise': 'Sorprendido',
      'fear': 'Miedo',
      'disgust': 'Disgustado'
    };

    const conteo: { [key: string]: number } = {};
    historial.forEach(item => {
      const emocion = item.emocion;
      conteo[emocion] = (conteo[emocion] || 0) + 1;
    });

    const labelsIngles = Object.keys(conteo);

    const labelsEspanol = labelsIngles.map(label => traduccionEmociones[label] || label);

    const colores = labelsIngles.map(label => {
      const coloresMap: { [key: string]: string } = {
        'happy': '#4caf50',
        'sad': '#2196f3',
        'angry': '#f44336',
        'neutral': '#9e9e9e',
        'surprise': '#ffeb3b',
        'fear': '#ff863b'
      };
      return coloresMap[label] || '#bcbcbc';
    });

    const valores = Object.values(conteo);

    new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labelsEspanol,
          datasets: [{
            label: 'Veces detectada',
            data: valores,
            backgroundColor: colores,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { 
              display: true, 
              text: titulo,
              font: { size: 16 }
            }
          }
        }
      });
  }
  
  getMaximo(nombreTest: string): number {
    const mapeo = {
      'Salud y Hábitos': 40,
      'Síntomas': 42,
      'Fatiga y Alteraciones': 3,
      'Síntomas Físicos': 5,  // SISCO
      'Síntomas Fisicos': 16,  // ISE
      'Bienestar y Autocuidado': 20,
      'Estado y Tensión': 6,
      'Reactividad': 4,
      'Síntomas Psicológicos': 52,
      'Evaluación y Desempeño': 20,
      'Carga y Gestión': 30,
      'Expectativas y Futuro': 25,
      'Toma de Decisiones': 4,
      'Estabilidad y Gestión': 10,
      'Red de Apoyo': 20,
      'Comunicación y Relaciones': 10,
      'Entorno': 30,
      'Síntomas Comportamentales': 32,
      'Estresores': 42,
      'Afrontamiento': 42,
      'Nivel General': 5
    };
    return (mapeo as any)[nombreTest];
  }
}
