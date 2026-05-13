let equiposData = [];
let filteredData = [];
let currentTipo = '';
let currentTipoNormalizado = '';
let datosCargados = false;
let busquedaRealizada = false;

// Cargar datos del JSON
async function cargarDatos() {
    try {
        const response = await fetch('datos.json');
        equiposData = await response.json();
        filteredData = [...equiposData];
        inicializarApp();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        // Usar datos de ejemplo si falla la carga
        equiposData = [];
        filteredData = [];
        inicializarApp();
    }
}

// Inicializar la aplicación
function inicializarApp() {
    poblarFiltros();
    mostrarTipos();
    // No mostrar equipos hasta que se presione buscar
    mostrarMensajeInicial();
    actualizarEstadisticas();
    configurarEventListeners();
}

// Poblar los filtros desplegables
function poblarFiltros() {
    const tipos = [...new Set(equiposData.map(e => e.Tipo).filter(t => t))].sort();
    const marcas = [...new Set(equiposData.map(e => {
        const marcaModelo = e['Marca y Modelo'];
        if (marcaModelo) {
            const partes = marcaModelo.split('/');
            return partes[0].trim();
        }
        return '';
    }).filter(m => m))].sort();
    const anios = [...new Set(equiposData.map(e => e['Año']).filter(a => a))].sort((a, b) => {
        const aNum = parseInt(a) || 0;
        const bNum = parseInt(b) || 0;
        return bNum - aNum;
    });
    const patentes = [...new Set(equiposData.map(e => e.Patente).filter(p => p))].sort();

    const tipoFilter = document.getElementById('tipoFilter');
    const marcaFilter = document.getElementById('marcaFilter');
    const anioFilter = document.getElementById('anioFilter');
    const patenteFilter = document.getElementById('patenteFilter');

    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoFilter.appendChild(option);
    });

    marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        marcaFilter.appendChild(option);
    });

    anios.forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        anioFilter.appendChild(option);
    });

    patentes.forEach(patente => {
        const option = document.createElement('option');
        option.value = patente;
        option.textContent = patente;
        patenteFilter.appendChild(option);
    });
}

// Función para normalizar texto (eliminar acentos)
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Mostrar lista de tipos en el sidebar
function mostrarTipos() {
    const tipoList = document.getElementById('tipoList');
    tipoList.innerHTML = '';

    const tipos = {};
    equiposData.forEach(equipo => {
        const tipo = equipo.Tipo || 'Sin clasificar';
        // Normalizar para agrupar ignorando acentos y espacios extra
        const tipoNormalizado = normalizarTexto(tipo.trim());
        if (!tipos[tipoNormalizado]) {
            tipos[tipoNormalizado] = { nombre: tipo.trim(), count: 0, nombres: new Set() };
        }
        tipos[tipoNormalizado].count++;
        tipos[tipoNormalizado].nombres.add(tipo.trim());
    });

    // Ordenar por cantidad descendente
    const tiposOrdenados = Object.keys(tipos).sort((a, b) => tipos[b].count - tipos[a].count);

    tiposOrdenados.forEach(tipoNormalizado => {
        const li = document.createElement('li');
        // Usar el nombre más común para este grupo
        const nombreMasComun = obtenerNombreMasComun(tipos[tipoNormalizado].nombres);
        li.innerHTML = `
            <span>${nombreMasComun}</span>
            <span class="tipo-count">${tipos[tipoNormalizado].count}</span>
        `;
        li.addEventListener('click', () => filtrarPorTipo(nombreMasComun, li, tipoNormalizado));
        tipoList.appendChild(li);
    });
}

// Obtener el nombre más común de un set de nombres
function obtenerNombreMasComun(nombres) {
    const nombreArray = Array.from(nombres);
    if (nombreArray.length === 1) return nombreArray[0];
    
    // Contar frecuencia de cada nombre
    const frecuencias = {};
    nombreArray.forEach(nombre => {
        frecuencias[nombre] = (frecuencias[nombre] || 0) + 1;
    });
    
    // Retornar el nombre más frecuente
    return Object.keys(frecuencias).reduce((a, b) => frecuencias[a] > frecuencias[b] ? a : b);
}

