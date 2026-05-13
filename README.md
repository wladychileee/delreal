# 🚛 Flota de Vehículos y Maquinarias

Página web profesional para mostrar y gestionar el inventario de vehículos y maquinarias para arriendo y venta.

## 📋 Características

- **Catálogo completo**: Muestra todos los equipos del archivo `activos.xlsx`
- **Búsqueda avanzada**: Filtra por tipo, marca, modelo, año y patente
- **Filtros múltiples**: Combinación de filtros para búsquedas precisas
- **Vista detallada**: Información completa de cada equipo al hacer clic
- **Diseño responsivo**: Funciona en desktop, tablet y móvil
- **Interfaz moderna**: Colores armoniosos y diseño profesional
- **Estadísticas en tiempo real**: Conteo de equipos y tipos

## 🚀 Cómo usar

### Opción 1: Servidor local (para pruebas)

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (si tienes http-server instalado)
   npx http-server
   ```
3. Abre tu navegador en `http://localhost:8000`

### Opción 2: GitHub Pages (recomendado para producción)

#### Paso 1: Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. Nómbralo como desees (ej: `flota-web`)
3. No inicialices con README (ya tenemos uno)

#### Paso 2: Subir archivos a GitHub

```bash
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Inicializar proyecto de flota web"

# Agregar repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/flota-web.git

# Subir archivos
git branch -M main
git push -u origin main
```

#### Paso 3: Activar GitHub Pages

1. Ve a la página de tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Pages**
4. En **Source**, selecciona **Deploy from a branch**
5. En **Branch**, selecciona `main` y la carpeta `/ (root)`
6. Haz clic en **Save**

#### Paso 4: Acceder a tu sitio

Después de unos minutos, tu sitio estará disponible en:
`https://TU_USUARIO.github.io/flota-web/`

## 📁 Estructura del proyecto

```
.
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
├── datos.json          # Datos convertidos del Excel
├── activos.xlsx        # Archivo original (opcional)
└── README.md           # Este archivo
```

## 🔄 Actualizar datos

Cuando necesites actualizar los datos del inventario:

1. Actualiza el archivo `activos.xlsx`
2. Convierte el Excel a JSON:
   ```bash
   python -c "import pandas as pd; df = pd.read_excel('activos.xlsx'); df.to_json('datos.json', orient='records', force_ascii=False)"
   ```
3. Sube los cambios a GitHub:
   ```bash
   git add datos.json
   git commit -m "Actualizar datos del inventario"
   git push
   ```

## 🎨 Personalización

### Cambiar colores

Edita `styles.css` y modifica las variables CSS en `:root`:

```css
:root {
    --primary-color: #2563eb;      /* Color principal */
    --secondary-color: #1e40af;    /* Color secundario */
    --accent-color: #3b82f6;       /* Color de acento */
    /* ... otras variables ... */
}
```

### Cambiar título

Edita `index.html` y modifica:
```html
<title>Tu Título Personalizado</title>
```

## 📱 Tecnologías utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Grid y Flexbox
- **JavaScript (ES6+)**: Lógica de la aplicación
- **GitHub Pages**: Hosting gratuito

## 🛠️ Requisitos previos

Para actualizar los datos necesitas:
- Python 3.x
- Pandas: `pip install pandas openpyxl`

## 📞 Soporte

Si tienes problemas o preguntas, revisa la sección de actualización de datos o verifica que todos los archivos estén correctamente subidos a GitHub.

## 📄 Licencia

Este proyecto es para uso personal/comercial según tus necesidades.
