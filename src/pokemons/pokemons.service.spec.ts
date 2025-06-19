import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pokemon', async () => {
    const data = {
      id: expect.any(Number),
      name: 'Pikachu',
      type: 'Electric',
      hp: 0,
      sprites: [],
    };

    const result = await service.create(data);
    expect(result).toMatchObject(data);
  });

  it('Should throw an error if pokemon already exists', async () => {
    const pokemon = {
      hp: 1,
      name: 'Pikachu',
      type: 'Electric',
      sprites: [],
    };

    await service.create(pokemon);

    try {
      await service.create(pokemon);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        `Pokemon with name ${pokemon.name} already exists`,
      );
    }
  });

  it('should return pokemon if exists', async () => {
    const id = 4;

    const result = await service.findOne(id);

    expect(result).toEqual({
      id: 4,
      name: 'charmander',
      type: 'fire',
      hp: 39,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png',
      ],
    });
  });

  it("should return 404 error if pokemon doesn't exits", async () => {
    const id = 400_000;

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(id)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('should check properties of the pokemon', async () => {
    const id = 4;
    const pokemon = await service.findOne(id);

    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');

    expect(pokemon).toEqual(
      expect.objectContaining({
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any(Number),
      }),
    );
  });

  it('should find all pokemons and cache them', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);

    expect(service.paginatedPokemonsCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonsCache.get('10-1')).toBe(pokemons);
  });

  it('Should find a pokemon from cache', async () => {
    const cacheSpy = jest.spyOn(service.pokemonsCache, 'get');

    const pokemonId = 3;
    await service.findOne(pokemonId);
    await service.findOne(pokemonId);

    expect(cacheSpy).toHaveBeenCalledTimes(1);
  });

  it('should update a pokemon', async () => {
    const updatePokemon = {
      hp: 1,
    };

    const pokemonId = 1;
    const updatedPokemon = await service.update(pokemonId, updatePokemon);
    expect(updatePokemon).toHaveProperty('hp', 1);
  });

  it('throw an error if pokemon does not exist when updated', async () => {
    const updatePokemon = {
      hp: 1,
    };

    const pokemonId = 7895969;
    try {
      const newPokemon = await service.update(pokemonId, updatePokemon);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('remove a pokemon', async () => {
    const pokemonId = 1;
    const pokemon = await service.findOne(pokemonId);
    const result = await service.remove(pokemonId);

    expect(result).toBe(`Pokemon #${pokemon?.name} removed`);
    expect(service.pokemonsCache.get(pokemonId)).toBeUndefined();
  });

  it('find all pokemon from cache', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const cacheSpy = jest.spyOn(service.paginatedPokemonsCache, 'get');

    const paginationDto = {
      limit: 10,
      page: 1,
    };

    const pokemons = await service.findAll(paginationDto);

    await service.findAll(paginationDto);

    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith(
      `${paginationDto.limit}-${paginationDto.page}`,
    );
    expect(fetchSpy).toHaveBeenCalledTimes(11);
  });
});
