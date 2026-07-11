---
name: Dulcería y Pastelería Velazco
description: Tienda en línea de pastelería artesanal iqueña
colors:
  primary: "#e57373"
  primary-hover: "#d46060"
  primary-deep: "#EF5350"
  ink: "#1a1a2e"
  ink-muted: "#555555"
  ink-subtle: "#888888"
  surface: "#ffffff"
  surface-warm: "#f9f6f0"
  success: "#27ae60"
  error: "#e74c3c"
  border: "#dddddd"
  border-light: "#f0f0f0"
  border-subtle: "#eeeeee"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "10px"
  full: "50%"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
    padding: "0.65rem 0.75rem"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  nav-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.8rem 1rem"
---

# Design System: Dulcería y Pastelería Velazco

## 1. Overview

**Creative North Star: "Dulce Tradición"**

Un sistema visual que huele a pan recién horneado. Cálido sin ser empalagoso, tradicional sin ser anticuado. La comida es la protagonista; el diseño se aparta para dejar brillar los colores salmón, las fotos de postres y los nombres familiares. Cada página acerca al cliente a los productos, no lo distrae con decoración vacía.

Este sistema rechaza explícitamente los templates de pastelería genérica con fondos blancos fríos y fotos de stock, el e-commerce sobrecargado de popups, y la tipografía decorativa ilegible. Prefiere silencio visual, contraste suficiente y un flujo de compra sin fricción.

**Key Characteristics:**
- Paleta bicolor: coral salmón sobre base crema y blanco
- Tipografía de dos caras: serif clásica para títulos, sans-serif limpia para cuerpo
- Curvas suaves en esquinas (8-12px), sombras con matiz salmón
- Botones sin contorno ni efecto glass: sólidos, directos, predecibles
- Transiciones rápidas (0.2s), nunca coreografiadas

## 2. Colors: La Paleta Dulce Tradición

