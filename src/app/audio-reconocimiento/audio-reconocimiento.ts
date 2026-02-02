import { Component, ViewChild, ElementRef, NgZone} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AudioEmotionService } from '../audio-reconocimiento/audio-reconocimiento.service';

@Component({
  selector: 'app-audio-reconocimiento',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, FormsModule, NavbarComponent, RouterOutlet],
  templateUrl: './audio-reconocimiento.html',
  styleUrls: ['./audio-reconocimiento.scss']
})

export class AudioReconocimiento {
  recording = false;
  result: any = null;
  @ViewChild('waveformCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  public recordingTime: string = '00:00';
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private animationId?: number;
  private timerInterval: any;
  public secondsElapsed: number = 0;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private audioUrl?: string;

  constructor(private api: AudioEmotionService, private zone: NgZone) {}

  async startRecording() {
    this.recording = true;
    this.secondsElapsed = 0;
    this.recordingTime = '00:00';
    this.audioChunks = []; // Limpiamos el buffer

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 1. Configurar MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream);
      
      // IMPORTANTE: Una sola definición de ondataavailable
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log("Chunk capturado:", event.data.size);
        }
      };

      this.mediaRecorder.start();

      // 2. Gestionar el Temporizador
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.secondsElapsed++;
        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.zone.run(() => {
          this.recordingTime = `${mins}:${secs}`;
        });
      }, 1000);

      // 3. Configurar Visualizador (Web Audio API)
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // 4. Iniciar dibujo
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
    // Apagar el micrófono (luz roja del navegador)
    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }

  if (this.timerInterval) clearInterval(this.timerInterval);
  if (this.animationId) cancelAnimationFrame(this.animationId);
}
  
  discardRecording() {
  // 1. Detener cualquier proceso de audio si estuviera activo
  if (this.timerInterval) clearInterval(this.timerInterval);
  if (this.animationId) cancelAnimationFrame(this.animationId);
  this.audioContext?.close();

  // 2. Resetear variables de tiempo y estado
  this.zone.run(() => {
  this.secondsElapsed = 0;
  this.recordingTime = '00:00';
  this.audioChunks = [];
  this.recording = false;
  this.result = null; // También limpiamos el resultado previo si existe
  });

  // 3. Limpiar el canvas (opcional)
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

  getEmotionEmoji(label: string): string {
    const emojis: any = {
      'angry': '😡', 'disgust': '🤢', 'fear': '😨',
      'happy': '😊', 'neutral': '😐', 'sad': '😢', 'surprise': '😲'
    };
    return emojis[label.toLowerCase()] || '🎤';
  }

  downloadRecording() {
    // Verificamos que haya datos y que el proceso de grabación exista
    if (this.audioChunks.length > 0) {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const url = window.URL.createObjectURL(audioBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `grabacion_${new Date().getTime()}.wav`;
      a.click();
      
      window.URL.revokeObjectURL(url);
    } else {
      console.error("No hay datos de audio para descargar");
    }
  }

}