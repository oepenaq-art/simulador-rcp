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

    // Cargar documentos de conocimiento clínico de /knowledge
    let knowledgeBase = '';
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
      const files = fs.readdirSync(knowledgeDir);
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.txt')) {
          const filePath = path.join(knowledgeDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          knowledgeBase += \
\
--- INICIO DOCUMENTO:  ---\
          knowledgeBase += `

--- INICIO DOCUMENTO: ${file} ---
${content}
--- FIN DOCUMENTO ---`;
        }
      }
    }

    const systemPrompt = `Eres un Instructor Experto en Simulación Clínica Pediátrica y Reanimación Avanzada (PALS/AHA) del Hospital Pablo Tobón Uribe (HPTU).
Tu misión es generar un DEBRIEFING FORMATIVO, PROFUNDO, EMPÁTICO Y ESTRUCTURADO para el médico participante ${simulationData.participante?.nombre ? ('(' + simulationData.participante.nombre + ')') : ''} que acaba de liderar el caso de paro cardíaco pediátrico (Caso: Augusto, 7 años, 20 kg, FV secundaria a Hipercalemia severa en ERC).

Debes basar tu evaluación estrictamente en las siguientes FUENTES DE CONOCIMIENTO INSTITUCIONAL Y GUÍAS INTERNACIONALES:
${knowledgeBase}

ESTRUCTURA OBLIGATORIA DEL DEBRIEFING (Framework ORDEN):
Usa formato Markdown con encabezados claros, emojis profesionales y viñetas concisas:

# 📊 Debriefing Clínico Estructurado - Modelo O-R-D-E-N

### 🎯 Resumen Ejecutivo del Desempeño
- Evaluación global del liderazgo y resultado clínico (RCE alcanzado en el tiempo registrado).

---

### 🔹 O - Organización y Liderazgo (Teamwork & CRM)
- Asignación de los 6 roles clave.
- Uso y verificación de comunicación de circuito cerrado (closed-loop).
- Uso de Ayudas Cognitivas (felicitar si las consultó o recordar su importancia si no lo hizo).

### 🔹 R - Reanimación Cardiopulmonar de Alta Calidad
- Parámetros técnicos: frecuencia (100-120), profundidad (1/3-1/2 AP ~5 cm), reexpansión, tabla rígida.
- Manejo de pausas y reinicio inmediato de compresiones tras la desfibrilación.
- Manejo de vía aérea (BVM o Tubo #5.5 con capnografía continua 20-30 vent/min).

### 🔹 D - Desfibrilación y Manejo del Ritmo
- Reconocimiento de Fibrilación Ventricular (FV) y dosificación en Joules (1ra: 40 J, 2da: 80 J, 3ra: 80-100 J).
- Ritmo de salida: transición a Ritmo Sinusal organizado y confirmación de pulso central.

### 🔹 E - Empleo de Fármacos y Causas Reversibles (Hs y Ts)
- Estandarización de Adrenalina: preparación 1:10.000 (1 ampolla en 10 mL) y dosis de 0.1 mL/kg (2.0 mL para 20 kg).
- Manejo de Hipercalemia: Gluconato de Calcio 10% (estabilizador de membrana) y Bicarbonato de Sodio.
- Manejo de arritmia refractaria (Amiodarona o Lidocaína).

### 🔹 N - Neuroprotección y Cuidados Posparo
- Metas hemodinámicas: PAS y PAM ≥ percentil 10 para la edad.
- Metas de oxigenación/ventilación: SatO2 94-99% (evitar hiperoxia 100%), normocapnia (PaCO2 35-45).
- TTM y monitoreo EEG para crisis subclínicas.
- Retroalimentación sobre distractores (si solicitó RM inmediata o 100% de oxígeno continuo, explicar por qué no es adecuado).

---

### 💡 3 Perlas Clínicas / Compromisos para la Práctica Futura
(Tres lecciones clave accionables y directas).
;

    const userPrompt = A continuación se presentan las métricas exactas y el log de eventos registrado durante la simulación de este participante:

- Tiempo total de reanimación: 
- Roles asignados: 
- Consultó ayudas cognitivas: 
- Tubo endotraqueal y capnografía: 
- Dosis de adrenalina administrada: 
- Calcio y Bicarbonato para Hipercalemia: 
- Amiodarona tras 3ra descarga: 
- Intervenciones de rescate requeridas por dudas/omisiones: 
- Cuidados Posparo Indicados (Adecuados): 
- Errores/Distractores seleccionados en Posparo: 
- Historial completo de intervenciones en la simulación:


Por favor genera el debriefing completo con el modelo ORDEN.;

    const apiUrl = https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: ${systemPrompt}\
\
 }] }
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
        error: Error en la API de Gemini (): 
      });
    }

    const data = await response.json();
    const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar el texto de debriefing.';

    return res.status(200).json({ feedback: feedbackText });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor: ' + error.message });
  }
};