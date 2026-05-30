import { Component, ViewChild, ElementRef, NgZone, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AudioEmotionService } from '../audio-reconocimiento/audio-reconocimiento.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-audio-reconocimiento',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: './audio-reconocimiento.html',
  styleUrls: ['./audio-reconocimiento.scss'],
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

export class AudioReconocimiento {
  public recording = false;
  @ViewChild('waveformCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  public recordingTime: string = '00:00';
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private animationId?: number;
  private timerInterval: any;
  public secondsElapsed: number = 0;
  private mediaRecorder?: MediaRecorder;
  public audioChunks: Blob[] = [];
  private audioUrl?: string;
  public isAnalyzing = false;
  public resultsArray: any[] = [];
  public result: any;

  @Input() mostrarNavbar: boolean = true;

  @Input() resultadoId: string | null = null;
  @Output() estadoAudioCambiado = new EventEmitter<boolean>();
  @Output() analisisCompletado = new EventEmitter<void>();

  constructor(private api: AudioEmotionService, private zone: NgZone, private authService: AuthService) {}

  async startRecording() {
    this.recording = true;
    this.secondsElapsed = 0;
    this.recordingTime = '00:00';
    this.audioChunks = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log("Chunk capturado:", event.data.size);
        }
      };

      this.mediaRecorder.start();

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.secondsElapsed++;
        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.zone.run(() => {
          this.recordingTime = `${mins}:${secs}`;
        });
      }, 1000);

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.drawWaveform();

    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      this.recording = false;
    }
  }

  processAudio() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
    this.api.predictEmotion(audioBlob).subscribe(res => {
      alert("Emoción detectada: " + res.emotion);
      this.audioChunks = [];
    });
  }

  stopRecording() {
    this.recording = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
  
  discardRecording() {
  if (this.timerInterval) clearInterval(this.timerInterval);
  if (this.animationId) cancelAnimationFrame(this.animationId);
  this.audioContext?.close();

  this.zone.run(() => {
  this.secondsElapsed = 0;
  this.recordingTime = '00:00';
  this.audioChunks = [];
  this.recording = false;
  this.result = null;
  });

  const canvas = this.canvas.nativeElement;
  const ctx = canvas.getContext('2d');
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  console.log("Grabación descartada");
}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.api.predictEmotion(file).subscribe(res => alert(res.emotion));
    }
  }

  toggleRecording() {
    if (!this.recording) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  drawWaveform() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = this.analyser!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      this.animationId = requestAnimationFrame(renderFrame);
      this.analyser!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.fillStyle = this.recording ? '#1E3A8A' : '#949a9d';
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);

        x += barWidth + 2;
      }
    };
    renderFrame();
  }

  async analyzeAudio() {
    if (this.audioChunks.length === 0 || this.secondsElapsed === 0) return;

    this.isAnalyzing = true;
    this.estadoAudioCambiado.emit(true);
    this.resultsArray = [];

    try {
      const wavBlob = await this.createWavBlob(this.audioChunks);

      this.api.predictEmotion(wavBlob).subscribe({
        next: async (res) => {
          this.zone.run(() => {
            this.result = res;
            if (res.classes && res.probs) {
              this.resultsArray = res.classes.map((name: string, index: number) => {
                const percentage = (res.probs[index] * 100).toFixed(2);
                return { name: name, value: percentage, percent: parseFloat(percentage) };
              });
            }
          });

          const user = this.authService.currentUser;
          if (user && this.resultadoId) {
            try {
              const emocionDetectada = res.emotion || res.label || res.predicted_emotion || 'no definida';
              const datosVoz = {
                analisis_voz: {
                  emocion_dominante: emocionDetectada,
                  detalles_probabilidades: this.resultsArray.length > 0 ? this.resultsArray : 'sin detalles',
                },
                duracion: this.secondsElapsed || 0,
                fecha_voz: new Date()
              };
              await this.authService.actualizarAudioCuestionario(user.uid, this.resultadoId, datosVoz);
              console.log("Firestore actualizado con éxito con los datos del análisis de voz.");
              this.analisisCompletado.emit();
            } catch (fsError) {
              console.error("Error actualizando Firestore con datos de voz:", fsError);
            }
          }

          this.zone.run(() => {
            this.isAnalyzing = false;
            this.estadoAudioCambiado.emit(false);
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.isAnalyzing = false;
            this.estadoAudioCambiado.emit(false);
            console.error("Error en la predicción:", err);
            alert("Hubo un problema al procesar el audio.");
          });
        }
      });
    } catch (error) {
      this.isAnalyzing = false;
      this.estadoAudioCambiado.emit(false);
      console.error("Error al convertir audio a WAV:", error);
    }
  }

  bufferToWav(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // Escribir cabecera WAV (RIFF)
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // tamaño archivo
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);         // longitud chunk
    setUint16(1);          // PCM
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);         // 16-bit
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    // Escribir los datos de audio
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });

    function setUint16(data: any) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: any) { view.setUint32(pos, data, true); pos += 4; }
  }
  
  async createWavBlob(chunks: Blob[]): Promise<Blob> {
    const audioContext = new AudioContext();
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return new Promise((resolve) => {
      const wavBlob = this.bufferToWav(audioBuffer);
      resolve(wavBlob);
    });
  }

  traducirEmocion(label: string): string {
    const traducciones: any = {
      'happy': 'Feliz',
      'sad': 'Triste',
      'angry': 'Enojado',
      'neutral': 'Neutral',
      'surprise': 'Sorprendido',
      'fear': 'Miedo',
      'disgust': 'Disgustado'
    };
    return traducciones[label.toLowerCase()] || label;
  }

}