Una paleta acogedora y directa. El coral salmón (#e57373) es el ancla emocional: aparece en botones, badges, acentos y bordes activos. Sobre fondo crema (#f9f6f0) y blanco (#ffffff), el contraste es suficiente sin llegar a frío. Los textos usan un azul marino profundo (#1a1a2e) que se lee como negro noble, no como gris corporativo.

### Primary
- **Salmón Dulce** (#e57373): Color principal. Botones primarios, badges del carrito, borde activo de inputs y toggles, número de paso, acento de sidebar. Su rareza relativa en la página (≤15% del área visible) es intencional.

### Neutral
- **Blanco Horno** (#ffffff): Fondos de tarjetas, sidebar, modales, inputs, search bar.
- **Crema de Leche** (#f9f6f0): Fondo de página principal, panel de ingredientes, address de referencia, confirmación de pago.
- **Marino Dulce** (#1a1a2e): Texto principal, headings, botones oscuros, totales. Apariencia de negro profundo con calidez.
- **Canela Suave** (#555555): Texto de cuerpo, descripciones, líneas de total, hints de contacto.
- **Canela Claro** (#888888): Texto secundario, subtotales, placeholders, etiquetas de info.
- **Borde Miel** (#dddddd): Bordes de inputs, search bar, toggles, tarjetas de radio, separadores de cart.

### Feedback
- **Menta Dulce** (#27ae60): Éxito, botón "Agregado", checkmark de confirmación.
- **Ají** (#e74c3c): Error, hover de botón remover, borde de input inválido.

### Named Rules
**La Regla del Salmón Raro.** El acento coral aparece en ≤15% del área visible de cualquier pantalla. Su rareza es el punto: cuando se usa, es una acción o un estado importante.

## 3. Typography

**Display Font:** Playfair Display (Georgia, serif)
**Body Font:** system-ui, -apple-system (sans-serif nativa)

**Carácter:** Una serif clásica con peso para los títulos (grandes, con carácter, tradicionales) y una sans-serif neutra y legible para el cuerpo. La combinación evita la rigidez de lo enteramente formal y lo frívolo de lo puramente decorativo.

### Hierarchy
- **Display** (700, clamp 2rem–3.5rem, 1.2): Títulos de página (Home hero, Tienda, Contacto, Testimonios). Text-wrap balance.
- **Headline** (600, clamp 1.3rem–2.2rem, 1.2): Subtítulos de sección, banners de productos.
- **Title** (600, 1.05rem–1.15rem, 1.3): Nombres de producto, títulos de sección en checkout.
- **Body** (400, 0.9rem, 1.5): Cuerpo general, descripciones de producto, inputs de formulario. Máximo 75 caracteres por línea.
- **Label** (600, 0.85rem, 1.4): Labels de formulario, botones, badges, enlaces de navegación.

### Named Rules
**La Regla de la Voz Única.** Solo dos familias tipográficas: Playfair Display para display/headline, system-ui para todo lo demás. Sin tercera familia decorativa.

## 4. Elevation

Profundidad suave y acogedora. Las sombras usan opacidades bajas (0.06–0.12) con un ligero matiz cálido. No hay elevaciones agresivas ni sombras duras. La profundidad evoca bandejas de postres apiladas: cada capa se distingue pero no se separa bruscamente.

### Vocabulary
- **Superficie** (sin sombra): Tarjetas de productos en reposo, inputs, formularios. El default es plano.
- **Levantado** (0 4px 12px rgba(0,0,0,0.08)): Tarjetas en reposo, columnas de checkout. Profundidad mínima.
- **Flotante** (0 8px 24px rgba(0,0,0,0.12)): Tarjetas en hover, modales, drawers. Elevación media.
- **Modal** (0 30px 60px rgba(0,0,0,0.2)): Overlays, ventanas modales. La elevación más alta.

### Named Rules
**La Regla Plana por Defecto.** Las superficies son planas en reposo. Las sombras aparecen solo como respuesta a estado (hover, foco) o contenedores elevados (modales, drawers).

## 5. Components

### Buttons
- **Shape:** Esquinas suaves (8px). Sin borde. Sólidos.
- **Primary (Salmón):** Fondo #e57373, texto blanco, peso 600, padding 0.6rem 1.25rem. Hover: #d46060. Active: scale(0.96). Transición 0.2s.
- **Primary (Added state):** Fondo #27ae60. Aparece brevemente con checkmark "✓ Agregado" antes de volver al estado default.
- **Dark:** Fondo #1a1a2e, texto blanco. Hover: #2a2a4e. Usado para acciones secundarias (aplicar descuento, checkout).
- **Outline:** Borde 1px #ddd, fondo blanco, texto #555. Hover: borde primary. Usado para toggles y botones secundarios.

### Inputs / Fields
- **Shape:** Esquinas 8px, borde 1px #ddd, fondo blanco, padding 0.65rem 0.75rem.
- **Focus:** Borde #e57373 + anillo 3px rgba(229,115,115,0.12). Sin glow interno ni animación.
- **Error:** Borde #e74c3c + anillo rojo. Texto de error debajo del campo.
- **Placeholder:** #bbb (suficiente contraste 4.5:1 sobre blanco).

### Cards / Containers
- **Shape:** Esquinas 12px, fondo blanco, sombra suave (0 4px 12px rgba(0,0,0,0.08)). Sin bordes.
- **Hover:** Elevación a flotante (0 8px 24px rgba(0,0,0,0.12)), translateY(-4px).
- **Padding interno:** 1rem.
- **Image area:** Aspect ratio 1:1, overflow hidden, object-fit cover. Hover zoom (scale 1.08) solo en Tienda.

### Navigation (Sidebar)
- **Style:** Fondo blanco fijo a la izquierda (260px). Enlaces con padding 0.8rem 1rem, border-radius 10px.
- **Default:** Texto #1a1a2e, icono outline SVG (stroke).
- **Hover:** Fondo rgba(229,115,115,0.1).
- **Active:** Fondo rgba(229,115,115,0.15) + barra izquierda 4px #e57373.
- **Mobile:** Colapsa a overlay con hamburger toggle en <768px.

## 6. Do's and Don'ts

### Do:
- **Do** usar el salmón (#e57373) en ≤15% del área: botones, badges, acentos activos.
- **Do** preferir fondo crema (#f9f6f0) para secciones completas y blanco (#fff) para tarjetas individuales.
- **Do** usar text-wrap balance en h1–h3.
- **Do** mantener 75 caracteres máximo por línea en cuerpo.
- **Do** usar transiciones de 0.2s (nunca 0.3s+) para feedback de hover/focus.
- **Do** usar sombras suaves (0.06–0.12 opacidad) con leve matiz cálido.

### Don't:
- **Don't** usar fondos blancos fríos o fotos de stock genéricas. La crema (#f9f6f0) es el fondo por defecto.
- **Don't** usar popups, banners ni notificaciones intrusivas. La experiencia debe ser amable y directa.
- **Don't** usar tipografía decorativa para cuerpo o labels. Playfair es solo para display/headline.
- **Don't** usar sombras duras ni opacidades >0.2 en sombras.
- **Don't** usar glassmorphism, gradientes en texto, ni efectos decorativos que compitan con la comida.
- **Don't** poner bordes laterales de color (stripe borders) en tarjetas. Preferir fondo tintado o nada.
- **Don't** saturar la página con secciones numeradas, eyebrows en mayúsculas ni el template hero-metric.
