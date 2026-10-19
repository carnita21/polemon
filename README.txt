POKÉDEX A–Z — PWA

CONTENIDO
- index.html: estructura de la aplicación.
- styles.css: estilos responsivos.
- app.js: consumo de PokéAPI, búsqueda, filtro por letra y orden alfabético.
- manifest.json: configuración para instalar la PWA.
- service-worker.js: caché de los archivos principales.
- icons/pokeball.svg: icono de la aplicación.

CÓMO EJECUTAR EN WINDOWS
1. Descomprime pokedex_pwa.zip.
2. Abre la carpeta en Visual Studio Code.
3. Instala la extensión "Live Server" si aún no la tienes.
4. Haz clic derecho en index.html y selecciona "Open with Live Server".
5. Para probar la instalación, abre la aplicación desde localhost en Chrome o Edge y busca la opción de instalar.

IMPORTANTE
- Las PWA necesitan HTTPS o localhost para que funcione el Service Worker.
- La primera carga necesita internet porque los datos vienen de PokéAPI y las imágenes se sirven desde GitHub.
- El Service Worker guarda los archivos de la app; los datos e imágenes de Pokémon no se descargan todos para uso offline.
- Para publicar, puedes subir los archivos a GitHub Pages y activar Pages en la configuración del repositorio.
- La lista usa el endpoint https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0 y ordena los nombres A–Z en el navegador.
