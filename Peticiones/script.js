/**
 * ============================================================================
 * APLICACIÓN DEL CLIMA - SIMULACIÓN DE PETICIONES HTTP
 * ============================================================================
 * Proyecto educativo para demostrar el uso de Fetch API, análisis de 
 * peticiones HTTP, códigos de estado, CORS y manejo de errores.
 * 
 * Autor: Daniel - Ape005
 * Fecha: Enero 2025
 * ============================================================================
 */

// ==================== CONFIGURACIÓN ====================

// Elementos del DOM
const cityInput = document.getElementById('cityInput');
const btnSearch = document.getElementById('btnSearch');
const btnMadrid = document.getElementById('btnMadrid');
const btnTokyo = document.getElementById('btnTokyo');
const btnNewYork = document.getElementById('btnNewYork');
const btnParis = document.getElementById('btnParis');
const resultado = document.getElementById('resultado');
const loading = document.getElementById('loading');
const cacheStatus = document.getElementById('cacheStatus');
const cacheInfo = document.getElementById('cacheInfo');
const btnClearCache = document.getElementById('btnClearCache');

// Configuración de la API del Clima (wttr.in - GRATIS, SIN API KEY)
// Esta API no requiere registro y no tiene límites
const API_URL = 'https://wttr.in';

// Sistema de caché para evitar peticiones repetidas
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Control de rate limiting
let ultimaPeticion = 0;
const MIN_INTERVALO = 2000; // 2 segundos entre peticiones

// ==================== FUNCIONES PRINCIPALES ====================

