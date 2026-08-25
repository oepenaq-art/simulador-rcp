import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Doctor -> Doctor(a)
content = re.sub(r'Doctor,', 'Doctor(a),', content)
content = re.sub(r'Doctor/a', 'Doctor(a)', content)
content = re.sub(r'Doctor:', 'Doctor(a):', content)

# 2. Reemplazar nota-rcp-content por el formulario estático
static_form = """<div id="nota-rcp-content" class="text-xs border border-gray-300 rounded print-container" style="font-family: Arial, sans-serif;">
<table class="w-full border-collapse border border-gray-300 text-left">
    <tbody>
        <tr>
            <th class="border p-2 bg-gray-100" style="width: 30%">Fecha y hora de activación de código azul:</th>
            <td class="border p-1" style="width: 40%"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="DD/MM/YYYY HH:MM"></td>
            <th class="border p-2 bg-gray-100">Peso (Kg)</th>
            <td class="border p-1 text-center"><input type="text" class="w-full h-full border-0 p-1 text-center bg-blue-50 focus:bg-white" placeholder="20"></td>
        </tr>
        <tr>
            <th class="border p-2 bg-gray-100">Lugar de ocurrencia del evento:</th>
            <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="A-08-UCE PEDIATRIA"></td>
            <th class="border p-2 bg-gray-100">Evento inicial:</th>
            <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="Taquicardia ventricular sin pulso"></td>
        </tr>
        <tr>
            <th class="border p-2 bg-gray-100">¿Se realizan maniobras de reanimación cardiopulmonar?</th>
            <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="Si / No"></td>
            <td colspan="2" class="border p-0">
                <table class="w-full border-collapse">
                    <tr>
                        <td class="border-b p-2 text-xs" style="width:65%">Fecha y hora de inicio de reanimación cardiopulmonar básica (RCP):</td>
                        <td class="border-b border-l p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="DD/MM/YYYY HH:MM"></td>
                    </tr>
                    <tr>
                        <td class="p-2 text-xs">Fecha y hora de inicio de reanimación cardiopulmonar avanzada (RCP):</td>
                        <td class="border-l p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="DD/MM/YYYY HH:MM"></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <th class="border p-2 bg-gray-100">Causas de no reanimación:</th>
            <td colspan="3" class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
        </tr>
        <tr>
            <th colspan="4" class="border p-2 bg-gray-200">^ Maniobras de reanimación cardiopulmonar básica:</th>
        </tr>
        <tr>
            <td colspan="2" class="border p-2"><span class="font-bold">Compresiones torácicas:</span> <input type="text" class="w-24 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white" placeholder="Si/No"></td>
            <td colspan="2" class="border p-2"><span class="font-bold">Ventilación con presión positiva:</span> <input type="text" class="w-24 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white" placeholder="Si/No"></td>
        </tr>
        <tr>
            <th colspan="4" class="border p-2 bg-gray-200">^ Maniobras de reanimación avanzada:</th>
        </tr>
        <tr>
            <td colspan="2" class="border p-2"><span class="font-bold">Tipo de acceso circulatorio:</span> <input type="text" class="w-32 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white"></td>
            <td colspan="2" class="border p-2"><span class="font-bold">Tipo de acceso ventilatorio:</span> <input type="text" class="w-32 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white"></td>
        </tr>
        <tr>
            <th class="border p-2 bg-gray-100">Recibió terapia eléctrica:</th>
            <td colspan="3" class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="Si / No (Jules...)"></td>
        </tr>
        <tr>
            <th colspan="2" class="border p-2 bg-gray-100 text-center">Medicamentos:</th>
            <td colspan="2" class="border p-0">
                <table class="w-full border-collapse h-full">
                    <tr><th class="border-b p-2 bg-gray-100" style="width:65%">Retorno a la circulación espontánea:</th><td class="border-b border-l p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white" placeholder="Si / No"></td></tr>
                    <tr><th class="border-b p-2 bg-gray-100">Tiempo total de reanimación cardiopulmonar (minutos):</th><td class="border-b border-l p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td></tr>
                    <tr><th class="p-2 bg-gray-100" valign="top">Observaciones:</th><td class="border-l p-1" valign="top"><textarea class="w-full h-12 border-0 p-1 resize-none bg-blue-50 focus:bg-white"></textarea></td></tr>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="4" class="border p-0">
                <table class="w-full border-collapse text-center">
                    <tr class="bg-gray-100">
                        <th class="border p-2">Nombre del medicamento</th>
                        <th class="border p-2">Vía de administración</th>
                        <th class="border p-2">Hora inicio (Relativo)</th>
                        <th class="border p-2">Observaciones (dosis, frecuencia...)</th>
                    </tr>
                    <tr>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                    </tr>
                    <tr>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                    </tr>
                    <tr>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                        <td class="border p-1"><input type="text" class="w-full h-full border-0 p-1 bg-blue-50 focus:bg-white"></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="2" class="border p-2"><span class="font-bold">Número de reanimadores:</span> <input type="text" class="w-32 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white"></td>
            <td colspan="2" class="border p-2"><span class="font-bold">Nombre del líder de la reanimación:</span> <input type="text" class="w-64 ml-2 border-b border-gray-400 bg-blue-50 focus:bg-white"></td>
        </tr>
    </tbody>
</table>
</div>"""
content = re.sub(r'<div id="nota-rcp-content" class="text-xs border border-gray-300 rounded print-container" style="font-family: Arial, sans-serif;">\s*<!-- El contenido se generará dinámicamente en mostrarNotaRCP\(\) -->\s*</div>', static_form, content)


