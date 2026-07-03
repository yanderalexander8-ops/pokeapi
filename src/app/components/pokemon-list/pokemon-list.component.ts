import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  standalone: false,
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  loading = false;
  error: string | null = null;

  readonly pageSize = 20;
  offset = 0;
  isSearching = false;

  searchControl = new FormControl<string>('', { nonNullable: true });

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadPage();

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        const value = term.trim();
        if (value.length > 0) {
          this.search(value);
        } else {
          this.isSearching = false;
          this.loadPage();
        }
      });
  }

  loadPage(): void {
    this.loading = true;
    this.error = null;
    this.isSearching = false;

    this.pokemonService.getPokemonList(this.pageSize, this.offset).subscribe({
      next: (data) => {
        this.pokemons = data;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.pokemons = [];
      }
    });
  }

  search(name: string): void {
    this.loading = true;
    this.error = null;
    this.isSearching = true;

    this.pokemonService.searchPokemonByName(name).subscribe({
      next: (data) => {
        this.pokemons = data;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.pokemons = [];
      }
    });
  }

  nextPage(): void {
    this.offset += this.pageSize;
    this.loadPage();
  }

  previousPage(): void {
    this.offset = Math.max(0, this.offset - this.pageSize);
    this.loadPage();
  }

  trackByPokemonId(_index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}
