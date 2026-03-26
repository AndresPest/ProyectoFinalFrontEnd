import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Detalles de la Evaluación</h2>
    <mat-dialog-content>
      <div class="detalle-container">
        <p><strong>Cuestionario:</strong> {{ data.identificador_cuestionario }}</p>
        <p><strong>Puntaje:</strong> {{ data.puntaje_final }}</p>
        
        <hr>
        
        <h3>Desglose por Categorías</h3>
        @for (cat of categorias; track cat) {
          <div class="cat-box">
            <span>{{ cat }}:</span>
            <strong>{{ data.categorias[cat].intensidad || data.categorias[cat] }}</strong>
          </div>
        }

        <div class="recomendaciones">
          <h3>Sugerencias de Bienestar</h3>
          <p>Basado en tus resultados, te recomendamos:</p>
          <ul>
            <li>Practicar técnicas de respiración diafragmática 5 min al día.</li>
            <li>Organizar tus tareas en bloques de 40 minutos.</li>
            <li>Consultar con un orientador si la sensación de estrés persiste.</li>
          </ul>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .cat-box { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .recomendaciones { background: #f0f4ff; padding: 15px; border-radius: 8px; margin-top: 20px; }
  `]
})

export class DetalleResultadoComponent {
  
  public data = inject(MAT_DIALOG_DATA);

  public categorias = Object.keys(this.data.categorias);
}
