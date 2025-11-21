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

// Configuración de la API de OpenWeatherMap
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ==================== FUNCIONES PRINCIPALES ====================

async function obtenerClima(city) {
  const url = `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;
  
  console.group(` PETICIÓN HTTP - Consulta del Clima: ${city}`);
  console.log(' URL completa:', url);
  console.log(' Método HTTP:', 'GET');
  console.log(' API Key:', API_KEY);
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
    console.log(' Estado CORS:', corsStatus ? ' PERMITIDO' : ' BLOQUEADO');
    console.groupEnd();

    if (!response.ok) {
      const errorMessages = {
        404: 'Ciudad no encontrada en la base de datos',
        401: 'API Key inválida o expirada',
        429: 'Límite de peticiones excedido',
        500: 'Error en el servidor de la API',
        503: 'Servicio no disponible temporalmente'
      };
      
      const errorMsg = errorMessages[response.status] || `Error HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(' Datos JSON recibidos:', data);
    console.log(' Temperatura:', `${data.main.temp}°C`);
    console.log(' Coordenadas:', `Lat: ${data.coord.lat}, Lon: ${data.coord.lon}`);
    console.groupEnd();

    mostrarClima(data, tiempoRespuesta, response.status);

  } catch (error) {
    const endTime = performance.now();
    const tiempoRespuesta = (endTime - startTime).toFixed(2);
    
    console.error('❌ ERROR EN LA PETICIÓN');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('⏱️ Tiempo hasta el error:', `${tiempoRespuesta}ms`);
    
    // Detectar tipo de error
    let mensajeError = error.message;
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      mensajeError = 'Error de conexión: No se pudo conectar con la API';
      console.error('💡 Posibles causas:');
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

function mostrarClima(data, tiempo, status) {
  const weatherIcon = obtenerIconoClima(data.weather[0].main);
  
  resultado.innerHTML = `
    <div class="weather-card">
      <div class="weather-header">
        <h2>${data.name}</h2>
        <p class="country">${data.sys.country}</p>
      </div>
      
      <div class="weather-main">
        <div class="temperature">
          <div class="temp-value">${Math.round(data.main.temp)}°C</div>
        </div>
        
        <div class="weather-icon">${weatherIcon}</div>
        
        <div class="weather-description">
          <h3>${data.weather[0].description}</h3>
          <p class="feels-like">Sensación térmica: ${Math.round(data.main.feels_like)}°C</p>
        </div>
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <div class="label">💧 Humedad</div>
          <div class="value">${data.main.humidity}%</div>
        </div>
        <div class="detail-item">
          <div class="label">💨 Viento</div>
          <div class="value">${data.wind.speed} m/s</div>
        </div>
        <div class="detail-item">
          <div class="label">🌡️ Presión</div>
          <div class="value">${data.main.pressure} hPa</div>
        </div>
        <div class="detail-item">
          <div class="label">👁️ Visibilidad</div>
          <div class="value">${(data.visibility / 1000).toFixed(1)} km</div>
        </div>
      </div>
      
      <div class="request-info">
        <h4> Información de la Petición HTTP</h4>
        <p><strong> Estado HTTP:</strong> ${status} OK</p>
        <p><strong> Tiempo de respuesta:</strong> ${tiempo}ms</p>
        <p><strong> Método utilizado:</strong> GET</p>
        <p><strong> API:</strong> OpenWeatherMap v2.5</p>
        <p><strong> CORS:</strong> Habilitado (Access-Control-Allow-Origin: *)</p>
        <p><strong> Consultado:</strong> ${new Date().toLocaleString()}</p>
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
        <strong> Tiempo de respuesta:</strong> ${tiempo}ms
      </p>
      <p style="margin-top: 15px; color: #555;">
         <strong>Posibles soluciones:</strong><br>
        ${mensaje.includes('conexión') ? `
        • <strong>Verifica tu conexión a internet</strong><br>
        • Intenta abrir la página desde un servidor web (Live Server)<br>
        • Desactiva temporalmente tu antivirus/firewall<br>
        • Usa una VPN si la API está bloqueada en tu región<br>
        ` : `
        • Verifica que el nombre de la ciudad sea correcto<br>
        • Intenta con: Madrid, Tokyo, Paris, London, New York<br>
        `}
        • Revisa la consola (F12) para más detalles técnicos
      </p>
      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <strong>🔧 Para desarrolladores:</strong><br>
        <small style="color: #666;">
          Si estás abriendo el archivo directamente (file://), algunos navegadores bloquean peticiones CORS.<br>
          <strong>Solución:</strong> Usa un servidor local como Live Server (VSCode) o Python:<br>
          <code style="background: #333; color: #0f0; padding: 5px; border-radius: 3px; display: inline-block; margin-top: 5px;">
            python -m http.server 8000
          </code>
        </small>
      </div>
    </div>
  `;
}

function obtenerIconoClima(condicion) {
  const iconos = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Smoke': '💨',
    'Dust': '🌪️',
    'Sand': '🌪️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return iconos[condicion] || '🌤️';
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

// ==================== INICIALIZACIÓN ====================

function inicializar() {
  console.clear();
  console.log('%c🌤️ APLICACIÓN DEL CLIMA - PETICIONES HTTP', 
    'color: #667eea; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  console.log('Proyecto educativo: Simulación de peticiones HTTP');
  console.log(' Objetivo: Analizar códigos de estado, tiempos y CORS');
  console.log(' Autores: Jose Riofrio - Ariana Sarango');
  console.log(' Fecha:', new Date().toLocaleDateString());
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
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
  console.log('');
  console.log(' INFORMACIÓN QUE SE REGISTRA:');
  console.log('   URL completa de la petición');
  console.log('   Método HTTP utilizado');
  console.log('   Tiempo de respuesta en milisegundos');
  console.log('   Código de estado HTTP');
  console.log('   Request y Response Headers');
  console.log('   Análisis detallado de CORS');
  console.log('   Datos JSON recibidos');
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
  
  obtenerClima('Madrid');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
