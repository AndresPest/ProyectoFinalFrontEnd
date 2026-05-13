import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarComponent } from '../navbar/navbar'; 
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { INFOGRAFIA_TEMPLATE } from './template';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-ayuda-general',
  imports: [RouterOutlet, NavbarComponent, MatTabsModule, MatIconModule, MatCardModule, MatButtonModule,
    MatExpansionModule, MatChipsModule, CommonModule],
  templateUrl: './ayuda-general.html',
  styleUrl: './ayuda-general.scss',
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

export class AyudaGeneral implements OnInit {

  constructor(private sanitizer: DomSanitizer) {
    const pdfjsVersion = '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
  }

  ngOnInit() {
    this.generarPortadas();
  }

  profesionales = [
    {
      nombre: 'Psicólogo Clínico Agustín Planchart',
      fotoUrl: 'https://i.postimg.cc/zvtWtbKz/Agustin-Planchart-img.png',
      especialidad: 'Desafíos Emocionales',
      direccion: 'C.C. Naraya, Piso 1, Local 131, Centro Cesares, Puerto Ordaz',
      telefono: '+58 412 299 33 12',
      horarios: {
        presencial: 'Lunes: 11am - 8pm\nMartes: 4pm - 8pm\nMiercoles: 3pm - 8pm\nJueves: 4.30pm - 8pm\nViernes: 4:30pm - 8pm\nSabado: 8am - 8pm\nDomingo: Cerrado',
        online: 'Lunes: 4pm - 8pm\nMartes: 4pm - 8pm\nMiercoles: 8am - 8pm\nJueves: 4pm - 8pm\nViernes: 7pm - 9pm\nSabado: 10:00am - 8:00pm\nDomingo: 9am - 6pm',
        riesgo: 'No establecido'
      }
    },
    {
      nombre: 'Psicólogo Manuel Carmona',
      fotoUrl: 'https://i.postimg.cc/NG5n1WXx/Manuel-Carmona-Img.png',
      especialidad: 'Psicología Clínica',
      direccion: 'Clínica ICEA, Piso 1, Consultorio 20, Puerto Ordaz',
      telefono: '+58 424 960 50 92',
      horarios: {
        presencial: 'Lunes: 7am - 6pm\nMartes: 7am - 6pm\nMiercoles: 7am - 6pm\nJueves: 7am - 6pm\nViernes: 7am - 6pm\nSabado: 7am - 12pm\nDomingo: Cerrado',
        online: 'Lunes: 8am - 8pm\nMartes: 8am - 8pm\nMiercoles: 8am - 8pm\nJueves: 8am - 8pm\nViernes: 8am - 8pm\nSabado: 8am - 5pm\nDomingo: 9am - 12pm',
        riesgo: 'Sabado: 9am - 5pm'
      }
    },
    {
      nombre: 'Psicólogo Maricris Carreño',
      fotoUrl: 'https://i.postimg.cc/tRYchL6x/Maricris-Carreno-Img.png',
      especialidad: 'Enfoque Cognitivo Conductual',
      direccion: 'Clínica ICEA, Piso 1, Consultorio 25A, Puerto Ordaz',
      telefono: '+58 424 966 17 05',
      horarios: {
        presencial: 'Lunes: 9am - 5pm\nMartes: 9am - 5pm\nMiercoles: 9am - 5pm\nJueves: 9am - 5pm\nViernes: 9am - 5pm\nSabado: 9am - 5pm\nDomingo: 9am - 5pm',
        online: 'Lunes: 7am - 9pm\nMartes: 7am - 9pm\nMiercoles: 7am - 9pm\nJueves: 7am - 9pm\nViernes: 7am - 9pm\nSabado: 8am - 2pm\nDomingo: Cerrado',
        riesgo: 'Sabado: 9am - 5pm'
      }
    },
    {
      nombre: 'Psicólogo Evart Gurley Valls',
      fotoUrl: 'https://i.postimg.cc/8kjYhqvv/Evart-Gurley-Img.png',
      especialidad: 'Psicología Clínica',
      direccion: 'Centro comercial Río Caura Piso 2 Local 38, Puerto Ordaz',
      telefono: '+58 412 732 26 66',
      horarios: {
        presencial: 'Lunes: 8am - 5pm\nMartes: 8am - 5pm\nMiercoles: 8am - 5pm\nJueves: 8am - 5pm\nViernes: 8am - 5pm\nSabado: 9am - 4pm\nDomingo: Cerrado',
        online: 'No establecido',
        riesgo: 'No establecido'
      }
    },
    {
      nombre: 'Lcda. Ysolannis Rojas',
      fotoUrl: 'https://i.postimg.cc/qBzF89KX/Ysolannis-Rojas-Img.png',
      especialidad: 'Psicología Clínica',
      direccion: 'Ambulatorio San Lorenzo, Consultorio 2, Sede Rotary Club, Av. Rómulo Gallegos, al lado de la Urb. Las Campiñas. Upata, Edo. Bolívar',
      telefono: '+58 412 832 18 64 / +58 414 881 88 44',
      horarios: {
        presencial: 'Previa Cita',
        online: 'No establecido',
        riesgo: 'No establecido'
      }
    },
    {
      nombre: 'Lcda. Andreina Torres',
      fotoUrl: 'https://i.postimg.cc/XNpPwT5k/Andreina-Torres-Img.png',
      especialidad: 'Psicología Clínica',
      direccion: 'Alta Vista Norte',
      telefono: '+58 424 946 28 78 / +58 424 967 55 22',
      horarios: {
        presencial: 'Lunes: 7am - 6pm\nMartes: 7am - 6pm\nMiercoles: 7am - 6pm\nJueves: 7am - 6pm\nViernes: 7am - 6pm\nSabado: Cerrado\nDomingo: Cerrado',
        online: 'No establecido',
        riesgo: 'No establecido'
      }
    }];