# 3. Add title text to modal-nota-rcp
content = re.sub(r'<h3 class="font-bold text-xl text-gray-800"><i class="fas fa-file-medical-alt mr-2"></i>Registro Clínico de Reanimación Cardiopulmonar</h3>', '<h3 class="font-bold text-xl text-gray-800"><i class="fas fa-file-medical-alt mr-2"></i>Registro Clínico de Reanimación Cardiopulmonar</h3>\n                <p class="text-sm text-blue-800 font-semibold mt-1">Guárdalo para llevarlo el día del curso.</p>', content)

# 4. Modificar mostrarNotaRCP para solo abrir el modal
new_fn = """function mostrarNotaRCP() {
            openModal('modal-nota-rcp');
        }"""
content = re.sub(r'function mostrarNotaRCP\(\) \{[\s\S]*?document\.getElementById\(\'nota-rcp-content\'\)\.innerHTML = tableHTML;[\s\S]*?openModal\(\'modal-nota-rcp\'\);\s*\}', new_fn, content)

# 5. Inyectar el resumen de acciones en finalizarSimulacion
def replacer(m):
    return m.group(0) + """

            // --- GENERAR RESUMEN DE ACCIONES Y ENVIAR AL CHAT ---
            let resumenHTML = `<div class="mb-4 text-left">
                <div class="inline-block p-4 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-emerald-600 shadow-md w-full">
                    <h4 class="font-bold text-lg mb-2"><i class="fas fa-list-check mr-2"></i>Resumen de Acciones (Tiempos Reales)</h4>
                    <p class="text-xs mb-3 text-emerald-700">Utiliza esta información detallada para diligenciar tu Registro Clínico manualmente.</p>
                    <ul class="list-disc pl-5 space-y-1 text-sm font-mono">`;
            resumenHTML += `<li><strong>Min 00:00:</strong> Inicio de Compresiones Torácicas y BVM</li>`;
            
            let events = [];
            state.descargas.forEach((d, i) => { events.push({time: d.time, text: `Descarga ${i+1} administrada (${d.energy} J)`}); });
            state.meds.forEach(m => { events.push({time: m.time, text: `${m.name} (${m.route}) - ${m.obs}`}); });
            
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

content = re.sub(r"document\.getElementById\('debriefing-panel'\)\.classList\.remove\('hidden'\);", replacer, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
