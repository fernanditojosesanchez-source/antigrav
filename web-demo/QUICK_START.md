# 🚀 Guía Rápida: Aplicar Dark Mode Profesional

## ✅ Paso Único - Agregar 1 Línea

Abre `web-demo/index.html` y busca esta línea (aproximadamente línea 57):

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

**Justo después de esa línea**, agrega:

```html
<link rel="stylesheet" href="dark-mode-professional.css">
```

## 📍 Ejemplo Visual

**ANTES:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<style>
    * {
```

**DESPUÉS:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link rel="stylesheet" href="dark-mode-professional.css">

<style>
    * {
```

## 🎨 ¡Listo!

Guarda el archivo y recarga la página en tu navegador. Verás:
- ✅ Fondo azul oscuro profesional (PANTONE 281 C)
- ✅ Texto gris claro legible
- ✅ Todos los elementos con el nuevo tema oscuro

## 🔄 Para Desactivar

Si quieres volver al tema original, simplemente elimina o comenta la línea que agregaste:

```html
<!-- <link rel="stylesheet" href="dark-mode-professional.css"> -->
```

---

**Archivos Creados:**
- `dark-mode-professional.css` - El archivo CSS con todos los estilos
- `DARK_MODE_INSTRUCTIONS.md` - Instrucciones detalladas
- `QUICK_START.md` - Esta guía rápida
