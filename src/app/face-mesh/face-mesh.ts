import { Component, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-face-mesh',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './face-mesh.html',
  styleUrls: ['./face-mesh.scss'],
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
export class FaceMeshComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private camera: Camera | null = null;
  
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  public cargando = false;
  public resultado: any = null;
  public mensaje: string = '';
  public tiempo: string = '00:00';

  private urlAPI = 'https://crojas3-detectoremociones.hf.space/api/emocion-cnn';

  async ngAfterViewInit() {
    const faceMesh = new FaceMesh({ 
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` 
    });
    
    
    faceMesh.onResults(res => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;

      if (canvas.width !== res.image.width || canvas.height !== res.image.height) {
        canvas.width = res.image.width;
        canvas.height = res.image.height;
      }
      
      ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);
    });

    this.camera = new Camera(this.videoRef.nativeElement, {
      onFrame: async () => await faceMesh.send({
        image: this.videoRef.nativeElement
      }),
      width: 1280, height: 720
    });
    this.camera.start();
  }

  ngOnDestroy() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
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