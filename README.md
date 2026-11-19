# Auro Lobo · escaparate previo al lanzamiento

Web estática de pendientes y accesorios masculinos de Zaquiel Mayorga, preparada para GitHub Pages en `/aurolobo/`. `index.html` en la raíz, rutas relativas y `.nojekyll`. Sin build, checkout, pagos, formularios, analítica ni recogida de datos.

**Estado:** mejoras implementadas en la copia local, rama `mejora-fable`. La revisión visual en navegador está pendiente: el entorno de ejecución bloquea tanto el servidor HTTP como el arranque de Chrome. Detalles y errores en [qa/ENTREGA.md](qa/ENTREGA.md). No se ha publicado nada.

## Contenido y comportamiento

- Hero editorial y dos huggies conceptuales en Three.js: banda biselada, apertura, pasador y bisagra visibles en la geometría. Oscilación acotada, DPR limitado, render limitado a unos 30 fps y pausado fuera de pantalla o con la pestaña oculta.
- Un solo renderer se mueve entre hero y cierre. Las cajas de las escenas reservan espacio para los rótulos. Imagen de respaldo sin WebGL y contenido legible antes de cargar la escena.
- Seis tarjetas de colección, carrusel móvil y diálogo con detalles conceptuales. Todos los precios muestran **«Precio al lanzar»**. «Próximamente» muestra un aviso, sin carrito ni pedido.
- Manifiesto con retrato real y el lema de Zaquiel. Lookbook con cinco fotos reales, desplazamiento nativo, controles y teclado.
- Menú móvil con fondo inerte, foco contenido y cierre con Escape. Anclas con espacio para la cabecera fija. Respeta `prefers-reduced-motion`, también si cambia durante la sesión.
- CTA únicamente a [Instagram](https://www.instagram.com/zaquielofficial/) y [YouTube](https://www.youtube.com/@ZaquielOfficial).
- Canonical y Open Graph absolutos de Pages. La imagen social es una copia JPEG del retrato original, sin alterar su composición.

## Verla en local

Desde este directorio:

```bash
cd /workspace/aurolobo-mejora
python3 -m http.server 8770
```

Abrir `http://localhost:8770/`. Los módulos ES necesitan HTTP; abrir el HTML mediante `file://` no inicializa correctamente la escena.

## Verificación

No se necesita instalar nada global. El chequeo estático usa Python y Node; el de navegador utiliza el Playwright de Python ya disponible y `/usr/bin/google-chrome`.

```bash
python3 qa/verificar.py --static
# Con el servidor anterior activo, en otra terminal:
python3 qa/verificar.py --base-url http://127.0.0.1:8770/
```

El segundo comando genera las capturas de escritorio 1440×900 y móvil 390×844 en `qa/after/`, además de revisar menú, diálogos, carruseles, consola, recursos, desbordes, movimiento reducido, ausencia de WebGL/JS y subruta `/aurolobo/`. Un bloqueo o fallo devuelve un código distinto de cero y queda en `qa/checks-browser.json`. Las capturas resultantes están en `qa/after/` (también hay página completa de escritorio y móvil).

## Archivos

- `index.html`, `css/styles.css`: estructura, contenido y diseño responsive.
- `js/main.js`: navegación, menú, carruseles, detalles y avisos.
- `js/scene.js`: geometría y renderer 3D compartido.
- `js/vendor/`: Three.js y RoomEnvironment locales. Las antiguas librerías GSAP/ScrollTrigger/Lenis siguen vendorizadas, pero ya no se cargan.
- `assets/fonts/`: Cormorant Garamond y Manrope locales, en WOFF, con caracteres latinos y licencia OFL. No hay peticiones a Google Fonts.
- `qa/AUDITORIA.md`, `qa/ENTREGA.md`: diagnóstico y entrega; `qa/before/` conserva las diez referencias originales.

## Aviso sobre productos e imágenes

Las imágenes de `assets/productos/` son **muestras generadas con IA**, no el producto final. Los retratos `assets/lookbook/zaquiel-*.webp` son **fotografías reales de Zaquiel**. La escena 3D representa conceptos, no especificaciones de una pieza a la venta.

Los nombres y materiales de las tarjetas son referencias del concepto de colección. Faltan fotos reales de producto, materiales definitivos, medidas, acabados, precios, condiciones comerciales y fecha de lanzamiento. Se han retirado las antiguas promesas de alergias, envío y devolución no confirmadas.

## Publicación

El push de `origin` continúa desactivado. Los comandos propuestos para cuando Zaquiel apruebe la revisión están en `qa/ENTREGA.md`; **no se han ejecutado**. Subir la rama de propuesta no modifica una web de Pages configurada para `main`: requiere integrar allí la propuesta aprobada.
