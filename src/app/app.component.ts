import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

const googleGenAI = new GoogleGenerativeAI(environment.API_KEY);

const generationconfig = {
  temperature: 1,
  top_p: 0.95,
  top_k: 64,
  max_output_tokens: 8192,
  response_mime_type: "text/plain",
};

const model = googleGenAI.getGenerativeModel({
  model: "gemini-pro",
  ...generationconfig,
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  resultFrutas = signal("");
  resultVerduras = signal("");
  resultPlantas = signal("");
  isLoading = true;
  frutas: string[] = [];
  verduras: string[] = [];
  plantas: string[] = [];

  temperatura: string = '';
  humeda: string = '';
  ph: string = '';
  showResults = false;
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 4000); 
  }
  

  showLoadingAlert() {
    Swal.fire({
      title: 'Buscando...',
      text: 'Por favor espera',
      icon: 'success',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  error() {
    Swal.fire({
      title: 'Campos vacíos',
      text: 'Por favor, llena todos los campos antes de continuar.',
      icon: 'warning',
      confirmButtonColor: '#d33',
    });
  }

  async TestGemini() {
    if (!this.temperatura || !this.humeda || !this.ph) {
      this.error();
      return;
    }
    this.showLoadingAlert();
    const promptFrutas = `Lista las frutas que puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}. Para cada fruta, escribe su nombre seguido de dos puntos, espacio y luego una recomendación breve para plantarla. Organiza cada fruta en una nueva línea,  ni otros signos. todo enfocalo en lo mas comun en republica dominicana, todos enumerados`;
    const promptVerduras = `Lista los vegetales que puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}. Para cada vegetal, escribe su nombre seguido de dos puntos, espacio y luego una recomendación breve para plantarlo. Organiza cada vegetal en una nueva línea,  ni otros signos. todo enfocalo en lo mas comun en republica dominicana, todos enumerados`;
    const promptPlantas = `Dame una recomendación breve y general sobre el cultivo de plantas con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}, . Para cada vegetal, escribe su nombre seguido de dos puntos, espacio y luego una recomendación breve para plantarlo. Organiza cada vegetal en una nueva línea,  ni otros signos.  todo enfocalo en lo mas comun en republica dominicana, todos enumerados`;
    
    try {
      const resultFrutas = await model.generateContent(promptFrutas);
      this.resultFrutas.set(resultFrutas.response.text());

      const resultVerduras = await model.generateContent(promptVerduras);
      this.resultVerduras.set(resultVerduras.response.text());

      const resultPlantas = await model.generateContent(promptPlantas);
      this.resultPlantas.set(resultPlantas.response.text());
      this.showResults = true;
      Swal.close();

    } catch (error) {
      console.error('Error al generar contenido:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al obtener las respuestas. Por favor, intenta de nuevo.',
        icon: 'error',
      });
    }
  }
}
