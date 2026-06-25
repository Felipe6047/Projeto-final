import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CampanhaBonus1748266300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("campanha", new TableColumn({
      name: "multiplicador_pontos",
      type: "decimal",
      precision: 3,
      scale: 1,
      default: 1.0
    }));

    await queryRunner.addColumn("campanha", new TableColumn({
      name: "desconto_resgate_cupons",
      type: "decimal",
      precision: 5,
      scale: 2,
      default: 0.00
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("campanha", "multiplicador_pontos");
    await queryRunner.dropColumn("campanha", "desconto_resgate_cupons");
  }
}
