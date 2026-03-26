import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth';
import { Navigation } from '../services/navigation';


// Importa los módulos de Material que usaremos en el HTML
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DetalleResultadoComponent } from './detallesResultados';

import { Component, OnInit, inject,NgZone } from '@angular/core';
// Firebase
import { Firestore, collection, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

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

  verDetalles(resultado: any) {
    this.dialog.open(DetalleResultadoComponent, {
      width: '500px',
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

  async cargarDatos() {
      this.loading = true;
      try {
        const datos = await this.auth.getResultadosCuestionarios();
        
        // Ejecutamos esto dentro de la zona de Angular para forzar el renderizado
        this.zone.run(() => {
          this.listaResultados = datos;
          this.loading = false;
          console.log("Vista actualizada con éxito");
        });

      } catch (error) {
        console.error("Error al cargar:", error);
        this.zone.run(() => this.loading = false);
      }
    }
    
    // No olvides esta función para las categorías
    getCategorias(obj: any): string[] {
      return obj ? Object.keys(obj) : [];
    }

    // Añade esto debajo de getCategorias
    isObject(val: any): boolean {
      return val !== null && typeof val === 'object';
    }
  }