// Filtrar por tipo
function filtrarPorTipo(tipo, element, tipoNormalizado) {
    currentTipo = tipo;
    currentTipoNormalizado = tipoNormalizado || normalizarTexto(tipo);
    
    // Actualizar clase activa
    document.querySelectorAll('.tipo-list li').forEach(li => li.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }

    busquedaRealizada = true;
    aplicarFiltros();
}

// Aplicar todos los filtros
function aplicarFiltros() {
    if (!busquedaRealizada) {
        return; // No mostrar resultados hasta que se presione buscar
    }

    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tipoFilter = document.getElementById('tipoFilter').value;
    const marcaFilter = document.getElementById('marcaFilter').value;
    const anioFilter = document.getElementById('anioFilter').value;
    const patenteFilter = document.getElementById('patenteFilter').value;

    filteredData = equiposData.filter(equipo => {
        const tipo = equipo.Tipo || '';
        const marcaModelo = equipo['Marca y Modelo'] || '';
        const anio = equipo['Año'] || '';
        const patente = equipo.Patente || '';

        // Filtro de búsqueda
        const matchSearch = !searchTerm || 
            normalizarTexto(tipo).includes(normalizarTexto(searchTerm)) ||
            normalizarTexto(marcaModelo).includes(normalizarTexto(searchTerm)) ||
            normalizarTexto(anio.toString()).includes(normalizarTexto(searchTerm)) ||
            normalizarTexto(patente).includes(normalizarTexto(searchTerm));

        // Filtro de tipo
        const matchTipo = !tipoFilter || tipo === tipoFilter;
        
        // Filtro de marca
        let matchMarca = !marcaFilter;
        if (marcaFilter && marcaModelo) {
            const partes = marcaModelo.split('/');
            matchMarca = partes[0].trim() === marcaFilter;
        }

        // Filtro de año
        const matchAnio = !anioFilter || anio === anioFilter;

        // Filtro de patente
        const matchPatente = !patenteFilter || patente === patenteFilter;

        // Filtro de tipo seleccionado en sidebar (ignorando acentos)
        const matchCurrentTipo = !currentTipo || normalizarTexto(tipo) === currentTipoNormalizado;

        return matchSearch && matchTipo && matchMarca && matchAnio && matchPatente && matchCurrentTipo;
    });

    mostrarEquipos();
    actualizarEstadisticas();
}

// Mostrar mensaje inicial
function mostrarMensajeInicial() {
    const grid = document.getElementById('equiposGrid');
    grid.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">Presiona el botón de búsqueda para ver los equipos</div>
            <div>Puedes usar el buscador de texto o los filtros desplegables</div>
        </div>
    `;
}

// Mostrar equipos en el grid
function mostrarEquipos() {
    const grid = document.getElementById('equiposGrid');
    grid.innerHTML = '';

    if (!busquedaRealizada) {
        mostrarMensajeInicial();
        return;
    }

    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No se encontraron resultados</div>
                <div>Intenta con otros filtros o términos de búsqueda</div>
            </div>
        `;
        return;
    }

    filteredData.forEach((equipo, index) => {
        const card = document.createElement('div');
        card.className = 'equipo-card';
        card.innerHTML = `
            <div class="equipo-tipo">${equipo.Tipo || 'Sin clasificar'}</div>
            <div class="equipo-marca">${extraerMarca(equipo['Marca y Modelo'])}</div>
            <div class="equipo-modelo">${extraerModelo(equipo['Marca y Modelo'])}</div>
            <div class="equipo-info">
                <div class="info-item">
                    <span class="info-label">Año</span>
                    <span class="info-value">${equipo['Año'] || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Patente</span>
                    <span class="info-value">${equipo.Patente || 'N/A'}</span>
                </div>
            </div>
            <div class="equipo-precio">${formatearPrecio(equipo['Precio Venta'])}</div>
        `;
        card.addEventListener('click', () => mostrarDetalle(equipo));
        grid.appendChild(card);
    });
}

// Extraer marca del campo Marca y Modelo
function extraerMarca(marcaModelo) {
    if (!marcaModelo) return 'N/A';
    const partes = marcaModelo.split('/');
    return partes[0].trim();
}

