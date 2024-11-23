import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'config';
import { merge } from 'lodash';
import {
  cdekTokenSchema,
  citySchema,
  pointSchema,
  regionSchema,
} from './schemas';

class Token {
  private updatedAt = 0;
  private expiresIn = 0;
  private token = '';

  constructor(
    private readonly apiUrl: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  private url(resource: string) {
    return `${this.apiUrl}${resource}`;
  }

  async get() {
    const now = Date.now();

    if (now - this.expiresIn > this.updatedAt) {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const response = await fetch(this.url('/oauth/token?parameters'), {
        body: params.toString(),
        cache: 'no-store',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
      });

      const json = await response.json();
      const parsed = cdekTokenSchema.safeParse(json);

      if (parsed.success) {
        this.token = parsed.data.access_token;
        this.expiresIn = (parsed.data.expires_in - 10) * 1000;
      } else {
        throw new UnauthorizedException();
      }
    }

    return this.token;
  }
}

@Injectable()
export class CdekService {
  private token: Token;

  constructor(private readonly config: ConfigService<Config, true>) {
    this.token = new Token(
      this.config.get('cdekApiUrl'),
      this.config.get('cdekClientId'),
      this.config.get('cdekClientSecret'),
    );
  }

  private url(resource: string) {
    return `${this.config.get('cdekApiUrl')}${resource}`;
  }

  private async get(
    resource: string,
    request: Partial<RequestInit> & {
      params?: Record<string, string | number>;
    } = {},
  ) {
    const token = await this.token.get();

    const { params, ...init } = request;

    const url = new URL(this.url(resource));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(
      url,
      merge({ headers: { Authorization: `Bearer ${token}` }, init }),
    );

    return response.json();
  }

  async getRegions(page = 0, size = 500) {
    const json = await this.get('/location/regions', {
      params: {
        page,
        size,
        country_codes: 'RU',
      },
    });

    const result = regionSchema.array().safeParse(json);

    return result.success ? result.data : [];
  }

  async getCities(page = 0, size = 5000) {
    const json = await this.get('/location/cities', {
      params: {
        page,
        size,
        country_codes: 'RU',
      },
    });

    const result = citySchema.array().safeParse(json);

    return result.success ? result.data : [];
  }

  async getPoints(page = 0, size = 5000) {
    const json = await this.get('/deliverypoints', {
      params: {
        page,
        size,
        country_code: 'RU',
      },
    });

    const result = pointSchema.array().safeParse(json);

    return result.success ? result.data : [];
  }
}
