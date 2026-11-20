# Auditoría inicial · Auro Lobo

19 de noviembre de 2026. Revisión del HTML, CSS, interacción y escena Three.js, y de las diez capturas de `qa/before/` (cinco secciones en escritorio y móvil). Alcance: escaparate estático previo al lanzamiento, sin venta ni recogida de datos.

## Diseño y dirección de arte

La combinación negro/plata/oro y Cormorant Garamond tiene personalidad. Los retratos reales de Zaquiel son el activo más diferencial. Conviene conservarlos y darles más presencia editorial.

- El hero muestra aros cerrados hechos con toros y un disco de stud: no se aprecia una apertura ni un mecanismo de pendiente. La bisagra añadida usa casi el mismo material y radio, por lo que apenas se distingue.
- Las imágenes de colección mezclan pizarra, azul claro y gris. El recorte vertical sobre originales 4:3 elimina contexto. Un marco común y una proporción más próxima al original pueden unificarlas sin alterar las muestras.
- El hover difumina y oscurece el resto de la colección; dificulta comparar. El cursor sustituido y los botones magnéticos añaden complejidad sin facilitar la exploración.
- El lookbook fija el scroll de escritorio y amplía los retratos; puede cortar el peinado y hace menos predecible llegar a la sección siguiente.

## Móvil y accesibilidad

- En las capturas de manifiesto falta el comienzo del texto bajo la cabecera; colección también comienza demasiado arriba. El gestor Lenis navega con `offset: 0`, ignorando el espacio de la cabecera fija.
- En `mobile-proximamente.png`, el aro de plata queda cortado por arriba. La posición de cámara usa valores fijos sobre un canvas con altura diferente a la del hero.
- El hero concentra mucho aire y 3D antes del mensaje y las acciones; además ocupa 210 alturas de viewport porcentuales (`210svh`), prolongando la transición.
- Hay textos auxiliares de unos 10–11 px. Mejorar tamaño y contraste, conservar áreas táctiles de al menos 44 px.
- El menú actual no contiene el foco ni hace inerte el fondo. Debe cerrar con Escape, devolver el foco y responder al cambio de tamaño.
- Existen `lang="es"`, textos alternativos, diálogo nativo y algunas medidas para movimiento reducido. Mantenerlas y verificar teclado, lectura sin JS y fallback sin WebGL.

## Velocidad / rendimiento

- Buen punto de partida: imágenes WebP de 12–88 KB salvo el anillo (~112 KB), librerías locales y un único renderer compartido que se pausa fuera de pantalla.
- El loader oculta el contenido hasta que termina su secuencia; el primer mensaje no necesita esperar al 3D.
- Se cargan GSAP, ScrollTrigger y Lenis para efectos que pueden simplificarse con scroll nativo. Eliminar trabajo continuo ajeno a la escena.
- Fuentes externas de Google: añaden conexiones y pueden fallar sin red. En este entorno la resolución DNS no está disponible. Se usarán copias locales de las mismas familias disponibles en el sistema, con licencia.
- Mantener DPR acotado, ajustar geometría y pausar render cuando no sea visible; evitar sensores o permisos de orientación que no son necesarios.

## Conversión de pre-lanzamiento y veracidad

- Los seis precios (39, 45, 89, 129, 35 y 59 euros) y los botones «Añadir» simulan una compra inexistente. Sustituir por «Precio al lanzar» y una acción honesta con aviso.
- «Imágenes de muestra» resulta insuficiente: declarar explícitamente que son generadas con IA, tanto en colección como en detalle.
- Hay especificaciones sin confirmar (medidas, tallas, grabado), garantías de alergia, REACH, envíos 24/48 h y devoluciones de 30 días. Retirarlas o marcarlas pendientes; tampoco presentar «piezas limitadas» como oferta existente.
- Dirigir las acciones de lanzamiento a las dos cuentas facilitadas. No añadir checkout, formularios, almacenamiento de datos ni backend.

## SEO básico

Ya hay título, descripción, idioma, favicon y theme-color. Falta canonical y `og:url`; `og:image` es relativa y su alt atribuye joyas Auro Lobo al retrato sin evidencia. Corregir con URLs absolutas de GitHub Pages y texto descriptivo fiel. Ajustar metadatos al estado de prototipo, mantener un único h1 y títulos de sección visibles. No añadir datos estructurados de ofertas o valoraciones ficticias.

## Prioridad de intervención

1. Corregir contenido comercial y acceso a secciones.
2. Replantear encuadre 3D, hero móvil y presentación editorial de colección/lookbook.
3. Simplificar movimiento y carga, robustecer menú, diálogo y fallbacks.
4. Capturar a 1440×900 y 390×844; comprobar enlaces, consola, recursos, foco, desbordes y subruta `/aurolobo/`.
