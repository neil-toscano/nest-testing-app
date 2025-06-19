import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/pokemons (POST) - with no body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    const messageArray = response.body.message ?? [];
    expect(messageArray).toContain('name must be a string');
    expect(messageArray).toContain('type should not be empty');
  });

  it('/pokemons (POST) - with no body 2', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    const mostHaveErrorMessage = [
      'name must be a string',
      'name should not be empty',
      'type must be a string',
      'type should not be empty',
    ];

    const messageArray = response.body.message ?? [];

    expect(messageArray.length).toBe(mostHaveErrorMessage.length);
    expect(messageArray).toEqual(expect.arrayContaining(mostHaveErrorMessage));
  });

  it('/pokemons (POST) - with valid body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons').send({
      name: 'Pikachu',
      type: 'Electric',
    });

    const pokemon = response.body;

    expect(response.status).toBe(201);
    expect(pokemon).toHaveProperty('id', expect.any(Number));
  });

  it('/pokemons (GET) should return paginated list of pokemons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons')
      .query({ limit: 5, page: 1 });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
    expect(response.body).toBeInstanceOf(Array);

    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id', expect.any(Number));
      expect(pokemon).toHaveProperty('name', expect.any(String));
      expect(pokemon).toHaveProperty('type', expect.any(String));
      expect(pokemon.sprites).toBeInstanceOf(Array);
    });
  });

  it('/pokemons (GET) should return 20 paginated pokemons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons')
      .query({ limit: 20, page: 1 });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(20);
    expect(response.body).toBeInstanceOf(Array);

    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id', expect.any(Number));
      expect(pokemon).toHaveProperty('name', expect.any(String));
      expect(pokemon).toHaveProperty('type', expect.any(String));
      expect(pokemon.sprites).toBeInstanceOf(Array);
    });
  });

  it('/pokemons/:id (GET) shuld return a pokemon by Id', async () => {
    const response = await request(app.getHttpServer()).get('/pokemons/1');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('bulbasaur');
    expect(response.body.id).toBe(1);
  });

  it('/pokemons/:id (GET) shuld return NOT FOUND', async () => {
    const pokemonId = 10000;
    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `Pokemon with id ${pokemonId} not found`,
    );
  });

  it('/pokemons/:id (PATCH) shuld update pokemon', async () => {
    const pokemonId = 1;
    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send({
        name: 'Bulbasaur',
        type: 'Grass',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', pokemonId);
    expect(response.body.sprites).toBeInstanceOf(Array);
  });

  it('/pokemons/:id (PATCH) shuld throw an error 404', async () => {
    const pokemonId = 100000;
    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send({
        name: 'Bulbasaur',
        type: 'Grass',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      'message',
      `Pokemon with id ${pokemonId} not found`,
    );
  });

  it('/pokemons/:id (DELETE) should delete pokemon', async () => {
    const id = 1;

    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );
    expect(response.status).toBe(200);
    expect(response.text).toBe(`Pokemon #bulbasaur removed`);
  });

  it('/pokemons/:id (DELETE) should throw an Error', async () => {
    const id = 10000;

    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      'message',
      `Pokemon with id ${id} not found`,
    );
  });
});
