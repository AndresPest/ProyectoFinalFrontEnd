import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Ayuda } from './ayuda/ayuda';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
  template: `<router-outlet></router-outlet>`,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private dialog: MatDialog) {}

  abrirAyuda() {
    this.dialog.open(Ayuda, {
      width: '600px',
      maxWidth: 'none',
      autoFocus: false
    });
  }
}