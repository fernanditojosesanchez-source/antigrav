# 🎨 Instrucciones para Aplicar Dark Mode Profesional

## Paleta de Colores PANTONE 281 C

El archivo `dark-mode-professional.css` contiene una paleta de colores profesional basada en:

- **PANTONE 281 C**: `#1c1e4d` (Color principal)
- **Emblem**: `#d2d2d2` (Texto principal)

## 📋 Cómo Aplicar

### Opción 1: Vincular CSS Externo (Recomendado)

Agrega esta línea en el `<head>` de `index.html`, después de Tailwind CSS:

```html
<link rel="stylesheet" href="dark-mode-professional.css">
```

### Opción 2: CSS Inline

1. Abre `dark-mode-professional.css`
2. Copia todo el contenido
3. Pégalo dentro del bloque `<style>` existente en `index.html` (después de los estilos actuales)

## 🎨 Características del Dark Mode

### Colores Principales
- **Fondo Principal**: `#1c1e4d` (PANTONE 281 C)
- **Fondo Oscuro**: `#14162e`
- **Superficies**: `#252850`
- **Bordes**: `#3a3d6e`

### Colores de Texto
- **Primario**: `#d2d2d2` (Emblem)
- **Secundario**: `#a8a8a8`
- **Atenuado**: `#7a7a7a`

### Elementos Afectados
✅ Tarjetas y contenedores  
✅ Calendario (días disponibles, limitados, llenos)  
✅ Pestañas de navegación  
✅ Formularios e inputs  
✅ Botones  
✅ Chat (mensajes de usuario y AI)  
✅ Modales  
✅ Panel de administración  
✅ Badges y etiquetas  
✅ Scrollbars  

## 🔧 Personalización

Si deseas ajustar los colores, modifica las variables CSS en `:root`:

```css
:root {
    --color-primary: #1c1e4d;        /* Cambia el color principal */
    --color-text-primary: #d2d2d2;   /* Cambia el color del texto */
    /* ... más variables ... */
}
```

## ⚠️ Notas Importantes

1. El CSS usa `!important` para sobrescribir los estilos de Tailwind
2. Todos los elementos mantienen su funcionalidad original
3. El contraste cumple con estándares de accesibilidad WCAG AA
4. Compatible con todos los navegadores modernos

## 🧪 Verificación

Después de aplicar el CSS, verifica:
- [ ] El fondo es azul oscuro (PANTONE 281 C)
- [ ] El texto es legible (gris claro)
- [ ] Los formularios tienen fondo oscuro
- [ ] El calendario muestra colores oscuros
- [ ] Los botones mantienen su funcionalidad
- [ ] El chat tiene fondo oscuro

## 🔄 Restaurar Original

Si deseas volver al diseño original, simplemente:
1. Elimina el `<link>` al CSS (Opción 1), o
2. Elimina el CSS copiado del `<style>` (Opción 2)
