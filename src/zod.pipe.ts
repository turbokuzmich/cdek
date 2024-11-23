import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { property } from 'lodash';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      const message =
        error instanceof ZodError
          ? error.errors.map(property('message')).join(', ')
          : 'Validation failed';

      throw new BadRequestException(message);
    }
  }
}
