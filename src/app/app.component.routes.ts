import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { StressQuestionnaireComponent } from './stress-questionnaire/stress-questionnaire';
import { FaceMeshComponent } from './face-mesh/face-mesh';
import { ResultadosComponent } from './resultados/resultados';
import { RegisterComponent } from './register/register';
import { MapasDeCalorComponent } from './mapas-de-calor/mapas-de-calor.component';
import { AudioReconocimiento } from './audio-reconocimiento/audio-reconocimiento';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'cuestionario', component: StressQuestionnaireComponent },
    { path: 'reconocimiento-de-voz', component: AudioReconocimiento },
    { path: 'face-mesh', component: FaceMeshComponent },
    { path: 'resultados', component: ResultadosComponent },
    { path: 'mapas-de-calor', component: MapasDeCalorComponent },
];
