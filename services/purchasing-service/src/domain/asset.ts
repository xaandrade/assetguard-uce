import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("assets")
export class Asset {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    status!: string;
}