async function obtenerClima(city) {
  // Verificar caché primero
  const cacheKey = city.toLowerCase();
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const tiempoEnCache = Math.round((Date.now() - cached.timestamp) / 1000);
    console.log(' Usando datos en caché para:', city);
    console.log(` Datos guardados hace: ${tiempoEnCache} segundos`);
    
    // Mostrar banner de caché
    cacheStatus.className = 'cache-status';
    cacheInfo.innerHTML = ` <strong>Datos desde caché</strong> - ${city} (hace ${tiempoEnCache}s)`;
    
    mostrarClima(cached.data, '0 (caché)', 200, true);
    return;
  }

  // Control de rate limiting (evitar peticiones muy seguidas)
  const ahora = Date.now();
  const tiempoDesdeUltima = ahora - ultimaPeticion;
  
  if (tiempoDesdeUltima < MIN_INTERVALO) {
    const espera = MIN_INTERVALO - tiempoDesdeUltima;
    console.warn(` Esperando ${espera}ms para espaciar peticiones...`);
    await new Promise(resolve => setTimeout(resolve, espera));
  }
  
  ultimaPeticion = Date.now();

  // wttr.in usa formato: https://wttr.in/Ciudad?format=j1
  const url = `${API_URL}/${encodeURIComponent(city)}?format=j1`;
  
  console.group(` PETICIÓN HTTP - Consulta del Clima: ${city}`);
  console.log(' URL completa:', url);
  console.log(' Método HTTP:', 'GET');
  console.log(' API:', 'wttr.in (Gratis, sin API Key)');
  console.log(' Timestamp:', new Date().toLocaleString());
  
  const startTime = performance.now();
  loading.classList.remove('hidden');
  resultado.innerHTML = '';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    const endTime = performance.now();
    const tiempoRespuesta = (endTime - startTime).toFixed(2);

    console.log(' Tiempo de respuesta:', `${tiempoRespuesta}ms`);
    console.log(' Código de estado HTTP:', response.status, response.statusText);
    console.log(' Petición exitosa:', response.ok);
    
    console.group(' Request Headers (Enviados)');
    console.log('Accept:', 'application/json');
    console.log('Origin:', window.location.origin);
    console.log('User-Agent:', navigator.userAgent);
    console.groupEnd();

    console.group(' Response Headers (Recibidos)');
    response.headers.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();

    console.group(' Análisis de Políticas CORS');
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin') || 'No especificado',
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods') || 'No especificado',
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers') || 'No especificado'
    };
    console.table(corsHeaders);
    
    const corsStatus = corsHeaders['Access-Control-Allow-Origin'] !== 'No especificado';
    console.log(' Estado CORS:', corsStatus ? '✅ PERMITIDO' : '❌ BLOQUEADO');
    console.groupEnd();

    if (!response.ok) {
      const errorMessages = {
        404: 'Ciudad no encontrada. Verifica el nombre',
        500: 'Error en el servidor de la API',
        503: 'Servicio no disponible temporalmente'
      };
      
      const errorMsg = errorMessages[response.status] || `Error HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Guardar en caché
    cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    console.log(' Datos guardados en caché');
    console.log(' Total de ciudades en caché:', cache.size);
    
    // Actualizar indicador visual
    actualizarEstadoCache();
    
    console.log(' Datos JSON recibidos:', data);
    console.log(' Temperatura:', `${data.current_condition[0].temp_C}°C`);
    console.log(' Ubicación:', data.nearest_area[0].areaName[0].value);
    console.groupEnd();

    mostrarClima(data, tiempoRespuesta, response.status, false);

  } catch (error) {
    const endTime = performance.now();
    const tiempoRespuesta = (endTime - startTime).toFixed(2);
    
    console.error(' ERROR EN LA PETICIÓN');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error(' Tiempo hasta el error:', `${tiempoRespuesta}ms`);
    
    // Detectar tipo de error
    let mensajeError = error.message;
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      mensajeError = 'Error de conexión: No se pudo conectar con la API';
      console.error(' Posibles causas:');
      console.error('  1. No hay conexión a internet');
      console.error('  2. La API está bloqueada por firewall/antivirus');
      console.error('  3. Problema con CORS (abre desde un servidor, no file://)');
      console.error('  4. La API está temporalmente fuera de servicio');
    }
    
    console.groupEnd();
    mostrarError(mensajeError, tiempoRespuesta);
    
  } finally {
    loading.classList.add('hidden');
  }
}

function mostrarClima(data, tiempo, status, desdeCache = false) {
  const current = data.current_condition[0];
  const location = data.nearest_area[0];
  
  // Convertir descripción del clima
  const weatherDesc = current.weatherDesc[0].value;
  const weatherIcon = obtenerIconoClima(current.weatherCode);
  
  resultado.innerHTML = `
    <div class="weather-card">
      ${desdeCache ? `
      <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; border: 2px solid #4caf50;">
        <strong style="color: #2e7d32;">💾 Datos desde caché local</strong>
        <p style="color: #1b5e20; font-size: 0.9em; margin-top: 5px;">No se realizó una nueva petición HTTP</p>
      </div>
      ` : ''}
      
      <div class="weather-header">
        <h2>${location.areaName[0].value}</h2>
        <p class="country">${location.country[0].value}</p>
      </div>
      
      <div class="weather-main">
        <div class="temperature">
          <div class="temp-value">${current.temp_C}°C</div>
        </div>
        
        <div class="weather-icon">${weatherIcon}</div>
        
        <div class="weather-description">
          <h3>${weatherDesc}</h3>
          <p class="feels-like">Sensación térmica: ${current.FeelsLikeC}°C</p>
        </div>
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <div class="label">💧 Humedad</div>
          <div class="value">${current.humidity}%</div>
        </div>
        <div class="detail-item">
          <div class="label">💨 Viento</div>
          <div class="value">${current.windspeedKmph} km/h</div>
        </div>
        <div class="detail-item">
          <div class="label">🌡️ Presión</div>
          <div class="value">${current.pressure} mb</div>
        </div>
        <div class="detail-item">
          <div class="label">👁️ Visibilidad</div>
          <div class="value">${current.visibility} km</div>
        </div>
        <div class="detail-item">
          <div class="label">☁️ Nubosidad</div>
          <div class="value">${current.cloudcover}%</div>
        </div>
        <div class="detail-item">
          <div class="label"> Índice UV</div>
          <div class="value">${current.uvIndex}</div>
        </div>
      </div>
      
      <div class="request-info">
        <h4>📡 Información de la Petición HTTP</h4>
        <p><strong> Estado HTTP:</strong> ${status} ${desdeCache ? '(Caché)' : 'OK'}</p>
        <p><strong> Tiempo de respuesta:</strong> ${tiempo}ms</p>
        <p><strong> Método utilizado:</strong> ${desdeCache ? 'Caché Local' : 'GET'}</p>
        <p><strong> API:</strong> wttr.in (Gratuita, sin API Key)</p>
        <p><strong> CORS:</strong> ${desdeCache ? 'N/A (Caché)' : 'Habilitado (Access-Control-Allow-Origin: *)'}</p>
        <p><strong> Consultado:</strong> ${new Date().toLocaleString()}</p>
        <p><strong> Coordenadas:</strong> Lat ${location.latitude}, Lon ${location.longitude}</p>
      </div>
    </div>
  `;
}

function mostrarError(mensaje, tiempo) {
  resultado.innerHTML = `
    <div class="error-card">
      <h3> Error en la Petición</h3>
      <p>${mensaje}</p>
      <p style="margin-top: 10px; font-size: 0.9em;">
        <strong>⏱ Tiempo de respuesta:</strong> ${tiempo}ms
      </p>
      <p style="margin-top: 15px; color: #555;">
         <strong>Posibles soluciones:</strong><br>
        ${mensaje.includes('conexión') ? `
        • <strong>Verifica tu conexión a internet</strong><br>
        • Intenta abrir la página desde un servidor web (Live Server)<br>
        • Desactiva temporalmente tu antivirus/firewall<br>
        ` : `
        • Verifica que el nombre de la ciudad sea correcto<br>
        • Intenta con: Madrid, Tokyo, Paris, London, New York<br>
        • Usa nombres en inglés para mejor compatibilidad<br>
        `}
        • Revisa la consola (F12) para más detalles técnicos
      </p>
      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <strong>🔧 Para desarrolladores:</strong><br>
        <small style="color: #666;">
          ${mensaje.includes('conexión') ? 
          'Si estás abriendo el archivo directamente (file://), algunos navegadores bloquean peticiones CORS.' :
          'La API wttr.in es completamente gratuita y no requiere registro.'
          }<br>
          <strong>Solución:</strong> Usa un servidor local como Live Server (VSCode) o Python:<br>
          <code style="background: #333; color: #0f0; padding: 5px; border-radius: 3px; display: inline-block; margin-top: 5px;">
            python -m http.server 8000
          </code>
        </small>
      </div>
    </div>
  `;
}

function obtenerIconoClima(codigo) {
  // Códigos de clima de wttr.in
  const iconos = {
    '113': '☀️',  // Sunny
    '116': '⛅',  // Partly cloudy
    '119': '☁️',  // Cloudy
    '122': '☁️',  // Overcast
    '143': '🌫️',  // Mist
    '176': '🌦️',  // Patchy rain possible
    '179': '🌨️',  // Patchy snow possible
    '182': '🌧️',  // Patchy sleet possible
    '185': '🌧️',  // Patchy freezing drizzle
    '200': '⛈️',  // Thundery outbreaks possible
    '227': '🌨️',  // Blowing snow
    '230': '❄️',  // Blizzard
    '248': '🌫️',  // Fog
    '260': '🌫️',  // Freezing fog
    '263': '🌦️',  // Patchy light drizzle
    '266': '🌧️',  // Light drizzle
    '281': '🌧️',  // Freezing drizzle
    '284': '🌧️',  // Heavy freezing drizzle
    '293': '🌦️',  // Patchy light rain
    '296': '🌧️',  // Light rain
    '299': '🌧️',  // Moderate rain at times
    '302': '🌧️',  // Moderate rain
    '305': '🌧️',  // Heavy rain at times
    '308': '🌧️',  // Heavy rain
    '311': '🌧️',  // Light freezing rain
    '314': '🌧️',  // Moderate or heavy freezing rain
    '317': '🌨️',  // Light sleet
    '320': '🌨️',  // Moderate or heavy sleet
    '323': '🌨️',  // Patchy light snow
    '326': '❄️',  // Light snow
    '329': '🌨️',  // Patchy moderate snow
    '332': '❄️',  // Moderate snow
    '335': '🌨️',  // Patchy heavy snow
    '338': '❄️',  // Heavy snow
    '350': '🌧️',  // Ice pellets
    '353': '🌦️',  // Light rain shower
    '356': '🌧️',  // Moderate or heavy rain shower
    '359': '🌧️',  // Torrential rain shower
    '362': '🌨️',  // Light sleet showers
    '365': '🌨️',  // Moderate or heavy sleet showers
    '368': '🌨️',  // Light snow showers
    '371': '❄️',  // Moderate or heavy snow showers
    '374': '🌧️',  // Light showers of ice pellets
    '377': '🌧️',  // Moderate or heavy showers of ice pellets
    '386': '⛈️',  // Patchy light rain with thunder
    '389': '⛈️',  // Moderate or heavy rain with thunder
    '392': '⛈️',  // Patchy light snow with thunder
    '395': '⛈️'   // Moderate or heavy snow with thunder
  };
  return iconos[codigo] || '🌤️';
}

function validarCiudad(city) {
  if (!city || city.trim() === '') {
    alert('Por favor ingresa el nombre de una ciudad');
    return false;
  }
  
  if (city.length < 2) {
    alert('El nombre de la ciudad debe tener al menos 2 caracteres');
    return false;
  }
  
  if (city.length > 50) {
    alert('El nombre de la ciudad es demasiado largo');
    return false;
  }
  
  return true;
}

// ==================== FUNCIONES DE CACHÉ ====================

function actualizarEstadoCache() {
  const ciudadesEnCache = Array.from(cache.keys());
  
  if (ciudadesEnCache.length === 0) {
    cacheStatus.className = 'cache-status';
    cacheInfo.innerHTML = `❌ Sin datos guardados en caché<br>
      <small style="color: #666;">💡 Busca una ciudad para comenzar</small>`;
    btnClearCache.style.display = 'none';
  } else {
    cacheStatus.className = 'cache-status';
    const ciudadesHTML = ciudadesEnCache.map(city => `<strong>${city}</strong>`).join(', ');
    cacheInfo.innerHTML = `✅ <strong>${ciudadesEnCache.length}</strong> ciudad(es) en caché: ${ciudadesHTML}<br>
      <small style="color: #666;">⏱️ Válido por 10 minutos desde la consulta</small>`;
    btnClearCache.style.display = 'inline-block';
  }
}

function limpiarCache() {
  const cantidad = cache.size;
  cache.clear();
  console.log(`🗑️ Caché limpiado: ${cantidad} ciudad(es) eliminada(s)`);
  actualizarEstadoCache();
  
  // Mostrar notificación temporal
  cacheStatus.className = 'cache-status warning';
  cacheInfo.innerHTML = '🗑️ Caché limpiado correctamente';
  
  setTimeout(() => {
    actualizarEstadoCache();
  }, 2000);
}

// ==================== EVENT LISTENERS ====================

btnSearch.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (validarCiudad(city)) {
    obtenerClima(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    btnSearch.click();
  }
});

cityInput.addEventListener('focus', () => {
  cityInput.select();
});

btnMadrid.addEventListener('click', () => {
  cityInput.value = 'Madrid';
  obtenerClima('Madrid');
});

btnTokyo.addEventListener('click', () => {
  cityInput.value = 'Tokyo';
  obtenerClima('Tokyo');
});

btnNewYork.addEventListener('click', () => {
  cityInput.value = 'New York';
  obtenerClima('New York');
});

btnParis.addEventListener('click', () => {
  cityInput.value = 'Paris';
  obtenerClima('Paris');
});

btnClearCache.addEventListener('click', () => {
  if (confirm('¿Deseas limpiar el caché? Esto eliminará todos los datos guardados.')) {
    limpiarCache();
  }
});

// ==================== INICIALIZACIÓN ====================

function inicializar() {
  console.clear();
  console.log('%c🌤️ APLICACIÓN DEL CLIMA - PETICIONES HTTP', 
    'color: #667eea; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  console.log(' Proyecto educativo: Simulación de peticiones HTTP');
  console.log(' Objetivo: Analizar códigos de estado, tiempos y CORS');
  console.log(' Autores: Jose Riofrio - Ariana Sarango');
  console.log(' Fecha:', new Date().toLocaleDateString());
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  console.log('');
  console.log(' API UTILIZADA: wttr.in');
  console.log('   Completamente GRATUITA');
  console.log('   Sin necesidad de API Key');
  console.log('   Sin límites de peticiones');
  console.log('   Sin registro requerido');
  console.log('');
  console.log(' SISTEMA DE CACHÉ ACTIVADO:');
  console.log('  • Duración: 10 minutos');
  console.log('  • Delay entre peticiones: 2 segundos');
  console.log('  • Respuestas instantáneas desde caché');
  console.log('');
  console.log(' IMPORTANTE:');
  console.log('  Si ves errores de "Failed to fetch", asegúrate de:');
  console.log('  1. Tener conexión a internet activa');
  console.log('  2. Abrir la página desde un servidor (no file://)');
  console.log('  3. Usar Live Server en VSCode o python -m http.server 8000');
  console.log('');
  console.log(' INSTRUCCIONES:');
  console.log('  1. Haz clic en los botones para consultar el clima');
  console.log('  2. Observa esta consola para ver los detalles de cada petición');
  console.log('  3. Abre la pestaña Network para analizar headers y timing');
  console.log('  4. Experimenta con diferentes ciudades');
  console.log('  5. Limpia el caché con el botón 🗑️ si lo necesitas');
  console.log('');
  console.log(' INFORMACIÓN QUE SE REGISTRA:');
  console.log('  ✓ URL completa de la petición');
  console.log('  ✓ Método HTTP utilizado');
  console.log('  ✓ Tiempo de respuesta en milisegundos');
  console.log('  ✓ Código de estado HTTP');
  console.log('  ✓ Request y Response Headers');
  console.log('  ✓ Análisis detallado de CORS');
  console.log('  ✓ Datos JSON recibidos');
  console.log('  ✓ Estado del caché');
  console.log('');
  
  // Verificar si estamos en file:// protocol
  if (window.location.protocol === 'file:') {
    console.warn('%c ADVERTENCIA: Estás abriendo el archivo directamente (file://)', 'color: orange; font-size: 16px; font-weight: bold;');
    console.warn('Esto puede causar errores CORS. Considera usar un servidor local.');
    console.log('%cSolución rápida:', 'color: #4caf50; font-weight: bold;');
    console.log('  • VSCode: Instala "Live Server" y ábrelo con click derecho');
    console.log('  • Python: cd a la carpeta y ejecuta: python -m http.server 8000');
    console.log('');
  }
  
  // Actualizar estado del caché
  actualizarEstadoCache();
  
  // Mostrar mensaje de bienvenida
  resultado.innerHTML = `
    <div class="weather-card" style="text-align: center; padding: 40px;">
      <h2 style="color: #667eea; margin-bottom: 20px;">👋 ¡Bienvenido!</h2>
      <p style="font-size: 1.2em; color: #666; margin-bottom: 20px;">
        Haz clic en uno de los botones de ciudades o busca tu ciudad favorita
      </p>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-top: 20px; border: 2px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-bottom: 10px;">🆓 API Completamente Gratuita</h3>
        <ul style="text-align: left; color: #1b5e20; line-height: 1.8;">
          <li><strong>✅ Sin API Key</strong> - No necesitas registro</li>
          <li><strong>✅ Sin límites</strong> - Usa cuanto quieras</li>
          <li><strong>✅ Datos en tiempo real</strong> - Información actualizada</li>
          <li><strong> Caché de 10 minutos</strong> - Para optimizar rendimiento</li>
        </ul>
      </div>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 20px;">
        <h4 style="color: #1976d2; margin-bottom: 8px;">📡 Tecnología utilizada:</h4>
        <p style="color: #1565c0; font-size: 0.95em; line-height: 1.6;">
          <strong>wttr.in</strong> - Servicio gratuito de clima vía HTTP<br>
          <small>Perfecto para proyectos educativos y de aprendizaje</small>
        </p>
      </div>
    </div>
  `;
  
  console.log('✅ Aplicación lista. Haz clic en una ciudad para comenzar.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
