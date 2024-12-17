import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      console.log(`Pokemon created: ${JSON.stringify(pokemon)}`);
      return pokemon;
    } catch (error) {
      this.handleExeption(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    // Busqueda por numeroOrden
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
      console.log(
        `Pokemon encontrado por numero de orden: ${JSON.stringify(pokemon)}`,
      );
    }

    // Busqueda por MongoID
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
      console.log(`Pokemon encontrado por MongoID: ${JSON.stringify(pokemon)}`);
    }

    // Busqueda por nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase() });
      console.log(`Pokemon encontrado por nombre: ${JSON.stringify(pokemon)}`);
    }

    // No se encontro el pokemon
    if (!pokemon) {
      throw new NotFoundException(`Pokemon ${id} not found`);
    }

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto);
      console.log(`Pokemon "${pokemon.name}" updated`);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExeption(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon ${id} not found`);
    }

    console.log(`Pokemon ${id} deleted`);

    return;
  }

  private handleExeption(error: any) {
    if (error.code === 11000) {
      console.log(
        `[!] ERROR: Pokemon already exists: ${JSON.stringify(error.keyValue)}`,
      );
      throw new BadRequestException(
        `Pokemon already exists: ${JSON.stringify(error.keyValue)}`,
      );
      throw new InternalServerErrorException('Cant create pokemon');
    }
  }
}