// Extraer modelo del campo Marca y Modelo
function extraerModelo(marcaModelo) {
    if (!marcaModelo) return 'N/A';
    const partes = marcaModelo.split('/');
    if (partes.length > 1) {
        return partes.slice(1).join('/').trim();
    }
    return '';
}

// Formatear precio
function formatearPrecio(precio) {
    if (!precio || precio === 'NaN') return 'Consultar';
    const num = parseFloat(precio.toString().replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return 'Consultar';
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(num);
}

// Mostrar detalle del equipo en modal
function mostrarDetalle(equipo) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-tipo">${equipo.Tipo || 'Sin clasificar'}</div>
            <div class="modal-titulo">${equipo['Marca y Modelo'] || 'N/A'}</div>
        </div>
        
        <div class="modal-grid">
            <div class="modal-field">
                <div class="modal-field-label">Año</div>
                <div class="modal-field-value">${equipo['Año'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Color</div>
                <div class="modal-field-value">${equipo.Color || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Patente</div>
                <div class="modal-field-value">${equipo.Patente || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">N° Serie/Chasis</div>
                <div class="modal-field-value">${equipo['N°.Interno - Serie o Chasis / Adicionales'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">N° Motor</div>
                <div class="modal-field-value">${equipo['N° Motor'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Seguros</div>
                <div class="modal-field-value">${equipo.Seguros || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">GPS / TAG</div>
                <div class="modal-field-value">${equipo['GPS / TAG'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Ubicación Actual</div>
                <div class="modal-field-value">${equipo['Ubicación Actual'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Horas/Km/Fecha Compra</div>
                <div class="modal-field-value">${equipo['Hr./Km./Fecha Compra'] || 'N/A'}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Valor Inventario</div>
                <div class="modal-field-value">${formatearPrecio(equipo['Valor Invent. $'])}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Precio Venta</div>
                <div class="modal-field-value">${formatearPrecio(equipo['Precio Venta'])}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">$ Acum. Ago.19</div>
                <div class="modal-field-value">${formatearPrecio(equipo['$ Acum. Ago.19'])}</div>
            </div>
        </div>

        ${equipo.NOTAS ? `
            <div class="modal-notas">
                <div class="modal-notas-label">📝 Notas</div>
                <div>${equipo.NOTAS}</div>
            </div>
        ` : ''}

        ${equipo['Historial / Ubicaciones'] ? `
            <div class="modal-historial">
                <div class="modal-historial-label">📍 Historial / Ubicaciones</div>
                <div>${equipo['Historial / Ubicaciones']}</div>
            </div>
        ` : ''}
    `;

    modal.style.display = 'block';
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    document.getElementById('totalEquipos').textContent = equiposData.length;
    
    const tipos = new Set(equiposData.map(e => e.Tipo).filter(t => t));
    document.getElementById('tiposCount').textContent = tipos.size;
    
    document.getElementById('filteredCount').textContent = busquedaRealizada ? filteredData.length : 0;
}

// Configurar event listeners
function configurarEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Solo aplicar filtros cuando se presiona el botón de búsqueda
    searchBtn.addEventListener('click', () => {
        busquedaRealizada = true;
        aplicarFiltros();
    });
    
    // Permitir búsqueda con Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            busquedaRealizada = true;
            aplicarFiltros();
        }
    });
    
    // Filtros - solo aplicar cuando se presiona el botón de buscar filtros
    document.getElementById('filterSearchBtn').addEventListener('click', () => {
        busquedaRealizada = true;
        aplicarFiltros();
    });
    
    // Limpiar filtros
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('tipoFilter').value = '';
        document.getElementById('marcaFilter').value = '';
        document.getElementById('anioFilter').value = '';
        document.getElementById('patenteFilter').value = '';
        currentTipo = '';
        currentTipoNormalizado = '';
        busquedaRealizada = false;
        document.querySelectorAll('.tipo-list li').forEach(li => li.classList.remove('active'));
        mostrarMensajeInicial();
        actualizarEstadisticas();
    });
    
    // Modal
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Iniciar aplicación cuando cargue el DOM
document.addEventListener('DOMContentLoaded', cargarDatos);
