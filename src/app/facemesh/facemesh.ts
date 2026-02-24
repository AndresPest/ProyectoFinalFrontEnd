import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as mp_face_mesh from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks, FACEMESH_IRISES } from '../utils/drawing-utils';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { CapturaService } from '../services/captura.service';



@Component({
  selector: 'app-facemesh',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: `facemesh.html`,
  styleUrl: 'facemesh.scss'
})
export class FaceMesh1Component implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  cargando = false;
  resultado: any = null;
  //VARIABLES NIVEL 2
  mensaje = '';
  porcentaje = '';
  nivelEstres = 'Alto';
  emocion = 'Neutro';
  tiempo = new Date().toLocaleTimeString();
  fuenteVideo = 'webcam';
  activarAnalisis = true;
  umbral = 0.6;
  historial = [
    { fecha: '24/07', nivel: 'Alto' },
    { fecha: '23/07', nivel: 'Moderado' }
  ];
  mostrarHeatmap = false;
  rutaHeatmap = 'assets/heatmap.png';

  constructor(private http: HttpClient, private capturaService: CapturaService) {}

  async ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const faceMesh = new FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(results => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // Dibuja la malla facial (triángulos)
          drawConnectors(ctx, landmarks, mp_face_mesh.FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
          // Dibuja los contornos (ojos, labios, cejas)
          drawConnectors(ctx, landmarks, mp_face_mesh.FACEMESH_CONTOURS, { color: '#00FF00', lineWidth: 2 });
          // Dibuja el iris (si refineLandmarks es true)
          drawConnectors(ctx, landmarks, FACEMESH_IRISES, { color: '#00afff', lineWidth: 1 });

        
          drawLandmarks(ctx, landmarks, { color: '#FF0000', radius: 1 });
        }
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => await faceMesh.send({ image: video }),
      width: 200,
      height: 200
    });
    camera.start();
  }

  enviarFrameAlBackend() {
    const canvas = this.canvasRef.nativeElement;
    const imagenB64 = canvas.toDataURL('image/jpeg').split(',')[1];

    this.http.post<any>('https://proyectofinalbackend-iuk0.onrender.com/api/face-mesh', { imagen: imagenB64 })
      .subscribe({
        next: res => {
          this.mensaje = `✅ Rostro detectado con ${res.puntos?.length || 0} puntos`;
          console.log(res.puntos);
        },
        error: err => {
          console.error('Error al contactar con backend:', err);
          this.mensaje = '❌ No se pudo contactar con el backend';
        }
      });
  }

  enviarImagenAlDetectorEstres() { 
    this.cargando = true;
    this.resultado = null;

    
    const canvas = this.canvasRef.nativeElement; 

    
    const imagenB64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    this.capturaService.setImagen(imagenB64);

    if (!imagenB64) {
    console.warn('⚠️ No hay captura disponible todavía');
    this.cargando = false;
    return;
    }
    
    
   this.http.post<any>('https://crojas3-detectoremociones.hf.space/api/emocion', { imagen: imagenB64 }) 
    .subscribe({ next: res => { 
      this.mensaje = `${res.emocion} (${(res.confianza).toFixed(1)}%)`; 
      this.porcentaje = (res.confianza * 100).toFixed(1); 
      this.resultado = res;
      this.cargando = false;  
    }, 
    error: err => { 
      console.error('❌ Error en detección de estrés', err); 
      this.mensaje = '❌ No se pudo analizar el estrés'; 
      this.cargando = false;
      } 
    }); 
  

  }

  procesarImagen(event: Event) {
  const archivo = (event.target as HTMLInputElement).files?.[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = () => {
    const imagenB64 = (lector.result as string).split(',')[1]; // elimina el encabezado data:image/...
    //this.enviarImagenAlDetectorEstres(imagenB64);
  };
  lector.readAsDataURL(archivo);
}

/*enviarImagenAlDetectorEstres(imagenB64: string) {
  
  this.http.post<any>('http://localhost:5000/api/emocion', { imagen: imagenB64 })
    .subscribe({
      next: res => {
        this.mensaje = `${res.emocion} (${(res.confianza * 100).toFixed(1)}%)`;
        this.porcentaje = (res.confianza * 100).toFixed(1);
      },
      error: err => {
        console.error('❌ Error en detección de estrés', err);
        this.mensaje = '❌ No se pudo analizar el estrés';
      }
    });
}*/




}