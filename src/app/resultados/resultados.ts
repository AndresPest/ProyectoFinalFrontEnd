import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss']
})
export class ResultadosComponent {}
