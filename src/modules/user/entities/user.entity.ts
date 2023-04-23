import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: null })
  image: string;

  @Column({ type: 'bytea', default: null })
  pdf: Uint8Array;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
