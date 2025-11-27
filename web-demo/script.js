const synth = window.speechSynthesis;
let isMuted = false;

// --- CÓDIGO DEL USUARIO (INTEGRADO) ---
// Función de voz MEJORADA
function speak(text) {
    if (isMuted || !synth) return;
    synth.cancel();

    // Limpiamos el texto de símbolos raros
    const cleanText = text.replace(/[*#_]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);

    // INTENTO DE MEJORA DE VOZ:
    // Buscamos todas las voces disponibles en el dispositivo
    const voices = synth.getVoices();

    // Buscamos preferiblemente una voz de Google o Microsoft en español (suenan mejor)
    const bestVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Microsoft')));

    // Si encontramos una "buena", la usamos. Si no, usamos cualquiera en español.
    if (bestVoice) {
        utter.voice = bestVoice;
    } else {
        utter.lang = 'es-ES';
    }

    // Ajustes para que suene menos "lenta"
    utter.rate = 1.1; // Un poquito más rápido (1.0 es normal)
    utter.pitch = 1.0; // Tono normal

    synth.speak(utter);
}
// --------------------------------------

// Lógica de la App
document.addEventListener('DOMContentLoaded', () => {
    // Cargar voces al inicio (a veces tardan en cargar en Chrome)
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => { console.log("Voces cargadas"); };
    }

    const btnWelcome = document.getElementById('btn-speak-welcome');
    btnWelcome.addEventListener('click', () => {
        speak("Bienvenido al sistema de gestión de citas LifeFlow. Por favor, ingrese sus datos.");
    });
});

function announceAppointment() {
    const name = document.querySelector('input[type="text"]').value;
    const type = document.querySelector('select').value;

    if (!name) {
        speak("Por favor, escribe el nombre del donante primero.");
        return;
    }

    speak(`Cita agendada correctamente para ${name}, con tipo de sangre ${type}. Gracias por salvar vidas.`);
}
