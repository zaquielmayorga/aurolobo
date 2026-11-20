# Entrega local · Auro Lobo

**Estado: implementación guardada en local, con capturas DESPUÉS y revisión visual en navegador. Sin publicar: falta el OK de Zaquiel.**

## Dónde está el resultado

- Directorio: `/workspace/aurolobo-mejora`.
- Rama local: `mejora-fable`.
- Entrada: `index.html`, sin build, con `.nojekyll` y rutas relativas.
- El commit local se hace en `mejora-fable`. No se ha ejecutado `git push`, `gh`, publicación, despliegue ni cambio de remotes. El push URL de `origin` sigue siendo `DISABLED-NO-PUSH`.
- No se ha accedido a `/workspace/aurolobo-3d`. No se han activado créditos ni servicios de pago ni cambiado de modelo o plan.

## Mejoras aplicadas

- Nueva composición editorial en negro grafito, plata y oro: hero con vitrina propia, jerarquía tipográfica, cierre visual coherente y distribución específica para móvil.
- Dos huggies conceptuales con banda biselada, apertura real, pasador fino, separación de las mitades y remache de bisagra. La cámara encaja el conjunto según el ancho y alto de cada vitrina, con oscilación acotada. No se atribuyen medidas reales a la geometría.
- Colección con fotografías 4:3, marco común, foco/hover legibles y carrusel móvil. Se mantiene el aviso visible de muestras generadas con IA y se añade a los textos alternativos y detalles.
- Los seis precios ficticios se sustituyen por «Precio al lanzar», también en el diálogo. «Añadir» pasa a «Próximamente», con aviso de tienda en preparación. Sin compra, carrito, pagos ni recogida de datos.
- Retiradas medidas, tallas, grabado, promesas de alergias, REACH, envíos 24/48 h, devolución de 30 días y oferta de piezas limitadas no confirmados. Se explica qué queda por definir antes del lanzamiento.
- Manifiesto legible completo y retrato real del fundador. Lookbook con las cinco fotografías reales, controles y scroll nativo; no se fija el desplazamiento de la página.
- Anclas nativas con separación para la cabecera fija. Menú con fondo inerte, foco contenido, Escape, retorno de foco y adaptación al cambio de tamaño. Diálogo nativo accesible y aviso dentro de su propia capa modal.
- Eliminados loader, cursor artificial, giroscopio y carga de GSAP/ScrollTrigger/Lenis. Un renderer compartido, límite aproximado de 30 fps, DPR acotado y pausa fuera de pantalla. Movimiento reducido dinámico y fallback sin WebGL.
- Fuentes WOFF locales (~132 KiB entre las tres), con licencias; no hay peticiones a Google Fonts. Canonical, `og:url`, imagen social JPEG con URL absoluta de Pages, idioma y theme-color revisados.
- README actualizado y script de QA reproducible en `qa/verificar.py`.

## Capturas y comparación

Las diez capturas ANTES originales siguen intactas en `qa/before/`. Las DESPUÉS están en `qa/after/` (mismas cinco secciones en escritorio 1440×900 y móvil 390×844, más página completa y extras de menú, detalle y fallbacks).

Rutas clave:

- `qa/after/desktop-hero.png` y `qa/after/mobile-hero.png`
- `qa/after/desktop-coleccion.png` y `qa/after/mobile-coleccion.png`
- `qa/after/desktop-proximamente.png` y `qa/after/mobile-proximamente.png`
- `qa/after/desktop-full.png` y `qa/after/mobile-full.png`

Codex no pudo abrir el servidor ni Chrome (sandbox `workspace-write`). La revisión visual se completó después, fuera de ese sandbox, sirviendo en `http://127.0.0.1:8770/`. También se corrigieron dos detalles detectados en esa pasada: la cabecera era ligeramente transparente y se hacía ver el contenido al desplazarse; y un aviso de consola de Three.js (`sigmaRadians 0.045`) se evitó bajando el sigma del PMREM a 0.025. Tras esos cambios, la consola quedó limpia (sin errores ni warnings) y las capturas se regeneraron.

## Autorrevisión: hechos y límites

**Comprobaciones completadas:**

- `python3 qa/verificar.py --static`: **PASS**. 24 recursos locales presentes, sin IDs duplicados, anclas o referencias ARIA inexistentes; seis marcadores de precio; enlaces externos limitados a las dos cuentas facilitadas; sin formularios ni API de recogida de datos en el código propio. Informe: `qa/checks-static.json`.
- `node --input-type=module --check < js/main.js` y el mismo comando con `js/scene.js`: sintaxis válida.
- Comprobación puntual de la geometría con Three.js en Node: cinco mallas por huggie, 28.140 vértices finitos y límites coherentes. Datos: `qa/checks-geometry.json`. Esto no certifica su aspecto renderizado.
- `git diff --check`: sin errores de espacios.
- Se corrigió por revisión de código un fallo del contador del carrusel que habría impedido retroceder desde el extremo final cuando se ven varias fotografías a la vez.

