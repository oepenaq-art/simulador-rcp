import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(m):
    old = m.group(0)
    return old + """

            // --- GENERAR RESUMEN DE ACCIONES Y ENVIAR AL CHAT ---
            let resumenHTML = `<div class="mb-4 text-left">
                <div class="inline-block p-4 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-emerald-600 shadow-md w-full">
                    <h4 class="font-bold text-lg mb-2"><i class="fas fa-list-check mr-2"></i>Resumen de Acciones (Tiempos Reales)</h4>
                    <p class="text-xs mb-3 text-emerald-700">Utiliza esta información detallada para diligenciar tu Registro Clínico manualmente.</p>
                    <ul class="list-disc pl-5 space-y-1 text-sm font-mono">`;
            resumenHTML += `<li><strong>Min 00:00:</strong> Inicio de Compresiones Torácicas y BVM</li>`;
            
            // Collect events in order
            let events = [];
            state.descargas.forEach((d, i) => { events.push({time: d.time, text: `Descarga ${i+1} administrada (${d.energy} J)`}); });
            state.meds.forEach(m => { events.push({time: m.time, text: `${m.name} (${m.route}) - ${m.obs}`}); });
            
            // Sort by time
            events.sort((a,b) => a.time.localeCompare(b.time));
            
            events.forEach(e => {
                resumenHTML += `<li><strong>Min ${e.time}:</strong> ${e.text}</li>`;
            });
            
            if (state.tuboColocado) { 
                resumenHTML += `<li><strong>Min 04:00 (Aprox):</strong> Intubación Orotraqueal exitosa (Tubo 5.5) con Capnografía</li>`; 
            }
            resumenHTML += `</ul></div></div>`;
            const chatBox = document.getElementById('chat-box');
            chatBox.insertAdjacentHTML('beforeend', resumenHTML);
            chatBox.scrollTop = chatBox.scrollHeight;
"""

new_content = re.sub(r"document\.getElementById\('debriefing-panel'\)\.classList\.remove\('hidden'\);", replacer, content, count=1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
