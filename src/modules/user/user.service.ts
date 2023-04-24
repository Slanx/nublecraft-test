import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/utils/hash';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { FilesService } from '../files/files.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { path } from 'app-root-path';

@Injectable()
export class UserService {
  private readonly saltRounds: number;
  private readonly port: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.get('CRYPT_SALT'));
    this.port = Number(this.configService.get('PORT'));
  }

  async create(createUserDto: CreateUserDto, image?: Express.Multer.File) {
    const hashedPassword = await hashPassword(
      this.saltRounds,
      createUserDto.password,
    );

    const userImage = image ? await this.filesService.uploadImage(image) : null;

    const user = this.userRepository.create({
      ...createUserDto,
      image: userImage
        ? `http://localhost:${this.port}/${userImage}`
        : userImage,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const prevUser = await this.findOne(id);

    const userImage = image ? await this.filesService.uploadImage(image) : null;

    if (prevUser.image && image) {
      this.filesService.deleteImage(
        prevUser.image.replace(`http://localhost:${this.port}/`, ''),
      );
    }

    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
      image: image
        ? `http://localhost:${this.port}/${userImage}`
        : prevUser.image,
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }

  async createUserProfile(email: string) {
    const user = await this.findOneByEmail(email);

    const doc = new PDFDocument({ margin: 50 });

    const buffers = [];

    doc.on('data', (chunk) => {
      buffers.push(chunk);
    });
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);

      this.userRepository.save({
        ...user,
        pdf: pdfBuffer,
      });
    });

    doc.text(`${user.firstName} ${user.lastName}`);

    if (user.image) {
      const imagePath = `${path}/uploads/${user.image.replace(
        `http://localhost:${this.port}/`,
        '',
      )}`;
      doc.image(imagePath, 320, 280, { scale: 0.25 });
    }

    doc.end();

    return { result: true };
  }

  async getUserProfile(email: string) {
    const { pdf } = await this.findOneByEmail(email);

    const stream = Readable.from(pdf);

    return new StreamableFile(stream);
  }
}
