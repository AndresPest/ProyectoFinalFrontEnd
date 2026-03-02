import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // 👈 Necesario para router-outlet
import { NavbarComponent } from '../navbar/navbar'; // 👈 Importa tu navbar real
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-face-mesh',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    RouterModule,    // 👈 Agrégalo aquí
    NavbarComponent  // 👈 Agrégalo aquí
  ],
  templateUrl: './face-mesh.html',
  styleUrls: ['./face-mesh.scss']
})
export class FaceMeshComponent implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  public cargando = false;
  public resultado: any = null;
  public mensaje: string = '';
  public tiempo: string = '00:00'; // Para tu contador de tiempo

  private urlAPI = 'https://crojas3-detectoremociones.hf.space/api/emocion-cnn';

  async ngAfterViewInit() {
    const faceMesh = new FaceMesh({ 
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` 
    });
    
    faceMesh.onResults(res => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);
    });

    const camera = new Camera(this.videoRef.nativeElement, {
      onFrame: async () => await faceMesh.send({image: this.videoRef.nativeElement}),
      width: 640, height: 480
    });
    camera.start();
  }

  enviarImagenAlDetectorEstres() {
    this.cargando = true;
    const canvas = this.canvasRef.nativeElement;
    const imgB64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    this.http.post<any>(this.urlAPI, { imagen: imgB64 }).subscribe({
      next: (res) => {
        this.resultado = res;
        this.mensaje = res.emocion;
        this.cargando = false;
        // Guardar en Firebase si hay usuario
        if (this.authService.currentUser) {
          this.authService.guardarResultadoFacial(this.authService.currentUser.uid, {
            modelo: 'CNN',
            emocion: res.emocion,
            confianza: res.confianza
          });
        }
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'Error de conexión';
      }
    });
  }
}