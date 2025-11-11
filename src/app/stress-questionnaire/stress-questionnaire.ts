import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { StressService } from '../services/stress.service';
import { EstresCuestionario } from '../models/estres-cuestionario.model';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-stress-questionnaire',
  standalone: true,
  imports: [ CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: './stress-questionnaire.html',
  styleUrls: ['./stress-questionnaire.scss'],
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

export class StressQuestionnaireComponent {
  currentQuestionIndex = 0;
  selectedAnswer: string = '';
  opciones = ['Nunca', 'Casi nunca', 'A veces', 'Frecuentemente', 'Muy frecuentemente'];
  respuestaPuntaje: { [clave: string]: number } = {
  'Nunca': 0,
  'Casi nunca': 1,
  'A veces': 2,
  'Frecuentemente': 3,
  'Muy frecuentemente': 4
  };
  puntajes: number[] = [];
  preguntasInvertidas = [3, 4, 6, 7]; // indices base 0 para preguntas 4, 5, 7, 8
  resultado = 0
  nivel_estres:string = ""

  cuestionario: EstresCuestionario[] = [
    "¿Con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?",
    "¿Con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?",
    "¿Con qué frecuencia se ha sentido nervioso o estresado?",
    "¿Con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?",
    "¿Con qué frecuencia ha sentido que las cosas le van bien?",
    "¿Con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?",
    "¿Con qué frecuencia ha podido controlar las dificultades de su vida?",
    "¿Con qué frecuencia se ha sentido que tenía todo bajo control?",
    "¿Con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?",
    "¿Con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?"
  ].map(pregunta => ({ pregunta, respuesta: '' }));

  preguntaActual = this.cuestionario[0];
  preguntaKey = 0;

  constructor(private stressService: StressService) {}

  confirmAnswer() {
    if (!this.selectedAnswer) return;

    const puntajeOriginal = this.respuestaPuntaje[this.selectedAnswer] ?? 0;
    const esInvertida = this.preguntasInvertidas.includes(this.currentQuestionIndex);
    const puntajeFinal = esInvertida ? 4 - puntajeOriginal : puntajeOriginal;

    this.puntajes.push(puntajeFinal);
    this.selectedAnswer = '';

    if (this.currentQuestionIndex < this.cuestionario.length - 1) {
      this.currentQuestionIndex++;
      this.preguntaActual = this.cuestionario[this.currentQuestionIndex];
      this.preguntaKey++;
    } else {
      this.enviarPuntaje();
    }
  }
  
    /*if (!this.selectedAnswer) return;
    this.cuestionario[this.currentQuestionIndex].respuesta = this.selectedAnswer;
    this.selectedAnswer = '';
    if (this.currentQuestionIndex < this.cuestionario.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.stressService.submitAnswers(this.cuestionario).subscribe({
      next: res => console.log('Respuesta del backend:', res),
      error: err => console.error('Error al enviar:', err)
      });
    }*/

  submitAnswers() {
    console.log('Respuestas:', this.cuestionario);
  }

  enviarPuntaje() {
    const puntajeTotal = this.puntajes.reduce((acc, val) => acc + val, 0);
    this.stressService.submitScore(puntajeTotal).subscribe({
      next: res => {
        console.log('Puntaje enviado:', res),
        this.nivel_estres = res.nivel_estres,
        this.resultado = res.nivel;
        },
      error: err => console.error('Error al enviar puntaje:', err)
    });
  }
}