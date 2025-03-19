import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProductImage } from "./Product-Image";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    sku!: string;

    @Column()
    name!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @OneToMany(() => ProductImage, (image) => image.product, {
        cascade: ["insert", "update", "remove"],
    })
    images!: ProductImage[];
}
