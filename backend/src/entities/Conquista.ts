import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("conquista")
export class Conquista {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ length: 40, unique: true })
  slug!: string;

  @Column({ length: 80 })
  nome!: string;

  @Column({ length: 255 })
  descricao!: string;

  @Column({ length: 40 })
  icone!: string;

  @Column({ name: "meta_tipo", length: 40, default: "compras_count" })
  metaTipo!: string;

  @Column({ name: "meta_valor", type: "int", default: 1 })
  metaValor!: number;

  @Column({ name: "pontos_bonus", type: "int", default: 0 })
  pontosBonus!: number;
}
