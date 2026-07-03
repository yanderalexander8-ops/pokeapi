# PokeAPI Angular - Consumo de API REST con HttpClient y RxJS

Aplicación Angular 19 que consume la PokéAPI (`pokeapi.co/api/v2`) y muestra un listado
de Pokémon con su información de detalle, resolviendo el problema de "listado sin detalle"
mediante operadores RxJS encadenados (`switchMap` + `forkJoin` + `map` + `catchError`),
sin suscripciones anidadas ni `async/await`.

## Cómo ejecutar el proyecto

```bash
npm install
npm start
```

Luego abre `http://localhost:4200` en el navegador.

## Estructura del proyecto

```
src/app/
├── app.module.ts                       # Módulo raíz: registra HttpClientModule
├── app.component.ts / .html            # Componente raíz (shell)
├── models/
│   └── pokemon.model.ts                # Interfaces tipadas (sin "any")
├── services/
│   └── pokemon.service.ts              # Lógica RxJS: switchMap + forkJoin + map + catchError
└── components/pokemon-list/
    ├── pokemon-list.component.ts       # Suscripción en ngOnInit, paginación, búsqueda
    ├── pokemon-list.component.html     # Tarjetas *ngFor + estados de carga/error
    └── pokemon-list.component.css
```

## Cómo se resolvió el reto técnico central

El endpoint de listado (`GET /pokemon?limit=&offset=`) solo devuelve `name` y `url`
por cada Pokémon. Para obtener el detalle completo de cada uno, sin anidar
suscripciones, el pipe del servicio hace lo siguiente:

1. **`switchMap`**: toma la respuesta del listado y, en lugar de suscribirse dentro
   del `subscribe()` (lo cual estaría prohibido), retorna un **nuevo observable**.
   `switchMap` "aplana" ese observable interno en el flujo principal.
2. **`forkJoin`**: dentro del `switchMap`, se construye un arreglo de observables
   (uno por cada Pokémon, apuntando a su `url` de detalle) y `forkJoin` los ejecuta
   en paralelo, esperando a que **todos** terminen antes de emitir un único arreglo
   de resultados.
3. **`map`**: transforma el arreglo de respuestas "crudas" de la API
   (`PokemonDetailResponse[]`) al modelo `Pokemon[]` que usa la interfaz.
4. **`catchError`**: intercepta cualquier error de red o de la API y lo convierte
   en un `Observable` que emite un `Error` con un mensaje legible, para que el
   componente lo muestre en pantalla mediante la propiedad `error` de la suscripción.

Todo esto ocurre en **una sola cadena de pipe**, con **una sola suscripción** en el
componente (`ngOnInit`), cumpliendo el requisito de no anidar `subscribe()`.

## Funcionalidades opcionales incluidas

- **Paginación**: botones "Anterior" / "Siguiente" que modifican `offset` y vuelven
  a llamar `getPokemonList()`.
- **Búsqueda con debounce**: el campo de texto usa `debounceTime(400)` +
  `distinctUntilChanged()` sobre `searchControl.valueChanges` antes de disparar la
  consulta por nombre (`searchPokemonByName`).

## Pendiente para completar la entrega

- Subir a un repositorio de GitHub con commits descriptivos.
- Redactar las respuestas teóricas escritas que pida la guía (si aplica).
- Preparar la sustentación oral: se recomienda poder explicar, en tus propias
  palabras, por qué se usa `switchMap` (y no `mergeMap`) y por qué `forkJoin`
  espera a que todas las peticiones terminen antes de emitir.
