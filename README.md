# Auro Lobo · prototipo web 3D

Escaparate estático de **Auro Lobo**, marca de pendientes y accesorios masculinos en plata 925, acero 316L y vermeil 18k, creada por Zaquiel ([@ZaquielOfficial](https://www.youtube.com/@ZaquielOfficial)).

Es un **prototipo**: no hay tienda, ni pagos, ni formularios. Los botones «Añadir» solo muestran el aviso «Tienda en preparación · lanzamiento próximamente», y las llamadas a la acción llevan a Instagram y YouTube.

## Qué incluye

- **Hero 3D en tiempo real** (Three.js r170): aro huggie de plata, aro de vermeil y stud, con materiales PBR (`MeshPhysicalMaterial` + `RoomEnvironment`/`PMREMGenerator`), luz cálida de acento y polvo dorado. Reacciona al ratón, al giroscopio y al tacto en móvil. Con el scroll, la cámara se acerca y la joya gira (GSAP ScrollTrigger).
- El mismo canvas reaparece en la sección **Próximamente**. Solo hay un contexto WebGL y deja de renderizar cuando no está a la vista o la pestaña está oculta.
- **Vitrina de colección**: en escritorio, tilt 3D con brillo especular y foco en la pieza señalada (el resto se atenúa). En móvil, carrusel con snap, contador `01 / 06` y flechas. Al tocar una pieza se abre un panel de detalle (`<dialog>`, se cierra con Esc) con un cambio de acabado Plata / Oro que es solo visual.
- **Manifiesto** que se revela palabra a palabra al hacer scroll.
- **Lookbook** horizontal fijado (pinned) en escritorio, con parallax en los retratos; en móvil, scroll horizontal nativo con snap.
- Bloque de garantías, CTA final, footer, cursor personalizado, botones magnéticos, Lenis (smooth scroll) y grano sutil.
- **Accesibilidad y rendimiento**: `lang="es"`, textos alternativos, foco visible y `aria-*`. Respeta `prefers-reduced-motion` (escena estática, sin animaciones de scroll). Si no hay WebGL, muestra una imagen de respaldo. El devicePixelRatio está limitado (1,25 en móvil y 1,75 en escritorio).

## Estructura

```
index.html
favicon.svg
.nojekyll
css/styles.css
js/main.js          # interacción, scroll, vitrina, modal, lookbook
js/scene.js         # escena Three.js
js/vendor/          # three 0.170.0, RoomEnvironment, gsap 3.12.5, ScrollTrigger, lenis 1.1.13
assets/productos/   # fotos de producto (muestra)
assets/lookbook/    # retratos de Zaquiel
```

Las librerías están **vendorizadas** en `js/vendor/`: no hay paso de build ni dependencia de CDN. Solo las fuentes (Cormorant Garamond + Manrope) se cargan desde Google Fonts.

## Verla en local

Los módulos ES requieren servidor HTTP (abrir el archivo con doble clic no funciona):

```bash
cd site
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages

1. Crea un repositorio y sube el **contenido** de esta carpeta (que `index.html` quede en la raíz).
2. En *Settings → Pages*, elige *Deploy from a branch*, la rama `main` y la carpeta `/ (root)`.
3. Se publicará en `https://<usuario>.github.io/<repo>/`. Todas las rutas son relativas, así que funciona en esa subruta sin cambiar nada. El archivo `.nojekyll` evita el procesado de Jekyll.

Cuando se compre el dominio, basta con configurarlo en *Settings → Pages → Custom domain*.

## Aviso sobre las imágenes

- Las **fotos de producto** (`assets/productos/`) son **imágenes de muestra generadas con IA**. No representan el producto final.
- Los **retratos del lookbook** (`assets/lookbook/`) son fotografías reales de **Zaquiel**, fundador de la marca.

© 2026 Auro Lobo · Prototipo · tienda en preparación.
