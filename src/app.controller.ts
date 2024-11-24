import {
  Controller,
  Get,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import { CdekService } from './cdek.service';
import { DbService } from './db.service';
import { ZodValidationPipe } from './zod.pipe';
import { string } from 'zod';

@Controller()
export class AppController {
  constructor(
    private readonly updateService: UpdateService,
    private readonly cdekService: CdekService,
    private readonly dbService: DbService,
  ) {}

  @Get('/cities/nearest')
  async getNearestCity(
    @Query('lng', new ParseFloatPipe()) lng: number,
    @Query('lat', new ParseFloatPipe()) lat: number,
  ) {
    const city = await this.dbService.getNearestCity(lng, lat);

    if (!city) {
      throw new NotFoundException('Город не найден');
    }

    return city;
  }

  @Get('/cities/suggest')
  getCities(
    @Query(
      'text',
      new ZodValidationPipe(
        string({
          required_error: 'Пожалуйста, укажите text',
        }).min(3, 'text должен быть не менее 3 символов'),
      ),
    )
    text: string,
  ) {
    return this.dbService.suggestCities(text);
  }

  @Get('/points/:code')
  async getPoint(
    @Param(
      'code',
      new ZodValidationPipe(
        string({ required_error: 'Пожалуйста, укажите код' })
          .min(3, 'Код должен быть не менее 3 символов')
          .max(10, 'Код должен быть не более 10 символов'),
      ),
    )
    code: string,
  ) {
    const point = await this.dbService.getPointByCode(code);

    if (!point) {
      throw new NotFoundException('Точка не найдена');
    }

    return point;
  }

  @Get('/points/by-city')
  getPointsByCity(@Query('city', new ParseIntPipe()) city: number) {
    return this.dbService.getPointsByCityCode(city);
  }

  @Get('points/by-bounds')
  getPointsForBounds(
    @Query('northWestLng', new ParseFloatPipe()) northWestLng: number,
    @Query('northWestLat', new ParseFloatPipe()) northWestLat: number,
    @Query('southEastLng', new ParseFloatPipe()) southEastLng: number,
    @Query('southEastLat', new ParseFloatPipe()) southEastLat: number,
  ) {
    return this.dbService.getPointsByBounds(
      northWestLng,
      northWestLat,
      southEastLng,
      southEastLat,
    );
  }
}
