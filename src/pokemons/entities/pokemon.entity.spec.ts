import { Pokemon } from './pokemon.entity';

describe('Pokemon entity', () => {
  it('should create a pokemon instance', () => {
    const pokemon = new Pokemon();
    expect(pokemon).toBeInstanceOf(Pokemon);
  });

  it('should have all properties', () => {
    const pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.hp = 100;
    pokemon.name = 'Pikachu';
    pokemon.sprites = [];
    pokemon.type = 'Electric';

    expect(pokemon).toHaveProperty('id', 1);
    expect(pokemon).toHaveProperty('name', 'Pikachu');
    expect(pokemon).toHaveProperty('type', 'Electric');
    expect(pokemon).toHaveProperty('hp', 100);
    expect(pokemon).toHaveProperty('sprites', []);
  });

  it('property sprites must have an array', () => {
    const pokemon = new Pokemon();
    pokemon.sprites = [];
    expect(Array.isArray(pokemon.sprites)).toBe(true);
  });
});
