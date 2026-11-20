#!/usr/bin/env python3
"""QA local. Sin instalar nada, publicar ni llamar a servicios externos.

python3 qa/verificar.py --static
python3 -m http.server 8770          # desde la raíz, en otra terminal
python3 qa/verificar.py --base-url http://127.0.0.1:8770/
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
from html.parser import HTMLParser
import argparse
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / 'qa'
AFTER = QA / 'after'

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.elements = []; self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

def static_checks():
    html = (ROOT / 'index.html').read_text()
    doc = Document(html)
    errors = []
    resources = set()
    ids = [a['id'] for _, a in doc.elements if 'id' in a]
    if len(ids) != len(set(ids)): errors.append('IDs duplicados')
    if sum(t == 'h1' for t, _ in doc.elements) != 1: errors.append('Debe haber un h1')
    if ('html', {'lang': 'es', 'class': 'no-js'}) not in doc.elements: errors.append('Idioma o fallback HTML incorrecto')
    allowed = {'https://www.instagram.com/zaquielofficial/', 'https://www.youtube.com/@ZaquielOfficial'}
    for tag, attrs in doc.elements:
        for attr in ['aria-labelledby', 'aria-describedby', 'aria-controls']:
            for ref in attrs.get(attr, '').split():
                if ref not in ids: errors.append('Referencia ARIA inexistente: ' + ref)
        if tag == 'img' and 'alt' not in attrs: errors.append('Imagen sin alt')
        if tag == 'button' and attrs.get('type') != 'button': errors.append('Botón sin type')
        if tag in ['form', 'input', 'textarea']: errors.append('Control de recogida de datos: ' + tag)
        if tag == 'a':
            href = attrs.get('href', '')
            if href.startswith('#') and href[1:] not in ids: errors.append('Ancla inexistente: '+href)
            if href.startswith('http') and href not in allowed: errors.append('Destino externo no previsto: '+href)
            if attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''): errors.append('Enlace sin noopener')
        for attr in ['src', 'href']:
            value = attrs.get(attr, '')
            if not value or value.startswith(('#', 'http', 'data:')): continue
            if value.startswith('/'): errors.append('Ruta absoluta incompatible con subruta: '+value)
            resources.add(value)
    css = (ROOT/'css/styles.css').read_text()
    for src in re.findall(r'url\([\'"]?([^\)\'\"]+)',css):
        if not src.startswith('data:'): resources.add(str(Path('css')/src))
    resources.update(['js/scene.js','js/vendor/three.module.min.js','js/vendor/addons/RoomEnvironment.js','.nojekyll','assets/og-auro-lobo.jpg'])
    for ref in resources:
        if not (ROOT/ref).is_file(): errors.append('Recurso local inexistente: '+ref)
    for file in ['js/main.js','js/scene.js']:
        result = subprocess.run(['node','--input-type=module','--check'],input=(ROOT/file).read_text(),text=True,capture_output=True)
        if result.returncode: errors.append(file+': '+result.stderr)
    scripts = (ROOT/'js/main.js').read_text()+(ROOT/'js/scene.js').read_text()
    if re.search(r'\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\b',scripts): errors.append('Revisar API de red/almacenamiento')
    if re.search(r'\d+\s*€|Añadir|hipoalergén|REACH|24/48|30 días|piezas limitadas',html+scripts): errors.append('Contenido comercial sin confirmar')
    if html.count('class="piece__price">Precio al lanzar') != 6: errors.append('Faltan marcadores de precio')
    metas = {a.get('property',a.get('name')):a.get('content') for t,a in doc.elements if t=='meta'}
    if not metas.get('og:image','').startswith('https://zaquielmayorga.github.io/aurolobo/'): errors.append('Open Graph no absoluto')
    if not any(t=='link' and a.get('rel')=='canonical' and a.get('href')=='https://zaquielmayorga.github.io/aurolobo/' for t,a in doc.elements): errors.append('Canonical incorrecto')
    report = {'status':'passed' if not errors else 'failed','resources_checked':len(resources),'duplicate_ids':len(ids)-len(set(ids)),'product_price_placeholders':6,'errors':errors,'limits':'Análisis estático: no certifica respuestas HTTP, consola, encuadre ni layout.'}
    (QA/'checks-static.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return not errors


def browser_checks(base_url):
    from playwright.sync_api import sync_playwright
    report = {'status':'running','base_url':base_url,'console':[],'page_errors':[],'failed_requests':[],'http_errors':[],'captures':[],'checks':[]}
    AFTER.mkdir(exist_ok=True)
    def record(name): report['checks'].append(name)
    def observe(page):
        page.on('console',lambda m: report['console'].append({'type':m.type,'text':m.text}) if m.type in ('error','warning') else None)
        page.on('pageerror',lambda e: report['page_errors'].append(str(e)))
        page.on('requestfailed',lambda r: report['failed_requests'].append({'url':r.url,'failure':r.failure}))
        page.on('response',lambda r: report['http_errors'].append({'status':r.status,'url':r.url}) if r.status>=400 else None)
    def no_overflow(page):
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'Desbordamiento horizontal de página'
    def snap(page,name):
        page.screenshot(path=str(AFTER/(name+'.png')))
        report['captures'].append('qa/after/'+name+'.png')
    browser_launched = False
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage'])
            browser_launched = True
            for label,w,h in [('desktop',1440,900),('mobile',390,844)]:
                context=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=label=='mobile',is_mobile=label=='mobile')
                page=context.new_page();observe(page)
                page.goto(base_url,wait_until='networkidle');page.evaluate('document.fonts.ready');page.wait_for_timeout(1200)
                assert page.locator('html').evaluate("e=>e.classList.contains('webgl-ready')"),'WebGL no inicializado con SwiftShader'
                no_overflow(page);snap(page,label+'-hero')
                for name in ['coleccion','manifiesto','lookbook','proximamente']:
                    if label=='mobile':
                        page.locator('#menu-btn').click();assert page.locator('main').evaluate('e=>e.inert')
                        page.locator(f'#menu a[href="#{name}"]').click()
                    else: page.locator(f'.nav a[href="#{name}"]').click()
                    page.wait_for_timeout(1200)
                    title=page.locator(f'#{name} h2').bounding_box();header=page.locator('#header').bounding_box()
                    assert title['y']>=header['height'],f'Cabecera tapa {name}'
                    assert not page.locator('main').evaluate('e=>e.inert')
                    no_overflow(page);snap(page,label+'-'+name)
                record(label+': cinco secciones, anclas y ancho de página')
                # Los seis detalles deben seguir siendo prototipos y cerrar con Escape.
                for index in range(6):
                    media=page.locator('.piece__media').nth(index)
                    media.click();assert page.locator('#detail').evaluate('e=>e.open')
                    assert page.locator('#detail-price').inner_text()=='Precio al lanzar'
                    assert page.locator('#detail-size').inner_text()=='Por confirmar'
                    page.locator('#detail [data-soon]').click()
                    assert 'Tienda en preparación' in page.locator('.detail__status').inner_text()
                    if index==0: snap(page,label+'-detalle')
                    page.keyboard.press('Escape')
                    assert not page.locator('#detail').evaluate('e=>e.open')
                    assert media.evaluate('e=>e===document.activeElement')
                record(label+': seis diálogos, aviso honesto y retorno de foco')
                # Flechas en ambos sentidos, incluido el extremo final con varias tarjetas visibles.
                for track,prev,nxt in [('#lb-track','#look-prev','#look-next')]+([('#rail','#rail-prev','#rail-next')] if label=='mobile' else []):
                    page.locator(track).evaluate("e=>e.scrollTo({left:0,behavior:'instant'})");page.wait_for_timeout(100)
                    for _ in range(6):
                        if page.locator(nxt).is_disabled():break
                        page.locator(nxt).click();page.wait_for_timeout(500)
                    old=page.locator(track).evaluate('e=>e.scrollLeft')
                    assert old>0
                    page.locator(prev).click();page.wait_for_timeout(600)
                    assert page.locator(track).evaluate('e=>e.scrollLeft')<old,'Carrusel no retrocede al llegar al final'
                if label=='mobile':
                    page.locator('#menu-btn').click();snap(page,'mobile-menu')
                    page.keyboard.press('Escape');assert page.locator('#menu-btn').evaluate('e=>e===document.activeElement')
                    page.locator('#menu-btn').click()
                    for _ in range(10):
                        page.keyboard.press('Tab')
                        assert page.evaluate("document.activeElement===document.querySelector('#menu-btn') || !!document.activeElement.closest('#menu')")
                    page.keyboard.press('Escape');record('Menú: Escape, fondo inerte, foco contenido y retorno')
                record(label+': carruseles adelante/atrás')
                context.close()
            # Sin WebGL: el fallback real se mantiene visible.
            context=browser.new_context(viewport={'width':390,'height':844})
            context.add_init_script("const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args)}")
            page=context.new_page();observe(page);page.goto(base_url,wait_until='networkidle')
            assert page.locator('html').evaluate("e=>e.classList.contains('no-webgl')")
            assert page.locator('.hero__visual .jewel-fallback').evaluate("e=>getComputedStyle(e).opacity==='1'")
            snap(page,'mobile-sin-webgl');context.close();record('Fallback sin WebGL')
            context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
            page=context.new_page();observe(page);page.goto(base_url,wait_until='networkidle')
            page.wait_for_selector('#hero-canvas canvas')
            first=page.locator('#hero-canvas').screenshot();page.wait_for_timeout(250);second=page.locator('#hero-canvas').screenshot()
            assert first==second,'Escena sigue animándose con movimiento reducido'
            snap(page,'mobile-movimiento-reducido');context.close();record('Movimiento reducido: render estático')
            context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
            page=context.new_page();observe(page);page.goto(base_url,wait_until='networkidle')
            no_overflow(page);assert page.locator('.nav').is_visible();assert page.locator('h1').is_visible()
            snap(page,'mobile-sin-js');context.close();record('Sin JS: contenido, navegación y fallback')
            for width in [320,768,1024]:
                page=browser.new_page(viewport={'width':width,'height':900});observe(page)
                page.goto(base_url,wait_until='networkidle');no_overflow(page);page.close()
            record('Anchos adicionales 320, 768 y 1024')
            # Misma web bajo una subruta: responder solo con los archivos de esta copia.
            context=browser.new_context();page=context.new_page();observe(page)
            def subroute(route):
                import mimetypes
                part=unquote(urlparse(route.request.url).path).removeprefix('/aurolobo/')
                file=(ROOT/(part or 'index.html')).resolve()
                if not file.is_relative_to(ROOT) or not file.is_file():route.fulfill(status=404,body='Not found');return
                route.fulfill(status=200,body=file.read_bytes(),content_type=mimetypes.guess_type(file)[0] or 'application/octet-stream')
            page.route('http://subruta.test/aurolobo/**',subroute)
            page.goto('http://subruta.test/aurolobo/',wait_until='networkidle')
            assert page.locator('html').evaluate("e=>e.classList.contains('webgl-ready')")
            assert page.locator('img').first.evaluate('e=>e.complete && e.naturalWidth>0')
            record('Subruta /aurolobo/: módulos, CSS, imágenes y fuentes');context.close()
            assert not any(report[k] for k in ['console','page_errors','failed_requests','http_errors']),'Revisar errores/warnings de navegador'
            browser.close();report['status']='passed'
    except Exception as exc:
        report['status']='failed' if browser_launched else 'blocked'
        report['error']=str(exc)
        (QA/'browser-blocked.log').write_text(str(exc)+'\n')
    finally:
        (QA/'checks-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('Browser:',report['status'],';',len(report['captures']),'capturas;',len(report['checks']),'comprobaciones')
    return report['status']=='passed'

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--static',action='store_true');parser.add_argument('--base-url',default='http://127.0.0.1:8770/')
    args=parser.parse_args()
    ok=static_checks()
    if ok and not args.static:ok=browser_checks(args.base_url)
    sys.exit(0 if ok else 1)
