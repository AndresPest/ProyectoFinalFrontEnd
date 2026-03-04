import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar'; 
import { FaceMesh } from '@mediapipe/face_mesh';
import * as mp_face_mesh from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '../utils/drawing-utils';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-facemesh',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './facemesh.html',
  styleUrls: ['./facemesh.scss']
})
export class FaceMesh1Component implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  public cargando = false;
  public resultado: any = null;
  public mensaje: string = '';
  public tiempo: string = '00:00'; 
  private ultimosLandmarks: any = null;

  private urlAPI = 'https://crojas3-detectoremociones.hf.space/api/emocion-facemesh';

  async ngAfterViewInit() {
    const faceMesh = new FaceMesh({ 
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` 
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    faceMesh.onResults(res => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;
      
      // Limpiar y dibujar cámara
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

      if (res.multiFaceLandmarks && res.multiFaceLandmarks[0]) {
        this.ultimosLandmarks = res.multiFaceLandmarks[0];
        // Dibujar la malla verde (Tesselation)
        drawConnectors(ctx, this.ultimosLandmarks, mp_face_mesh.FACEMESH_TESSELATION, {
          color: '#00FF0070', 
          lineWidth: 1
        });
      }
    });

    const camera = new Camera(this.videoRef.nativeElement, {
      onFrame: async () => await faceMesh.send({image: this.videoRef.nativeElement}),
      width: 640, height: 480
    });
    camera.start();
  }

  enviarImagenAlDetectorEstres() {
    if (!this.ultimosLandmarks) {
      this.mensaje = "No se detecta rostro";
      return;
    }

    this.cargando = true;
    const canvas = this.canvasRef.nativeElement;
    const imgB64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    // Enviamos imagen + puntos (Landmarks)
    const body = { 
      imagen: imgB64, 
      puntos: this.ultimosLandmarks 
    };

    this.http.post<any>(this.urlAPI, body).subscribe({
      next: (res) => {
        this.resultado = res;
        this.mensaje = res.emocion;
        this.cargando = false;

        if (this.authService.currentUser) {
          this.authService.guardarResultadoFacial(this.authService.currentUser.uid, {
            modelo: 'FaceMesh-Landmarks',
            emocion: res.emocion,
            confianza: res.confianza
          });
        }
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'Error de conexión con la API';
      }
    });
  }
}