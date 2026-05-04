import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger(PrismaService.name);

	constructor(private readonly configService: ConfigService) {
		const databaseUrl = configService.get<string>("databaseUrl");

		if (!databaseUrl) {
			throw new Error("DATABASE_URL is missing");
		}

		const pool = new Pool({
			connectionString: databaseUrl,
		});

		const adapter = new PrismaPg(pool);

		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
		this.logger.log("Database connection established");
	}

	async onModuleDestroy() {
		await this.$disconnect();
		this.logger.log("Database connection closed");
	}
}
