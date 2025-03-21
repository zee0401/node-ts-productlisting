import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 500 })
    url!: string;

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "product_id" })
    product!: Product;
}
