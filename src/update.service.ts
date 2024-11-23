import { Injectable } from '@nestjs/common';
import { CdekService } from './cdek.service';
import { DbService } from './db.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  featureCollection,
  point,
  convex,
  centerOfMass,
  getCoords,
} from '@turf/turf';

@Injectable()
export class UpdateService {
  constructor(
    private readonly cdekService: CdekService,
    private readonly dbService: DbService,
  ) {}

  async updateRegions() {
    let page = 0;

    while (true) {
      const regions = await this.cdekService.getRegions(page);

      if (regions.length === 0) {
        break;
      }

      for (const region of regions) {
        await this.dbService.upsertRegion(region);
      }

      page++;
    }

    console.log('Regions updated');
  }

  async updateCities() {
    let page = 0;

    while (true) {
      const cities = await this.cdekService.getCities(page);

      if (cities.length === 0) {
        break;
      }

      for (const city of cities) {
        await this.dbService.upsertCity(city);
      }
      // await this.dbService.city.createMany({
      //   data: cities,
      // });

      page++;
    }

    console.log('Cities updated');
  }

  async updatePoints() {
    let page = 0;

    await this.dbService.resetDeletedPoints();

    while (true) {
      const points = await this.cdekService.getPoints(page);

      if (points.length === 0) {
        break;
      }

      for (const point of points) {
        await this.dbService.upsertPoint(point);
      }

      page++;
    }

    console.log('Points updated');
  }

  async updateCityPointsQty() {
    const codes = await this.dbService.fetchExistingPointsCityCodes();

    await this.dbService.resetCityPointsQty(codes);

    console.log('City has points updated');
  }

  async updateRegionHasPoints() {
    const codes = await this.dbService.fetchExistingPointsRegionCodes();

    await this.dbService.resetRegionHasPoints(codes);

    console.log('Region has points updated');
  }

  async updateRegionCoordinates() {
    const regionsWithPoints = await this.dbService.region.findMany({
      select: {
        region_code: true,
      },
      where: {
        has_points: true,
      },
    });

    for (const region of regionsWithPoints) {
      const regionPoins = await this.dbService.point.findMany({
        select: {
          longitude: true,
          latitude: true,
        },
        where: {
          region_code: region.region_code,
          is_deleted: false,
        },
      });

      if (regionPoins.length > 2) {
        const polygon = convex(
          featureCollection(
            regionPoins.map((regionPoint) =>
              point([regionPoint.longitude, regionPoint.latitude]),
            ),
          ),
        );

        const [longitude, latitude]: number[] = getCoords(
          centerOfMass(polygon),
        );

        await this.dbService.region.update({
          data: {
            longitude,
            latitude,
          },
          where: {
            region_code: region.region_code,
          },
        });
      } else {
        await this.dbService.region.update({
          data: {
            longitude: regionPoins[0].longitude,
            latitude: regionPoins[0].latitude,
          },
          where: {
            region_code: region.region_code,
          },
        });
      }
    }

    console.log('Region coordinates updated');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateAll() {
    await this.updateRegions();
    await this.updateCities();
    await this.updatePoints();
    await this.updateCityPointsQty();
    await this.updateRegionHasPoints();
    await this.updateRegionCoordinates();
  }
}
