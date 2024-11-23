import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { infer as inferType } from 'zod';
import { regionSchema, citySchema, pointSchema } from './schemas';
import { property } from 'lodash';

@Injectable()
export class DbService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async upsertRegion(region: inferType<typeof regionSchema>) {
    await this.region.upsert({
      create: region,
      update: region,
      where: {
        region_code: region.region_code,
      },
    });
  }

  async upsertCity(city: inferType<typeof citySchema>) {
    await this.city.upsert({
      create: city,
      update: city,
      where: {
        code: city.code,
      },
    });
  }

  async resetDeletedPoints() {
    await this.point.updateMany({
      data: {
        is_deleted: true,
      },
    });
  }

  async upsertPoint(point: inferType<typeof pointSchema>) {
    const existingPoint = {
      ...point,
      is_deleted: false,
    };

    await this.point.upsert({
      create: existingPoint,
      update: existingPoint,
      where: {
        code: point.code,
      },
    });
  }

  async resetCityPointsQty(codes: Array<{ code: number; qty: number }>) {
    await this.city.updateMany({
      data: {
        points_qty: 0,
      },
    });

    for (const { code, qty } of codes) {
      await this.city.updateMany({
        data: {
          points_qty: qty,
        },
        where: {
          code,
        },
      });
    }
  }

  async resetRegionHasPoints(codes: number[]) {
    await this.region.updateMany({
      data: {
        has_points: false,
      },
    });

    await this.region.updateMany({
      data: {
        has_points: true,
      },
      where: {
        region_code: {
          in: codes,
        },
      },
    });
  }

  async fetchExistingPointsCityCodes() {
    const result = await this.point.groupBy({
      _count: {
        _all: true,
      },
      by: 'city_code',
      where: {
        is_deleted: false,
      },
    });

    return result.map((row) => ({ code: row.city_code, qty: row._count._all }));
  }

  async fetchExistingPointsRegionCodes() {
    const result = await this.$queryRaw<
      Array<{ region_code: number }>
    >`SELECT DISTINCT region_code FROM Point WHERE is_deleted = 0;`;

    return result.map<number>(property('region_code'));
  }

  suggestCities(text: string) {
    return this.city.findMany({
      where: {
        AND: [
          { points_qty: { gt: 0 } },
          {
            OR: [{ city: { contains: text } }, { region: { contains: text } }],
          },
        ],
      },
      orderBy: {
        points_qty: 'desc',
      },
      take: 10,
    });
  }

  getPointsByCityCode(code: number) {
    return this.point.findMany({
      select: {
        id: true,
        code: true,
        type: true,
        allowed_cod: true,
        longitude: true,
        latitude: true,
        address: true,
      },
      where: {
        city_code: code,
        is_deleted: false,
      },
    });
  }

  getPointsByBounds(
    northWestLng: number,
    northWestLat: number,
    southEastLng: number,
    southEastLat: number,
  ) {
    return this.point.findMany({
      select: {
        id: true,
        code: true,
        type: true,
        allowed_cod: true,
        longitude: true,
        latitude: true,
        address: true,
      },
      where: {
        AND: [
          { is_deleted: false },
          { longitude: { gte: Math.min(northWestLng, southEastLng) } },
          { longitude: { lte: Math.max(northWestLng, southEastLng) } },
          { latitude: { gte: Math.min(northWestLat, southEastLat) } },
          { latitude: { lte: Math.max(northWestLat, southEastLat) } },
        ],
      },
    });
  }

  getPointByCode(code: string) {
    return this.point.findUnique({
      where: {
        code,
      },
    });
  }
}
