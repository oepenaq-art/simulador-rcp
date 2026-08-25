const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY no está configurada en las variables de entorno del servidor (Vercel).'
    });
  }

  try {
    const simulationData = req.body || {};

    // Cargar documentos de conocimiento clinico
    let knowledgeBase = '';
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
      const files = fs.readdirSync(knowledgeDir);
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.txt')) {
          const filePath = path.join(knowledgeDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          knowledgeBase += `\n--- INICIO DOCUMENTO: ${file} ---\n${content}\n--- FIN DOCUMENTO ---\n`;
        }
      }
    }

    const systemPrompt = `Eres un Instructor Experto en Simulación Clínica Pediátrica y Reanimación Avanzada (PALS/AHA) del Hospital Pablo Tobón Uribe (HPTU).
Tu misión es generar un DEBRIEFING FORMATIVO, PROFUNDO, EMPÁTICO Y ESTRUCTURADO para el médico participante ${simulationData.participante?.nombre ? ('(' + simulationData.participante.nombre + ')') : ''} que acaba de liderar el caso de paro cardíaco pediátrico (Caso: Augusto, 7 años, 20 kg, FV secundaria a Hipercalemia severa en ERC).

Debes basar tu evaluación estrictamente en las siguientes FUENTES DE CONOCIMIENTO INSTITUCIONAL Y GUÍAS INTERNACIONALES:
${knowledgeBase}

ESTRUCTURA OBLIGATORIA DEL DEBRIEFING (Framework ORDEN):
Usa formato Markdown con encabezados claros, emojis profesionales y viñetas concisas:

# 🏥 Debriefing Clínico Estructurado - Modelo O-R-D-E-N

### 🎯 Resumen Ejecutivo del Desempeño
- Evaluación global del liderazgo y resultado clínico (RCE alcanzado en el tiempo registrado).

---

### 🗣️ O - Organización y Liderazgo (Teamwork & CRM)
- Asignación de los roles clave.
- Uso y verificación de comunicación de circuito cerrado (closed-loop).
- Uso de Ayudas Cognitivas (felicitar si las consultó o recordar su importancia si no lo hizo).

### 🫀 R - Reanimación Cardiopulmonar de Alta Calidad
- Parámetros técnicos: frecuencia (100-120), profundidad, reexpansión.
- Manejo de pausas y reinicio inmediato de compresiones tras la desfibrilación.
- Manejo de vía aérea (BVM o Tubo con capnografía).

### ⚡ D - Desfibrilación y Manejo del Ritmo
- Reconocimiento de Fibrilación Ventricular (FV) y dosificación en Joules.
- Ritmo de salida: transición a Ritmo Sinusal organizado y confirmación de pulso central.

### 💉 E - Empleo de Fármacos y Causas Reversibles (Hs y Ts)
- Estandarización de Adrenalina: dosis correcta.
- Manejo de Hipercalemia: Gluconato de Calcio y Bicarbonato.
- Manejo de arritmia refractaria (Amiodarona o Lidocaína).

### 🧠 N - Neuroprotección y Cuidados Posparo
- Metas hemodinámicas, de oxigenación/ventilación.
- Retroalimentación sobre distractores en los cuidados posparo.

---

### 💡 3 Perlas Clínicas / Compromisos para la Práctica Futura
(Tres lecciones clave accionables y directas).`;

    const userPrompt = `A continuación se presentan las métricas exactas y el log de eventos registrado durante la simulación de este participante:

- Tiempo total de reanimación: ${simulationData.tiempoTotal || 'N/A'}
- Roles asignados: ${simulationData.rolesAsignados ? 'Sí' : 'No'}
- Consultó ayudas cognitivas: ${simulationData.consultoAyudasCognitivas ? 'Sí' : 'No'}
- Tubo endotraqueal y capnografía: ${simulationData.tuboColocado ? 'Sí' : 'No'}
- Dosis de adrenalina administrada: ${simulationData.adrenalinaDada ? 'Sí' : 'No'}
- Calcio y Bicarbonato para Hipercalemia: ${simulationData.calcioDado ? 'Sí' : 'No'}
- Amiodarona tras 3ra descarga: ${simulationData.amiodaronaDada ? 'Sí' : 'No'}
- Descargas dadas: ${simulationData.descargasDadas || 0}
- Cuidados Posparo Indicados (Adecuados): ${(simulationData.posparoAdecuados || []).join(', ')}
- Errores/Distractores seleccionados en Posparo: ${(simulationData.posparoErrores || []).join(', ')}

Historial completo de intervenciones en la simulación:
${(simulationData.logDeAcciones || []).join('\n')}

Por favor genera el debriefing completo con el modelo ORDEN.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Error en la API de Gemini (${response.status}): ${errText}`
      });
    }

    const data = await response.json();
    const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar el texto de debriefing.';

    // Opcional: Integración con Webhook (Zapier/Make) para enviar a correo y drive
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl && simulationData.participante?.email) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: simulationData.participante.nombre || 'Participante',
            email: simulationData.participante.email,
            debriefing: feedbackText,
            fecha: new Date().toISOString()
          })
        });
      } catch (e) {
        console.error("Error enviando al webhook:", e);
        // Continuar sin fallar la petición principal
      }
    }

    return res.status(200).json({ feedback: feedbackText });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor: ' + error.message });
  }
};
