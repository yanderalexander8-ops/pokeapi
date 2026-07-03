import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Pokemon,
  PokemonDetailResponse,
  PokemonListResponse
} from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemonList(limit: number, offset: number): Observable<Pokemon[]> {
    const url = `${this.baseUrl}?limit=${limit}&offset=${offset}`;

    return this.http.get<PokemonListResponse>(url).pipe(
      switchMap((listResponse: PokemonListResponse) => {
        if (listResponse.results.length === 0) {
          return of([] as PokemonDetailResponse[]);
        }

        const detailRequests: Observable<PokemonDetailResponse>[] =
          listResponse.results.map((item) =>
            this.http.get<PokemonDetailResponse>(item.url)
          );

        return forkJoin(detailRequests);
      }),
      map((details: PokemonDetailResponse[]) =>
        details.map((detail) => this.toPokemon(detail))
      ),
      catchError((error) => {
        console.error('Error al obtener el listado de Pokémon:', error);
        return throwError(
          () => new Error('No se pudo cargar el listado de Pokémon. Intenta de nuevo.')
        );
      })
    );
  }

  searchPokemonByName(name: string): Observable<Pokemon[]> {
    const normalized = name.trim().toLowerCase();

    if (!normalized) {
      return of([]);
    }

    return this.http.get<PokemonDetailResponse>(`${this.baseUrl}/${normalized}`).pipe(
      map((detail) => [this.toPokemon(detail)]),
      catchError(() =>
        throwError(() => new Error(`No se encontró ningún Pokémon con el nombre "${name}".`))
      )
    );
  }

  private toPokemon(detail: PokemonDetailResponse): Pokemon {
    return {
      id: detail.id,
      name: detail.name,
      image:
        detail.sprites.other?.['official-artwork']?.front_default ??
        detail.sprites.front_default,
      height: detail.height,
      weight: detail.weight,
      baseExperience: detail.base_experience,
      types: detail.types.map((t) => t.type.name),
      abilities: detail.abilities.map((a) => a.ability.name)
    };
  }
}
