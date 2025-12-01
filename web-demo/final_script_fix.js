async function sendMessage(autoSpeak = false) {
    const input = document.getElementById('chat-input'); const msg = input.value.trim(); if (!msg) return;
    const chat = document.getElementById('chat-messages');
    chat.innerHTML += `<div class="chat-user self-end bg-gray-800 text-white rounded-2xl rounded-tr-none p-3 text-sm shadow-sm max-w-[85%] mb-2">${msg}</div>`;
    input.value = ''; chat.scrollTop = chat.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    chat.innerHTML += `<div id="${loadingId}" class="chat-ai self-start bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 text-sm shadow-sm max-w-[85%] mb-2"><div class="flex gap-1"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    chat.scrollTop = chat.scrollHeight;

    try {
        const context = `Eres el asistente del Banco de Sangre ISSS Sonsonate.
                Horario: 5:30-6:30 AM (Orden llegada). 
                Cupos: Lunes(${CUPOS_DIARIOS[1]}), Martes(${CUPOS_DIARIOS[2]}), Miércoles(${CUPOS_DIARIOS[3]}), Jueves(${CUPOS_DIARIOS[4]}), Viernes(${CUPOS_DIARIOS[5]}), Sábado(${CUPOS_DIARIOS[6]}).
                Requisitos: ${requisitosBasicos.join(', ')}. 
                Restricciones: ${restricciones.join(', ')}.
                Responde breve y amable.`;

        console.log("DEBUG: Sending request with Key:", GEMINI_API_KEY ? "Present" : "Missing");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context + "\nUsuario: " + msg }] }] })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error Details:", errText);

            let friendlyMsg = "Error de conexión.";
            if (response.status === 400 && errText.includes("API Key")) {
                friendlyMsg = "Error: API Key inválida. Verifica tu clave.";
            } else if (response.status === 404) {
                friendlyMsg = "Error: Modelo no encontrado.";
            }

            throw new Error(`${friendlyMsg} (${response.status})`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, error de conexión.";

        document.getElementById(loadingId).remove();
        chat.innerHTML += `<div class="chat-ai self-start bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 text-sm shadow-sm max-w-[85%] mb-2">${marked.parse(reply)}</div>`;
        chat.scrollTop = chat.scrollHeight;

        if (autoSpeak || !isMuted) speak(reply);

    } catch (e) {
        console.error(e);
        document.getElementById(loadingId).remove();
        chat.innerHTML += `<div class="chat-ai self-start bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs mb-2">⚠️ ${e.message}</div>`;
    }
}

// --- LOGIC ---
function initializeTabs() {
    const tabs = ['agendar', 'mis-citas', 'requisitos', 'admin'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).addEventListener('click', () => {
            tabs.forEach(x => { document.getElementById(`tab-${x}`).classList.remove('active', 'text-red-900', 'bg-fef2f2'); document.getElementById(`tab-${x}`).classList.add('text-gray-500'); document.getElementById(`view-${x}`).classList.add('hidden'); });
            document.getElementById(`tab-${t}`).classList.add('active', 'text-red-900', 'bg-fef2f2'); document.getElementById(`tab-${t}`).classList.remove('text-gray-500'); document.getElementById(`view-${t}`).classList.remove('hidden');
            if (t === 'admin') { if (isAdminUnlocked) { document.getElementById('admin-lock-screen').classList.add('hidden'); document.getElementById('admin-content').classList.remove('hidden'); loadAdminData(); } else { document.getElementById('admin-lock-screen').classList.remove('hidden'); document.getElementById('admin-content').classList.add('hidden'); } }
            if (t === 'mis-citas') { document.getElementById('mis-citas-container').innerHTML = '<div class="text-center py-12 text-gray-400 flex flex-col items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"><span class="text-4xl mb-3">🔍</span><p>Ingresa tu número para ver resultados</p></div>'; document.getElementById('buscar-afiliacion').value = ''; }
        });
    });
    document.getElementById('btn-agendar-desde-requisitos').onclick = () => document.getElementById('tab-agendar').click();
}

function checkAdminAuth() { if (document.getElementById('admin-password').value === '1234') { isAdminUnlocked = true; document.getElementById('admin-password').value = ''; document.getElementById('admin-lock-screen').classList.add('hidden'); document.getElementById('admin-content').classList.remove('hidden'); loadAdminData(); } else showError('Contraseña incorrecta'); }
window.checkAdminAuth = checkAdminAuth; window.logoutAdmin = () => { isAdminUnlocked = false; document.getElementById('admin-lock-screen').classList.remove('hidden'); document.getElementById('admin-content').classList.add('hidden'); };

function initializeCalendar() { document.getElementById('prev-month').onclick = () => { currentMonth.setMonth(currentMonth.getMonth() - 1); updateCalendar(); }; document.getElementById('next-month').onclick = () => { currentMonth.setMonth(currentMonth.getMonth() + 1); updateCalendar(); }; updateCalendar(); }
function getCuposDia(dateObj) { const day = dateObj.getDay(); return CUPOS_DIARIOS[day] || 20; }

function updateCalendar() {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('current-month').textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1); const startDate = new Date(firstDay); startDate.setDate(startDate.getDate() - firstDay.getDay());
    const grid = document.getElementById('calendar-grid'); grid.innerHTML = '';
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate); date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isCurrent = date.getMonth() === currentMonth.getMonth();
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        const isWorkingDay = diasAtencion.includes(date.getDay());
        const isFestivo = diasFestivos.some(f => f.fecha === dateStr);
        const el = document.createElement('div'); el.className = 'calendar-day border rounded-lg text-center relative ';
        if (!isCurrent) el.className += 'bg-gray-50 text-gray-300 border-transparent';
        else if (isPast || !isWorkingDay || isFestivo) el.className += 'bg-gray-100 text-gray-400 cursor-not-allowed';
        else {
            const count = currentCitas.filter(c => c.fecha_cita === dateStr && c.estado === 'Programada').length;
            const totalCupos = getCuposDia(date); const remaining = totalCupos - count;
            if (remaining <= 0) { el.className += 'full bg-red-50 border-red-200 text-red-400'; el.innerHTML = `<span class="font-bold text-lg">${date.getDate()}</span><span class="text-[10px] block leading-none">Lleno</span>`; }
            else { const statusClass = remaining < 5 ? 'limited' : 'available'; el.className += `${statusClass} cursor-pointer active:scale-95`; el.onclick = () => selectDate(dateStr); el.innerHTML = `<span class="font-bold text-lg text-gray-800">${date.getDate()}</span>`; const dotColor = remaining < 5 ? 'bg-yellow-500' : 'bg-green-500'; el.innerHTML += `<div class="w-1.5 h-1.5 rounded-full ${dotColor} mx-auto mt-1"></div>`; }
            if (selectedDate === dateStr) el.classList.add('selected', 'ring-2', 'ring-blue-500', 'border-transparent');
        }
        if ((!isCurrent || isPast || !isWorkingDay || isFestivo) && !el.innerHTML) { el.innerHTML = `<span class="font-medium">${date.getDate()}</span>`; if (isFestivo) el.innerHTML += `<div class="text-[8px] text-red-500">Festivo</div>`; }
        grid.appendChild(el);
    }
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedTime = "Orden de llegada";
    updateCalendar();
    document.getElementById('step-form').classList.remove('hidden');
    document.getElementById('appointment-summary').textContent = `${new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - Orden de llegada(5:30 - 6:30 AM)`;
    document.getElementById('step-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initializeForm() {
    const form = document.getElementById('appointment-form');
    document.getElementById('numero-afiliacion').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
    document.getElementById('btn-back-to-time').onclick = () => { document.getElementById('step-form').classList.add('hidden'); };
    form.onsubmit = async (e) => {
        e.preventDefault(); showLoading(true); const fd = new FormData(form);
        const cita = { nombre_paciente: fd.get('nombre-paciente'), cantidad_donantes: parseInt(fd.get('cantidad-donantes')), numero_afiliacion: fd.get('numero-afiliacion'), tipo_sangre: fd.get('tipo-sangre'), telefono: fd.get('telefono'), fecha_cita: selectedDate, hora_cita: "05:30", estado: 'Programada', createdAt: new Date().toISOString() };
        const res = await window.dataSdk.create(cita); showLoading(false);
        if (res.isOk) { showSuccess('¡Cita Agendada!'); form.reset(); document.getElementById('step-form').classList.add('hidden'); selectedDate = null; updateCalendar(); document.getElementById('tab-mis-citas').click(); setTimeout(() => { document.getElementById('buscar-afiliacion').value = cita.numero_afiliacion; buscarCitas(); }, 600); } else showError('Error al guardar');
    };
}

function initializeMisCitas() { document.getElementById('btn-buscar-citas').onclick = buscarCitas; }
function buscarCitas() {
    const val = document.getElementById('buscar-afiliacion').value; if (!val) return showError('Ingresa afiliación');
    const found = currentCitas.filter(c => c.numero_afiliacion === val && c.estado === 'Programada');
    const container = document.getElementById('mis-citas-container');
    if (found.length === 0) { container.innerHTML = '<div class="text-center py-12 text-gray-400 flex flex-col items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"><span class="text-4xl mb-3">🔍</span><p>No se encontraron citas activas</p></div>'; return; }
    container.innerHTML = found.map(c => `<div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden"><div class="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-10 -mt-10 z-0"></div><div class="relative z-10"><div class="flex justify-between items-start mb-2"><div><h4 class="font-bold text-lg text-gray-800">${c.nombre_paciente}</h4><div class="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">${c.numero_afiliacion}</div></div><span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-lg">Activa</span></div><div class="flex items-center gap-3 mt-3 text-sm text-gray-600"><span class="flex items-center">📅 ${c.fecha_cita}</span><span class="flex items-center">⏰ 5:30 AM</span></div><div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center"><span class="text-xs font-bold text-red-600 uppercase">Orden de llegada</span><button onclick="cancelarCita('${c.__backendId}')" class="text-red-500 text-sm font-medium px-3 py-1 border border-red-100 rounded-lg active:bg-red-50 hover:bg-red-50">Cancelar</button></div></div></div>`).join('');
}

function renderRequisitos() {
    const ul1 = document.getElementById('requisitos-basicos-display'); const ul2 = document.getElementById('restricciones-display'); const ul3 = document.getElementById('consejos-antes-display'); const ul4 = document.getElementById('consejos-despues-display');
    if (ul1) ul1.innerHTML = requisitosBasicos.map(r => `<li>${r}</li>`).join(''); if (ul2) ul2.innerHTML = restricciones.map(r => `<li>${r}</li>`).join(''); if (ul3) ul3.innerHTML = consejosAntes.map(r => `<li>${r}</li>`).join(''); if (ul4) ul4.innerHTML = consejosDespues.map(r => `<li>${r}</li>`).join('');
}

function initializeAdminPanel() {
    document.getElementById('btn-guardar-horarios').onclick = () => { for (let i = 1; i <= 6; i++) { CUPOS_DIARIOS[i] = parseInt(document.getElementById(`cupo-${i}`).value) || 20; } saveConfig(); updateCalendar(); showSuccess('Configuración guardada'); };
    document.getElementById('btn-agregar-festivo').onclick = () => { const date = document.getElementById('fecha-festivo').value; const name = document.getElementById('nombre-festivo').value; if (date && name) { diasFestivos.push({ fecha: date, nombre: name }); saveConfig(); renderFestivos(); updateCalendar(); document.getElementById('nombre-festivo').value = ''; } };
    document.getElementById('btn-filtrar-citas').onclick = loadAdminData;
    document.getElementById('btn-exportar-citas').onclick = () => { const header = "Fecha,Paciente,Afiliacion,Sangre,Estado\n"; const rows = currentCitas.map(c => `${c.fecha_cita},${c.nombre_paciente},${c.numero_afiliacion},${c.tipo_sangre},${c.estado}`).join("\n"); const blob = new Blob([header + rows], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'citas.csv'; a.click(); };
}

function loadAdminData() {
    const container = document.getElementById('admin-citas-container'); const filterDate = document.getElementById('filtro-fecha').value; const filterStatus = document.getElementById('filtro-estado').value;
    for (let i = 1; i <= 6; i++) document.getElementById(`cupo-${i}`).value = CUPOS_DIARIOS[i];
    document.getElementById('stat-total').textContent = currentCitas.length; document.getElementById('stat-hoy').textContent = currentCitas.filter(c => c.fecha_cita === new Date().toISOString().split('T')[0]).length;
    const donantes = currentCitas.reduce((sum, c) => sum + (parseInt(c.donantes_reales) || 0), 0); document.getElementById('stat-donantes').textContent = donantes; document.getElementById('stat-ausencias').textContent = currentCitas.filter(c => c.estado === 'No asistió').length;
    renderAdminList('list-admin-req', requisitosBasicos); renderAdminList('list-admin-res', restricciones); renderAdminList('list-admin-tip-before', consejosAntes); renderAdminList('list-admin-tip-after', consejosDespues); renderFestivos();
    let data = [...currentCitas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); if (filterDate) data = data.filter(c => c.fecha_cita === filterDate); if (filterStatus) data = data.filter(c => c.estado === filterStatus);
    if (data.length === 0) { container.innerHTML = '<div class="text-center py-6 text-gray-400">Sin registros</div>'; return; }
    container.innerHTML = data.map(c => `<div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100 hover:shadow-sm transition-shadow"><div><div class="font-bold text-gray-800 text-sm md:text-base">${c.nombre_paciente}</div><div class="text-xs text-gray-500">${c.fecha_cita} • ${c.cantidad_donantes} donantes</div><div class="text-[10px] mt-1 px-2 py-0.5 bg-white rounded border inline-block">${c.estado}</div></div><div class="flex gap-2">${c.estado === 'Programada' ? `<button onclick="mostrarModalCompletada('${c.__backendId}', ${c.cantidad_donantes})" class="bg-green-100 text-green-700 p-2 rounded-lg text-xs font-bold hover:bg-green-200">Completar</button>` : ''}<button onclick="mostrarConfirmacionEliminar('${c.__backendId}')" class="bg-white border text-red-500 p-2 rounded-lg text-xs hover:bg-red-50">🗑</button></div></div>`).join('');
}

function renderAdminList(id, arr) {
    const el = document.getElementById(id); if (!el) return; el.innerHTML = arr.map((item, i) => `<li class="flex justify-between items-center bg-white p-1 rounded border border-gray-100"><span>${item}</span><button class="text-red-500 font-bold px-2" onclick="window.removeReqItem('${id}',${i})">×</button></li>`).join('');
    window.removeReqItem = (listId, idx) => { if (listId === 'list-admin-req') requisitosBasicos.splice(idx, 1); if (listId === 'list-admin-res') restricciones.splice(idx, 1); if (listId === 'list-admin-tip-before') consejosAntes.splice(idx, 1); if (listId === 'list-admin-tip-after') consejosDespues.splice(idx, 1); saveConfig(); loadAdminData(); renderRequisitos(); };
}

function addReq(type, inputId) { const val = document.getElementById(inputId).value; if (!val) return; if (type === 'requisitosBasicos') requisitosBasicos.push(val); if (type === 'restricciones') restricciones.push(val); if (type === 'consejosAntes') consejosAntes.push(val); if (type === 'consejosDespues') consejosDespues.push(val); document.getElementById(inputId).value = ''; saveConfig(); loadAdminData(); renderRequisitos(); } window.addReq = addReq;
function renderFestivos() { const el = document.getElementById('festivos-container'); if (!el) return; el.innerHTML = diasFestivos.map((f, i) => `<div class="flex justify-between text-xs bg-red-50 p-2 rounded mb-1"><span>${f.fecha}: ${f.nombre}</span><button class="text-red-600 font-bold" onclick="removeFestivo(${i})">×</button></div>`).join(''); } window.removeFestivo = (i) => { diasFestivos.splice(i, 1); saveConfig(); renderFestivos(); updateCalendar(); };
function saveConfig() { const config = { cupos: CUPOS_DIARIOS, festivos: diasFestivos, req: requisitosBasicos, res: restricciones, tipsBefore: consejosAntes, tipsAfter: consejosDespues }; localStorage.setItem('banco_config_v11', JSON.stringify(config)); }

function showLoading(b) { document.getElementById('loading').classList.toggle('hidden', !b); }
function showSuccess(m) { const el = document.getElementById('success-message'); el.querySelector('p').textContent = m; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2500); }
function showError(m) { const el = document.getElementById('error-message'); document.getElementById('error-text').textContent = m; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }

window.cancelarCita = async (id) => { if (!confirm('¿Seguro deseas cancelar?')) return; const item = currentCitas.find(c => c.__backendId === id); if (item) await window.dataSdk.delete(item); buscarCitas(); showSuccess('Cita cancelada'); };
let activeId = null;
window.mostrarModalCompletada = (id, cant) => { activeId = id; document.getElementById('donantes-reales').value = cant; document.getElementById('modal-completada').classList.remove('hidden'); };
window.cerrarModalCompletada = () => document.getElementById('modal-completada').classList.add('hidden');
window.confirmarCompletada = async () => { const item = currentCitas.find(c => c.__backendId === activeId); const reales = document.getElementById('donantes-reales').value; if (item) await window.dataSdk.update({ ...item, estado: 'Completada', donantes_reales: reales }); cerrarModalCompletada(); loadAdminData(); showSuccess('Cita completada'); };
window.mostrarConfirmacionEliminar = (id) => { activeId = id; document.getElementById('modal-eliminar').classList.remove('hidden'); };
window.cerrarModalEliminar = () => document.getElementById('modal-eliminar').classList.add('hidden');
window.confirmarEliminacion = async () => { const item = currentCitas.find(c => c.__backendId === activeId); if (item) await window.dataSdk.delete(item); cerrarModalEliminar(); loadAdminData(); showSuccess('Registro eliminado'); };
    </script >
</body >
</html >
