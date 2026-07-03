# PokeAPI Angular

Taller de consumo de API REST con HttpClient y RxJS. La app consume la PokéAPI y muestra un listado de Pokémon con nombre, imagen y varias propiedades más.

## Cómo correrlo
npm install
npm start

Abrir en el navegador: http://localhost:4200

## Estructura

- `app.module.ts` -> módulo raíz, ahí se registra el HttpClientModule
- `models/pokemon.model.ts` -> interfaces de la respuesta de la API
- `services/pokemon.service.ts` -> el servicio que hace las peticiones y usa switchMap, forkJoin, map y catchError
- `components/pokemon-list/` -> componente que muestra las tarjetas de Pokémon

## Cómo funciona

El endpoint de listado solo devuelve el nombre y la url de cada Pokémon, no el detalle completo. Entonces en el servicio se hace lo siguiente:

1. Se pide el listado.
2. Con switchMap se toma ese listado y se dispara una petición nueva por cada Pokémon (usando su url).
3. forkJoin espera que todas esas peticiones terminen y las junta en un solo arreglo.
4. map convierte esos datos crudos al modelo que usa el componente.
5. catchError captura cualquier error y lo manda al componente para mostrarlo en pantalla.

Todo esto pasa dentro de un solo pipe, sin anidar subscribe.

## Extras que le agregué

- Paginación (botones anterior/siguiente)
- Buscador con debounce (espera a que el usuario deje de escribir antes de buscar)