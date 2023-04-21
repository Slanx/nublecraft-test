import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const typeOrmModuleOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

const TypeOrmConfig = new DataSource({
  ...typeOrmModuleOptions,
  migrations: ['src/migrations/*{.ts,.js}'],
  // migrationsRun: true,
  migrationsTableName: 'migrations',
});

export default TypeOrmConfig;
