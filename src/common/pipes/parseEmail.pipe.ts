import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import validator from 'validator';

@Injectable()
export class ParseEmailPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') return value;

    if (!validator.isEmail(value))
      throw new BadRequestException('Invalid format email');

    return value.toLowerCase();
  }
}
