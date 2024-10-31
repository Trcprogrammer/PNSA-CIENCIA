import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- Importa CommonModule
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




  frutas: string[] = [];
  verduras: string[] = [];
  plantas: string[] = [];

  temperatura: string = '';
  humeda: string = '';
  ph: string = '';


  ngOnInit(): void {
    // this.showLoadingAlert();
  }

  showLoadingAlert() {
    Swal.fire({
      title: 'Buscando...',
      text: 'Por favor espera',
      icon: 'success',
      allowOutsideClick: false,
      timer: 3000,
      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {

      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth' 
    });
  }


  alert() {
    this.showLoadingAlert()

  }
  reset() {
    Swal.fire({
      title: 'Actualizando',
      text: 'Por favor espera',
      icon: 'success',
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      }
    }).then(() => {
      window.location.reload();
   
      // this.scrollToBottom(); 
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

      this.error()
      return;
    }


    this.showLoadingAlert();
    const promptFrutas = `¿Cuáles frutas puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}? Solo menciona y enumera con numeros nada mas  las más comunes en República Dominicana sin agregar signos adicionales., sin ateriscos `;
    const promptVerduras = `¿Qué vegetación enfocado en vegetalesque  puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}? Solo menciona y enumera  con numeros nada mas las más comunes en República Dominicana sin agregar signos adicionales. sin aterisco`;
    const promptPlantas = `¿Qué recomendacion breve me puedes dar para plantar con temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}? Enfocado a República Dominicana . sin aterisco, y organizalo y que solo sea una recomendacion sin ateriscos, que sea corta`;

    try {
      const resultFrutas = await model.generateContent(promptFrutas);
      const responseFrutas = resultFrutas.response;
      this.resultFrutas.set(responseFrutas.text());

      const resultVerduras = await model.generateContent(promptVerduras);
      const responseVerduras = resultVerduras.response;
      this.resultVerduras.set(responseVerduras.text());

      const resultPlantas = await model.generateContent(promptPlantas);
      const responsePlantas = resultPlantas.response;
      this.resultPlantas.set(responsePlantas.text());

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
