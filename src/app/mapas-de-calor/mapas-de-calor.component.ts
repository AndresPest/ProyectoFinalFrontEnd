import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradcamService } from '../services/gradcam.service';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';

import { OnInit } from '@angular/core';
import { CapturaService } from '../services/captura.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mapas-de-calor',
  standalone: true,
  imports: [ CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: 'mapas-de-calor.component.html',
  styleUrls: ['mapas-de-calor.component.scss'],
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

export class MapasDeCalorComponent {
  activaciones: any = {};

  // 👇 aquí inyectas el servicio
  constructor(private http: HttpClient, public capturaService: CapturaService) {}

  obtenerActivaciones() {
    const imagenB64 = this.capturaService.getImagen(); // ahora sí existe
    if (!imagenB64) {
      console.warn('⚠️ No hay captura disponible');
      return;
    }

    this.http.post<any>('https://croxx312-reconocimientoemocional.hf.space/api/activaciones-color', { image: imagenB64 })
  .subscribe({
    next: res => {
      this.activaciones = res.activaciones;
    },
    error: err => console.error('Error al obtener activaciones', err)
  });

  }
}