import { Component, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { FaceMesh, Results } from '@mediapipe/face_mesh';
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

  private ultimosLandmarks: { x: number; y: number; z: number }[][] | null = null;

  public ultimoRecorteBase64: string | null = null;

  public cargando = false;
  public resultado: any = null;
  public mensaje: string = '';
  public tiempo: string = '00:00';

  private urlAPI = 'https://crojas3-detectoremociones.hf.space/api/emocion-cnn';

  async ngAfterViewInit() {
    const faceMesh = new FaceMesh({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
    });

    faceMesh.onResults((res: Results) => {
      this.ultimosLandmarks = res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0
        ? res.multiFaceLandmarks
        : null;

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

  private calcularBoundingBox(
    landmarks: { x: number; y: number; z: number }[],
    anchoCanvas: number,
    altoCanvas: number,
    margen: number = 0.15
  ): { x: number; y: number; w: number; h: number } | null {
    if (!landmarks || landmarks.length === 0) return null;

    let minX = 1, minY = 1, maxX = 0, maxY = 0;

    for (const p of landmarks) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    let x = minX * anchoCanvas;
    let y = minY * altoCanvas;
    let w = (maxX - minX) * anchoCanvas;
    let h = (maxY - minY) * altoCanvas;

    const mx = w * margen;
    const my = h * margen;

    x = Math.max(0, Math.floor(x - mx));
    y = Math.max(0, Math.floor(y - my));
    w = Math.min(anchoCanvas - x, Math.ceil(w + mx * 2));
    h = Math.min(altoCanvas - y, Math.ceil(h + my * 2));

    if (w <= 0 || h <= 0) return null;

    return { x, y, w, h };
  }

  private recortarRostroDelCanvas(
    canvasOrigen: HTMLCanvasElement,
    margen: number = 0.15
  ): HTMLCanvasElement | null {
    if (!this.ultimosLandmarks || this.ultimosLandmarks.length === 0) {
      return null;
    }

    let mejorBox: { x: number; y: number; w: number; h: number } | null = null;
    let mejorArea = 0;

    for (const cara of this.ultimosLandmarks) {
      const box = this.calcularBoundingBox(cara, canvasOrigen.width, canvasOrigen.height, margen);
      if (!box) continue;
      const area = box.w * box.h;
      if (area > mejorArea) {
        mejorArea = area;
        mejorBox = box;
      }
    }

    if (!mejorBox) return null;

    const canvasRecorte = document.createElement('canvas');
    canvasRecorte.width = mejorBox.w;
    canvasRecorte.height = mejorBox.h;
    const ctx = canvasRecorte.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      canvasOrigen,
      mejorBox.x, mejorBox.y, mejorBox.w, mejorBox.h,
      0, 0, mejorBox.w, mejorBox.h
    );

    return canvasRecorte;
  }

  enviarImagenAlDetectorEstres() {
    this.cargando = true;
    const canvas = this.canvasRef.nativeElement;

    let canvasEnvio: HTMLCanvasElement = canvas;

    try {
      const recorte = this.recortarRostroDelCanvas(canvas, 0.09);

      if (recorte) {
        canvasEnvio = recorte;
        this.ultimoRecorteBase64 = recorte.toDataURL('image/jpeg', 0.9);
        console.log('✅ Rostro recortado desde landmarks:', recorte.width, 'x', recorte.height);
      } else {
        console.warn('⚠️ Sin landmarks. Se envía el frame completo como fallback.');
      }
    } catch (e) {
      console.error('Error al recortar rostro:', e);
    }

    const imgB64 = canvasEnvio.toDataURL('image/jpeg', 0.9).split(',')[1];

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