**Revisión en navegador (completada después de Codex):**

- Escritorio y móvil: las cinco secciones cargan, el título no queda bajo la cabecera, no hay desbordamiento horizontal, los seis diálogos muestran «Precio al lanzar», el menú móvil (Escape, foco, fondo inerte) y los carruseles funcionan, hay fallback sin WebGL/JS y la subruta `/aurolobo/` resuelve CSS, módulos, imágenes y fuentes.
- Tras el ajuste del sigma PMREM, 0 errores y 0 warnings en consola; 0 recursos 404.

**Nota sobre el sandbox de Codex:** dentro de `workspace-write` no pudo abrir sockets. Al ejecutar desde la raíz `python3 -m http.server 8770` Codex obtuvo:

```text
PermissionError: [Errno 1] Operation not permitted
```

El entorno impide crear sockets. También se intentó arrancar Chrome mediante Playwright y tuberías, con recursos locales, sin abrir un puerto de servidor. Chrome se cierra antes de crear una página:

```text
TargetClosedError BrowserType.launch: Target page, context or browser has been closed
[ERROR:third_party/crashpad/crashpad/util/linux/socket.cc:45] setsockopt: Operation not permitted (1)
process did exit: exitCode=null, signal=SIGTRAP
```

El registro completo y literal del último intento está en `qa/browser-blocked.log`; `qa/checks-browser.json` informa `status: blocked`, **0 capturas y 0 comprobaciones de navegador**. Los flags para desactivar el reporte de fallos tampoco permitieron arrancar Chrome. No se han solicitado permisos ni eludido las restricciones del entorno.

Ese bloqueo ya no aplica fuera del sandbox de Codex: la revisión anterior se hizo con el servidor local y Chrome. Las URLs sociales no se han consultado por red; coinciden con las del brief.

El script de QA se puede repetir así:

```bash
cd /workspace/aurolobo-mejora
python3 -m http.server 8770
```

```bash
cd /workspace/aurolobo-mejora
python3 qa/verificar.py --base-url http://127.0.0.1:8770/
```

El script cubre 1440×900, 390×844, anchos adicionales, anclas, diálogo, menú, carruseles, consola/recursos, modo sin JS, sin WebGL, movimiento reducido y carga bajo `/aurolobo/`. Ese recorrido ya se ha ejecutado y las capturas se han revisado visualmente.

## Lo que falta de Zaquiel

- Fotografías reales de los productos que finalmente se seleccionen.
- Precios, materiales certificados, acabados, medidas, tallas y nombres definitivos.
- Fecha de lanzamiento, disponibilidad y condiciones reales de envío/devolución.
- Decisión posterior sobre tienda y textos legales cuando se prepare una venta real. Este encargo sigue siendo solo un escaparate.
- Aprobación de la propuesta (y, si hace falta, más matices de diseño) antes de publicar.

## Comandos de publicación futura — NO ejecutados

Solo después de completar la autorrevisión y recibir el OK de Zaquiel. Este bloque guarda los cambios, reactiva el push y sube la rama solicitada. Se seleccionan archivos explícitamente para no incluir los logs de ejecuciones previas que ya existían en `qa/`.

```bash
cd /workspace/aurolobo-mejora
git switch mejora-fable
git add index.html css/styles.css js/main.js js/scene.js README.md
git add assets/fonts assets/og-auro-lobo.jpg
git add qa/AUDITORIA.md qa/ENTREGA.md qa/verificar.py qa/after
git commit -m "Mejora editorial y transparencia del prototipo Auro Lobo"
git remote set-url --push origin https://github.com/zaquielmayorga/aurolobo.git
git push -u origin mejora-fable
```

**Subir `mejora-fable` no actualiza Pages si Pages publica desde `main`.** Para actualizar esa web después de aprobar la rama, el flujo concreto por Git es:

```bash
cd /workspace/aurolobo-mejora
git fetch origin
git switch main
git merge --ff-only origin/main
git merge --no-ff mejora-fable -m "Integra la mejora aprobada de Auro Lobo"
git push origin main
```

Si hay conflictos o divergencia, detener ese flujo y resolverlos antes de subir; no usar force push. La configuración prevista de Pages es rama `main`, carpeta `/ (root)`, en `https://zaquielmayorga.github.io/aurolobo/`. No se ha modificado ni consultado la configuración remota durante este trabajo.
