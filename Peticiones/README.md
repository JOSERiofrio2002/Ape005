# Aplicación del Clima - Simulación de Peticiones HTTP

## Descripción del Proyecto
Aplicación web que consulta el clima de diferentes ciudades utilizando la API de OpenWeatherMap. El proyecto demuestra el uso de peticiones HTTP con Fetch API, análisis de códigos de estado, tiempos de respuesta y políticas CORS.

## Características
- ✅ Consulta del clima en tiempo real
- ✅ Búsqueda por nombre de ciudad
- ✅ Botones rápidos para ciudades principales
- ✅ Registro detallado en consola (URL, método, tiempo, estado)
- ✅ Análisis de headers (request/response)
- ✅ Verificación de políticas CORS
- ✅ Medición de tiempos de respuesta
- ✅ Interfaz moderna y responsive

## API Utilizada
**OpenWeatherMap API**
- URL Base: `https://api.openweathermap.org/data/2.5/weather`
- Método: GET
- Formato: JSON
- Unidades: Métricas (Celsius)
- Idioma: Español

## Resultados de las Pruebas

### Tabla de Resultados

| Método | Ciudad | URL | Código de Estado | Tiempo Respuesta | Observaciones CORS |
|--------|--------|-----|------------------|------------------|-------------------|
| GET | Madrid | api.openweathermap.org/data/2.5/weather?q=Madrid | 200 OK | ~200-400ms | Access-Control-Allow-Origin: * |
| GET | Tokyo | api.openweathermap.org/data/2.5/weather?q=Tokyo | 200 OK | ~250-500ms | Access-Control-Allow-Origin: * |
| GET | New York | api.openweathermap.org/data/2.5/weather?q=New%20York | 200 OK | ~300-600ms | Access-Control-Allow-Origin: * |
| GET | Paris | api.openweathermap.org/data/2.5/weather?q=Paris | 200 OK | ~200-450ms | Access-Control-Allow-Origin: * |
| GET | CiudadInvalida | api.openweathermap.org/data/2.5/weather?q=xyz123 | 404 Not Found | ~150-300ms | Error manejado correctamente |

### Detalles de las Peticiones

#### Request Headers
```
Accept: application/json
Origin: file:// (o http://localhost según el servidor)
User-Agent: Mozilla/5.0...
```

#### Response Headers Importantes
```
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST
Server: openresty
```

#### Datos Recibidos (Ejemplo - Madrid)
```json
{
  "name": "Madrid",
  "sys": { "country": "ES" },
  "main": {
    "temp": 15.2,
    "feels_like": 14.8,
    "humidity": 72,
    "pressure": 1013
  },
  "weather": [{
    "main": "Clear",
    "description": "cielo claro"
  }],
  "wind": { "speed": 3.5 }
}
```

## Análisis CORS

La API de OpenWeatherMap implementa una política CORS permisiva:
- **Access-Control-Allow-Origin**: `*` (permite cualquier origen)
- **Access-Control-Allow-Methods**: GET, POST
- ✅ Permite peticiones desde navegadores sin restricciones
- ✅ Compatible con aplicaciones web frontend

## Tecnologías Utilizadas
- HTML5
- CSS3 (Grid, Flexbox, Gradients, Animations)
- JavaScript ES6+ (Async/Await, Fetch API)
- OpenWeatherMap API
- Console API para logging detallado

## Instrucciones de Uso

### 1. Abrir la Aplicación
```bash
# Opción 1: Doble clic en index.html

# Opción 2: Con Live Server (VSCode)
Click derecho en index.html → Open with Live Server

# Opción 3: Con Python
cd c:\Users\DANIEL\Desktop\Simulacion\Ape005\Peticiones
python -m http.server 8000
# Abrir: http://localhost:8000
```

### 2. Usar la Aplicación
1. **Búsqueda personalizada**: Escribe el nombre de una ciudad en el input
2. **Búsqueda rápida**: Click en los botones de ciudades predefinidas
3. **Ver detalles**: Presiona F12 para abrir Developer Tools
4. **Pestaña Console**: Ver logs detallados de cada petición
5. **Pestaña Network**: Analizar headers, timing, y response

## 📷 Evidencias en Developer Tools

### Console Tab muestra:
- ✅ URL completa de la API
- ✅ Método HTTP (GET)
- ✅ Tiempo de respuesta en milisegundos
- ✅ Código de estado HTTP
- ✅ Request headers
- ✅ Response headers
- ✅ Análisis CORS en formato tabla
- ✅ Datos JSON recibidos

### Network Tab muestra:
- Headers completos (General, Request, Response)
- Preview de la respuesta JSON
- Timing detallado de cada fase
- Tamaño de la transferencia

## Observaciones y Conclusiones

### Tiempos de Respuesta
- **Promedio**: 200-400ms
- **Factores**: Distancia geográfica, velocidad de internet, carga del servidor
- **Ciudades más rápidas**: Ciudades europeas (desde España)
- **Ciudades más lentas**: Ciudades asiáticas o americanas

### Códigos de Estado
- **200 OK**: Ciudad encontrada exitosamente
- **404 Not Found**: Ciudad no encontrada en la base de datos
- **401 Unauthorized**: API Key inválida (no aplica con la key pública)

### Manejo de Errores
- ✅ Validación de input vacío
- ✅ Manejo de ciudades no encontradas
- ✅ Mensajes de error descriptivos
- ✅ Tiempo de error registrado

### Políticas CORS
- ✅ API con CORS habilitado para todos los orígenes
- ✅ No requiere configuración adicional
- ✅ Compatible con desarrollo local

## Estructura del Proyecto
```
Peticiones/
├── index.html      # Interfaz principal
├── styles.css      # Estilos y diseño
├── script.js       # Lógica y peticiones HTTP
└── README.md       # Documentación
```

##  Autor
Jose Riofrio - Ariana Sarango
