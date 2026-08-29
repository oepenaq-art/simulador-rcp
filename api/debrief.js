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
Usa formato Markdown con encabezados claros, emojis profesionales y viñetas concisas. SÉ DIRECTO Y CONCISO para no exceder los límites de tiempo. NO te extiendas demasiado en cada punto:

# 🏥 Debriefing Clínico Estructurado - Modelo O-R-D-E-N

### 🎯 Resumen Ejecutivo del Desempeño
- Evaluación global del liderazgo y resultado clínico (RCE alcanzado en el tiempo registrado).

---

### 🗣️ O - Organización y Liderazgo (Teamwork & CRM)
- Evaluación Inicial Sistemática: Evalúa si siguió el orden protocolario (1. Verificar Respuesta -> 2. Verificar Respiración -> 3. Palpar Pulso Central).
- Momento de Activación del Código Azul: 
  * Si el participante activó el Código Azul DESPUÉS de verificar el pulso (TARDÍO), explícale de forma constructiva: "Al confirmar que el paciente no responde y está en apnea (no respira), ya nos encontramos ante un paro respiratorio inminente, por lo que el Código Azul debe activarse INMEDIATAMENTE en ese momento para convocar al equipo y carro de paro sin esperar a palpar el pulso, ganando segundos vitales".
  * Si lo activó tras ver la apnea (ÓPTIMO), felicítalo por su rapidez de decisión.
- Asignación de los roles clave (Líder, Compresor, Vía Aérea, Monitor/Desfibrilador, Medicamentos, Registro).
- Uso y verificación de comunicación de circuito cerrado (closed-loop).
- Uso de Ayudas Cognitivas (felicitar si las consultó o recordar su importancia si no lo hizo).

### 🫀 R - Reanimación Cardiopulmonar de Alta Calidad
- Parámetros técnicos: frecuencia (100-120), profundidad, reexpansión.
- Manejo de pausas y reinicio inmediato de compresiones tras la desfibrilación. 
- *MUY IMPORTANTE:* Si el participante tiene errores de verificación prematura de ritmo (detener RCP antes de 2 minutos para ver el monitor o palpar pulso), corrígelo enfáticamente: se debe completar el ciclo completo de 2 min tras descargas o adrenalina sin interrupciones.
- Manejo de vía aérea (BVM o Tubo con capnografía).

### ⚡ D - Desfibrilación y Manejo del Ritmo
- Reconocimiento de Fibrilación Ventricular (FV) y dosificación en Joules.
- Ritmo de salida: transición a Ritmo Sinusal organizado y confirmación de pulso central.

### 💉 E - Empleo de Fármacos y Causas Reversibles (Hs y Ts)
- Estandarización de Adrenalina: dosis correcta. Si el participante ordenó 1 ampolla (1 mg) directa, enfatiza fuertemente que esto es una sobredosis letal para 20 kg. Recuérdale que SIEMPRE se debe diluir 1 ampolla en 10 mL de SSN y de ahí administrar 0.1 mL/kg (es decir, 2 mL para este paciente).
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
- Secuencia de Evaluación Inicial (1. Respuesta -> 2. Respiración -> 3. Pulso): ${simulationData.ordenEvaluacionCorrecto ? 'Correcta y sistemática' : 'Incompleta o desordenada'}
- Momento de Activación de Código Azul: ${simulationData.momentoActivacionCodigoAzul === 'tras_apnea' ? 'ÓPTIMO (activado al identificar apnea/paro respiratorio)' : (simulationData.momentoActivacionCodigoAzul === 'tras_pulso' ? 'TARDÍO (esperó hasta palpar el pulso en lugar de activarlo inmediatamente al ver la apnea)' : simulationData.momentoActivacionCodigoAzul)}
- Tubo endotraqueal y capnografía: ${simulationData.tuboColocado ? 'Sí' : 'No'}
- Error grave en Adrenalina: ${simulationData.errorAdrenalinaDirecta ? 'Sí (ordenó 1 ampolla de 1 mg directa sin diluir)' : 'No'}
- Dosis de adrenalina administrada: ${simulationData.adrenalinaDada ? 'Sí' : 'No'}
- Calcio y Bicarbonato para Hipercalemia: ${simulationData.calcioDado ? 'Sí' : 'No'}
- Amiodarona tras 3ra descarga: ${simulationData.amiodaronaDada ? 'Sí' : 'No'}
- Descargas dadas: ${simulationData.descargasDadas || 0}
- Cuidados Posparo Indicados (Adecuados): ${(simulationData.posparoAdecuados || []).join(', ')}
- Errores/Distractores seleccionados en Posparo: ${(simulationData.posparoErrores || []).join(', ')}

Historial completo de intervenciones en la simulación:
${(simulationData.logDeAcciones || []).join('\n')}

Por favor genera el debriefing completo con el modelo ORDEN.`;

        let feedbackText = '';
    let lastError = null;

    // 1. Intentar descubrir dinámicamente los modelos disponibles para esta API Key
    let availableModelName = null;
    let listData = null;
    try {
      const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listResp.ok) {
        listData = await listResp.json();
        const validModels = (listData.models || []).filter(m => 
          m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );
        
        // Buscar preferiblemente un modelo flash o el primero disponible
        const preferred = validModels.find(m => m.name.includes('flash')) || validModels.find(m => m.name.includes('gemini')) || validModels[0];
        if (preferred) {
          availableModelName = preferred.name; // e.g. 'models/gemini-1.5-flash' o 'models/gemini-2.0-flash'
        }
      } else {
        lastError = await listResp.text();
      }
    } catch (e) {
      console.warn("No se pudo listar modelos:", e);
    }

    const candidateUrls = [];
    if (listData && listData.models) {
      const allFlash = listData.models
        .filter(m => m.name.includes('flash') && m.supportedGenerationMethods?.includes('generateContent'))
        .reverse(); // Empezar por los mas recientes (ej. 3.7-flash en vez de 2.5)
      
      for (const m of allFlash) {
        candidateUrls.push(`https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${apiKey}`);
      }
    }
    
    if (availableModelName) {
      candidateUrls.push(`https://generativelanguage.googleapis.com/v1beta/${availableModelName}:generateContent?key=${apiKey}`);
    }

    // Modelos de respaldo comunes
    const fallbackList = [
      'models/gemini-2.0-flash',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-flash-latest',
      'models/gemini-1.5-pro',
      'models/gemini-1.0-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-pro'
    ];

    for (const fb of fallbackList) {
      candidateUrls.push(`https://generativelanguage.googleapis.com/v1beta/${fb}:generateContent?key=${apiKey}`);
      candidateUrls.push(`https://generativelanguage.googleapis.com/v1/${fb}:generateContent?key=${apiKey}`);
    }

    // Probar las URLs candidatas
    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (feedbackText) break;
        } else {
          lastError = await response.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!feedbackText) {
      return res.status(500).json({
        error: `Error conectando con Gemini: ${lastError || 'No se obtuvo respuesta de ningún modelo disponible.'}`,
        details: candidateUrls,
        lastErrorRaw: lastError
      });
    }

    // Integración con Webhook (Zapier/Make) para enviar a correo y drive
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
            fecha: new Date().toLocaleString('es-ES')
          })
        });
      } catch (e) {
        console.error("Error enviando al webhook:", e);
      }
    }

    return res.status(200).json({ feedback: feedbackText });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor: ' + error.message });
  }
};
