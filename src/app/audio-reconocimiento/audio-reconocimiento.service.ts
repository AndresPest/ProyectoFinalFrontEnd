import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AudioEmotionService {
  private baseUrl = 'http://localhost:5000/api/audio';

  constructor(private http: HttpClient) {}

  predictEmotion(file: Blob) {
    const formData = new FormData();
    formData.append('file', file, 'recording.wav');
    return this.http.post<any>(`${this.baseUrl}`, formData);
  }
}
