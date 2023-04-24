import { BadRequestException, Injectable } from '@nestjs/common';
import { FileResponse } from './dto/file.response';
import { path } from 'app-root-path';
import { format } from 'date-fns';
import { ensureDir, writeFile, remove } from 'fs-extra';

@Injectable()
export class FilesService {
  async saveFiles(
    file: Express.Multer.File,
    directory: string,
  ): Promise<FileResponse> {
    const dateFolder = format(new Date(), 'yyyy-MM-dd');

    const uploadFolder = `${path}/uploads/${directory}/${dateFolder}`;
    await ensureDir(uploadFolder);

    await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

    return {
      url: `${directory}/${dateFolder}/${file.originalname}`,
      name: file.originalname,
    };
  }

  async uploadImage(file: Express.Multer.File) {
    const { url } = await this.saveFiles(file, 'image');

    return url;
  }

  async deleteImage(pathImage: string) {
    try {
      await remove(`${path}/uploads/${pathImage}`);
    } catch (e) {
      throw new BadRequestException('Invalid image path');
    }
  }
}