  libros: any[] = [{ 
      titulo: 'En tiempos de estrés, haz lo que importa', 
      autor: 'Organización Mundial de la Salud', 
      urlDescarga: 'https://o6lhecq8ow.ucarecd.net/3615a676-33bc-4c3c-b73e-1987219e9b15/sh2020spa3web.pdf',
      urlPortada: ''
    },{ 
      titulo: 'Controlar el estrés sobre el terreno', 
      autor: 'Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja', 
      urlDescarga: 'https://o6lhecq8ow.ucarecd.net/7088c362-6ad6-46dc-8f08-15e903b5aade/CONTROLARESTRESSOBRETERRENO.pdf',
      urlPortada: ''
    },{
      titulo: 'Manejo del estrés - Desarrollo Humano', 
      autor: 'Universidad Nacional Autónoma de México', 
      urlDescarga: 'https://o6lhecq8ow.ucarecd.net/aee0d429-5286-4020-9b41-51cd023f3cd6/M2T5_PDF.pdf',
      urlPortada: ''
    },{
      titulo: 'Guia de Gestión del Estrés - 2022', 
      autor: 'Gobierno de México', 
      urlDescarga: 'https://o6lhecq8ow.ucarecd.net/b7d997da-32dd-46c9-bcdf-5a30d8c9be25/Guia_Gestion_Estres.pdf',
      urlPortada: ''
    },{
      titulo: 'Siete Maneras Simples de Reducir el Estrés', 
      autor: 'UK Health Care - Universidad de Kentucky', 
      urlDescarga: 'https://o6lhecq8ow.ucarecd.net/e78c63d1-412e-4d7c-8a1e-32109e847764/7simplewaysSPANISHMKTG241517HKI7simplewaystoreducestresstipsheetSPANISHFINAL.pdf',
      urlPortada: ''
    }];
  
