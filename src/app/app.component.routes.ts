import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { StressQuestionnaireComponent } from './stress-questionnaire/stress-questionnaire';
import { FaceMeshComponent } from './face-mesh/face-mesh';
import { ResultadosComponent } from './resultados/resultados';
import { RegisterComponent } from './register/register';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'cuestionario', component: StressQuestionnaireComponent },
    { path: 'face-mesh', component: FaceMeshComponent },
    { path: 'resultados', component: ResultadosComponent },
];
