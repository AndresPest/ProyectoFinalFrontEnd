import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-ayuda',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, RouterModule],
  templateUrl: './ayuda.html',
  styleUrl: './ayuda.scss',
})
export class Ayuda {
  
  private dialogRef = inject(MatDialogRef<Ayuda>);
  
  constructor(private router: Router) {}

  contactos = [
    { 
      titulo: 'Linea de Emergencia', 
      subtitulo: 'Atención inmediata 24/7', 
      numero: '911', 
      icon: 'emergency', 
      clase: 'emergency-card' 
    },
    { 
      titulo: 'Cruz Roja Venezolana', 
      subtitulo: 'Atención inmediata 24/7', 
      numero: '+58 286 951 43 95', 
      icon: 'emergency', 
      clase: 'emergency-card' 
    },
    { 
      titulo: 'Federación Venezolana de Psicólogos', 
      subtitulo: 'Servicios de Apoyo Psicológico', 
      numero: '+58 424 290 73 38 / +58 424 290 73 34', 
      icon: 'psychology', 
      clase: 'local-card' 
    },
    { 
      titulo: 'Primeros Auxilios Psicológicos - UCAB', 
      subtitulo: 'Servicio médico estudiantil', 
      numero: '+58 414 121 78 82 / +58 424 172 39 81', 
      icon: 'medical_services', 
      clase: 'support-card' 
    }
  ];

  llamar(numero: string) {
    window.location.href = `tel:${numero}`;
  }

  cerrar() {
    this.dialogRef.close();
  }

  irA(ruta: string) {
    this.dialogRef.close();
    this.router.navigate([ruta]);
  }
}
