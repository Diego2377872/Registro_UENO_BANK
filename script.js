// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosGuardados();
    actualizarVistaPrevia();
    
    // Escuchar cambios en los inputs para actualizar la vista previa
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            actualizarVistaPrevia();
        }
    });
});

// Función para agregar una nueva fila
function agregarFila() {
    const tbody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="date" class="fecha-input"></td>
        <td><input type="text" inputmode="numeric" placeholder="Ej: 1,000.50" class="monto-input"></td>
        <td><input type="text" placeholder="Nombre del local" class="local-input"></td>
        <td>
            <select class="reintegro-select">
                <option value="">Seleccione</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
            </select>
        </td>
        <td><button onclick="eliminarFila(this)" class="delete-btn">❌ Eliminar</button></td>
    `;
    tbody.appendChild(newRow);
    
    // Establecer la fecha actual por defecto
    const fechaInput = newRow.querySelector('.fecha-input');
    const today = new Date().toISOString().split('T')[0];
    fechaInput.value = today;
    
    actualizarVistaPrevia();
}

// Función para eliminar una fila
function eliminarFila(button) {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
        const row = button.closest('tr');
        row.remove();
        guardarDatos();
        actualizarVistaPrevia();
    }
}

// Función para guardar datos en localStorage
function guardarDatos() {
    const filas = obtenerDatosTabla();
    localStorage.setItem('registroGastos', JSON.stringify(filas));
    mostrarMensaje('Datos guardados correctamente.');
}

// Función para cargar datos guardados
function cargarDatosGuardados() {
    const datosGuardados = localStorage.getItem('registroGastos');
    if (datosGuardados) {
        const filas = JSON.parse(datosGuardados);
        filas.forEach(fila => {
            const tbody = document.getElementById('tableBody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="date" value="${fila.fecha}" class="fecha-input"></td>
                <td><input type="text" inputmode="numeric" value="${fila.monto}" class="monto-input"></td>
                <td><input type="text" value="${fila.local}" class="local-input"></td>
                <td>
                    <select class="reintegro-select">
                        <option value="">Seleccione</option>
                        <option value="Sí" ${fila.reintegro === 'Sí' ? 'selected' : ''}>Sí</option>
                        <option value="No" ${fila.reintegro === 'No' ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td><button onclick="eliminarFila(this)" class="delete-btn">❌ Eliminar</button></td>
            `;
            tbody.appendChild(newRow);
        });
    }
}

// Función para exportar a CSV (Excel)
function exportarCSV() {
    const filas = obtenerDatosTabla();
    
    if (filas.length === 0) {
        mostrarMensaje('No hay datos para exportar.', 'error');
        return;
    }
    
    // Convertir a CSV
    let csv = 'Fecha,Monto,Local,Reintegro\n';
    filas.forEach(fila => {
        csv += `"${fila.fecha || ''}","${fila.monto || ''}","${fila.local || ''}","${fila.reintegro || ''}"\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarMensaje('Archivo exportado correctamente.');
}

// Función para obtener los datos actuales de la tabla
function obtenerDatosTabla() {
    const filas = [];
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input, select');
        filas.push({
            fecha: inputs[0].value,
            monto: inputs[1].value,
            local: inputs[2].value,
            reintegro: inputs[3].value
        });
    });
    
    return filas;
}

// Función para actualizar la vista previa en tiempo real
function actualizarVistaPrevia() {
    const filas = obtenerDatosTabla();
    const previewContent = document.getElementById('previewContent');
    
    if (filas.length === 0) {
        previewContent.innerHTML = '<p>No hay gastos registrados todavía.</p>';
        return;
    }
    
    let html = '';
    filas.forEach((fila, index) => {
        html += `
            <div class="gasto-item">
                <div class="gasto-header">Gasto #${index + 1}</div>
                <div><strong>Fecha:</strong> ${fila.fecha || 'No especificada'}</div>
                <div><strong>Monto:</strong> ${fila.monto || '0'}</div>
                <div><strong>Local:</strong> ${fila.local || 'No especificado'}</div>
                <div><strong>Reintegro:</strong> ${fila.reintegro || 'No especificado'}</div>
            </div>
        `;
    });
    
    previewContent.innerHTML = html;
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}