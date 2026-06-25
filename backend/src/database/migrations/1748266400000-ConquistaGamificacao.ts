import { MigrationInterface, QueryRunner } from "typeorm";

export class ConquistaGamificacao1748266400000 implements MigrationInterface {
  name = "ConquistaGamificacao1748266400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`conquista\` ADD \`meta_tipo\` varchar(40) NOT NULL DEFAULT 'compras_count'`
    );
    await queryRunner.query(
      `ALTER TABLE \`conquista\` ADD \`meta_valor\` int NOT NULL DEFAULT 1`
    );
    await queryRunner.query(
      `ALTER TABLE \`conquista\` ADD \`pontos_bonus\` int NOT NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`conquista\` DROP COLUMN \`pontos_bonus\``);
    await queryRunner.query(`ALTER TABLE \`conquista\` DROP COLUMN \`meta_valor\``);
    await queryRunner.query(`ALTER TABLE \`conquista\` DROP COLUMN \`meta_tipo\``);
  }
}