  podcasts = [{
    titulo: 'PsicoEspiritual: El Podcast',
    creador: 'Psicología UCAB',
    plataforma: 'YouTube',
    urlPortada: 'https://img.youtube.com/vi/HCwsIREJveQ/hqdefault.jpg',
    urlPodcast: 'https://www.youtube.com/playlist?list=PLeHPytfTsito3Pa8j0M4tqeKCwVMAdFhW'
  },{
    titulo: 'PsicoColmena: El Podcast',
    creador: 'Psicología UCAB',
    plataforma: 'YouTube',
    urlPortada: 'https://img.youtube.com/vi/Ee6vIt4Clkk/hqdefault.jpg',
    urlPodcast: 'https://www.youtube.com/playlist?list=PLeHPytfTsito3Pa8j0M4tqeKCwVMAdFhW'
  },{
    titulo: 'Cómo reducir el estrés y encontrar calma en un mundo acelerado | Mario Alonso Puig',
    creador: 'Mario Alonso Puig',
    plataforma: 'YouTube',
    urlPortada: 'https://img.youtube.com/vi/mg20jVaAiyQ/hqdefault.jpg',
    urlPodcast: 'https://www.youtube.com/watch?v=mg20jVaAiyQ&pp=ygUOZXN0cmVzIHBvZGNhc3Q%3D'
  },
  {
    titulo: 'Música Relajante - Stress Relief',
    creador: 'Spotify',
    plataforma: 'Spotify',
    urlPortada: 'https://i.scdn.co/image/ab67706f000000025db1394baf8862336f19ac83',
    urlPodcast: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXe9gFZP0gtP?utm_source=generator'
  }]; 
  
  infografias = [{
    titulo: 'Herramientas psicológicas para superar situaciones traumáticas',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/tqs8D44z/ESCUELA-DE-PSICOLOGIA-UNIVERSIDAD-CATOLICA-ANDRES-BELLO-20240925-083534-0000.jpg'
  },{
    titulo: 'Rutina en la incertidumbre - Un apoyo práctico',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/ChR9Jxxs/Establecer-rutinas-en-tiempos-dificiles-Un-apoyo-practico-PSICOLOGIA-UCA-20240807-191848-0000.jpg'
  },{
    titulo: 'Primeros Auxilios Psicológicos - Escuela de Psicología UCAB',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/6W8Fzppc/IMG-20240731-WA0100.jpg'
  },{
    titulo: 'Manejo de la Ansiedad - Recomendaciones',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/zzy4pGGj/IMG-20240801-WA0070.jpg'
  },{
    titulo: 'Suicidio - Señales de Alerta',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/KG1CQ889/IMG-20240924-WA0018-1080x2700.jpg'
  },{
    titulo: 'Al dia siguiente del fracaso - 7 claves para superarse y no rendirse',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/tqs8D44S/Infografia-7-claves-para-superarse-y-no-rendirse.png'
  },{
    titulo: 'Herramientas para no rendirse ante la adversidad',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/FrYwGHHC/INFOGRAFIA-RESILIENCIA-PSICOLOGIA-UCAB.jpg'
  },{
    titulo: 'Algunos mitos sobre: El suicidio - Psicología UCAB',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/YrvT8CCy/MITOS-SOBRE-EL-SUICIDIO.png'
  },{
    titulo: 'Salud mental en contextos difíciles',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/6WFgPx8c/SALUD-MENTAl.png'
  },{
    titulo: 'Indicadores de salud mental en la vida espiritual',
    fecha: '2026',
    urlInfografia: 'https://i.postimg.cc/dsgpfchn/SALUD-MENTAL-EN-LA-VIDA-ESPIRITUAL-page-0001-scaled.jpg'
  },];

  abrirInfografia(url: string): void {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(INFOGRAFIA_TEMPLATE(url));
      win.document.close();
    }
  }

  async generarPortadas() {
    for (let libro of this.libros) {
      if (!libro.urlDescarga) continue;
      
      try {
        const base64 = await this.pdfToImage(libro.urlDescarga);
        libro.urlPortada = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
      } catch (error) {
        console.error('Error con el libro:', libro.titulo, error);
        libro.urlPortada = ''; 
      }
    }
  }

  private async pdfToImage(url: string): Promise<string> {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.6 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('No se pudo crear el contexto del canvas');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext as any).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
