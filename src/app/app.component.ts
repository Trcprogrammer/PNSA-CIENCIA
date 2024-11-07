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
  consejo = signal("");
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


  contentInfo() {
    Swal.fire({
      title: "<strong>SoilTrack</strong>",
      html: `
        <div style="text-align: left; font-size: 1.1em;">
          <p>SoilTrack es tu herramienta para descubrir qué plantar según las características del suelo.</p>
          <p>Ingresa los datos de <strong>temperatura</strong>, <strong>humedad</strong> y <strong>pH</strong> del suelo y luego presiona <strong>Buscar</strong> para obtener recomendaciones de cultivo.</p>
        </div>
      `,
      showCloseButton: true,
      backdrop: true,
      customClass: {
        popup: 'fullscreen-popup',
        confirmButton: 'wide-button' 
      },
      confirmButtonText: 'OK',
      confirmButtonColor: '#28a745', 
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
    const promptconsejo= `Dame un consejo estudiante motivador para plantar en tierra con${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}, que sea claro corto y motivador y  sin tantos signos que sea humanizado`;
    
    try {
      const resultFrutas = await model.generateContent(promptFrutas);
      this.resultFrutas.set(resultFrutas.response.text());

      const resultVerduras = await model.generateContent(promptVerduras);
      this.resultVerduras.set(resultVerduras.response.text());

      const consejo = await model.generateContent(promptconsejo);
      this.consejo.set(consejo.response.text());
      this.showResults = true;
      Swal.close();
       this.temperatura=''
       this.humeda=''
       this.ph=''
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
