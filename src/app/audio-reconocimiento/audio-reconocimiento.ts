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
  isAnalyzing = false;
  public resultsArray: any[] = [];
  public result: any;

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

  async analyzeAudio() {
    if (this.audioChunks.length === 0) return;

    this.isAnalyzing = true;
    this.resultsArray = []; // [Mejora] Limpiamos resultados previos antes de empezar

    try {
      // CONVERTIMOS A WAV ANTES DE ENVIAR
      const wavBlob = await this.createWavBlob(this.audioChunks);

      this.api.predictEmotion(wavBlob).subscribe({
        next: (res) => {
          this.zone.run(() => {
            console.log("Respuesta completa del servidor:", res);
            this.result = res;
            
            // Verificación de seguridad: ¿Vienen los datos necesarios?
            if (res.classes && res.probs) {
              this.resultsArray = res.classes.map((name: string, index: number) => {
                const percentage = (res.probs[index] * 100).toFixed(2);
                return {
                  name: name,
                  value: percentage,
                  percent: parseFloat(percentage)
                };
              });
              
              console.log("Array procesado para las barras:", this.resultsArray);
            }
            
            this.isAnalyzing = false;
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.isAnalyzing = false;
            console.error("Error en la predicción:", err);
            alert("Hubo un problema al procesar el audio.");
          });
        }
      });
    } catch (error) {
      this.isAnalyzing = false;
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

}