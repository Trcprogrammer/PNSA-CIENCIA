import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- Importa CommonModule

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
  plantas: string[] = []; // Nueva variable para plantas
  
  temperatura: string = ''; 
  humeda: string = '';
  ph: string = '';

  ngOnInit(): void {}

  async TestGemini() {
    const promptFrutas = `¿Qué Frutas puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}?, solo mencionalas de RD, sin explicacion`;
    const promptVerduras = `¿Qué Vegetacion puedo plantar con una temperatura de ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}?,solo mencionalas de RD sin explicacion`;
    const promptPlantas = `¿Qué dame consejos  de en debo tener cuidado al plantar con temperatura de  ${this.temperatura}°C, humedad de ${this.humeda}%, y pH de ${this.ph}?,enfocado a RD, un resumen corto y para un joven, solo di eso `;

    try {
      const resultFrutas = await model.generateContent(promptFrutas);
      const responseFrutas = resultFrutas.response;
      const textoRespuestaFrutas = responseFrutas.text();
      console.log('Respuesta de frutas:', textoRespuestaFrutas);
      this.resultFrutas.set(textoRespuestaFrutas);

      this.frutas = [];
      const frutasYVerduras = textoRespuestaFrutas.split('\n')
      frutasYVerduras.forEach((item) => {
        const itemLower = item.toLowerCase().trim();
        if (itemLower.startsWith('fruta:')) {
          this.frutas.push(itemLower.replace('fruta:', '').trim());
        }
      });

      const resultVerduras = await model.generateContent(promptVerduras);
      const responseVerduras = resultVerduras.response;
      const textoRespuestaVerduras = responseVerduras.text();
      console.log('Respuesta de verduras:', textoRespuestaVerduras);
      this.resultVerduras.set(textoRespuestaVerduras);

      this.verduras = [];
      const verdurasYPlantas = textoRespuestaVerduras.split('\n');
      verdurasYPlantas.forEach((item) => {
        const itemLower = item.toLowerCase().trim();
        if (itemLower.startsWith('verdura:')) {
          this.verduras.push(itemLower.replace('verdura:', '').trim());
        }
      });

      const resultPlantas = await model.generateContent(promptPlantas);
      const responsePlantas = resultPlantas.response;
      const textoRespuestaPlantas = responsePlantas.text();
      console.log('Respuesta de plantas:', textoRespuestaPlantas);
      this.resultPlantas.set(textoRespuestaPlantas);

      this.plantas = [];
      const plantasList = textoRespuestaPlantas.split('\n');
      plantasList.forEach((item) => {
        const itemLower = item.toLowerCase().trim();
        if (itemLower.startsWith('planta:')) {
          this.plantas.push(itemLower.replace('planta:', '').trim());
        }
      });

      // console.log('Frutas:', this.frutas);  // Para verificar que estamos obteniendo las frutas
      // console.log('Verduras:', this.verduras);  // Para verificar que estamos obteniendo las verduras
      // console.log('Plantas:', this.plantas);  // Para verificar que estamos obteniendo las plantas

    } catch (error) {
      console.error('Error al generar contenido:', error);
      this.resultFrutas.set("Ocurrió un error al obtener las respuestas.");
      this.resultVerduras.set("Ocurrió un error al obtener las respuestas.");
      this.resultPlantas.set("Ocurrió un error al obtener las respuestas.");
    }
  }
}
