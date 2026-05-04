import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import {
	HealthCheck,
	HealthCheckService,
	HealthIndicatorService,
} from "@nestjs/terminus";
import { PrismaService } from "../database/prisma.service";

@Controller("health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly indicator: HealthIndicatorService,
		private readonly prisma: PrismaService,
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([
			async () => this.indicator.check("app").up(),
			async () => {
				try {
					await this.prisma.$queryRaw`SELECT 1`;
					return this.indicator.check("database").up();
				} catch (error) {
					return this.indicator
						.check("database")
						.down(
							error instanceof Error ? error.message : "Database query failed",
						);
				}
			},
		]);
	}

	@Get("live")
	@HealthCheck()
	liveness() {
		return this.health.check([async () => this.indicator.check("app").up()]);
	}

	@Get("ready")
	@HealthCheck()
	readiness() {
		return this.health.check([
			async () => {
				try {
					await this.prisma.$queryRaw`SELECT 1`;
					return this.indicator.check("database").up();
				} catch (error) {
					throw new HttpException(
						{
							status: "error",
							details: {
								database: {
									status: "down",
									message:
										error instanceof Error
											? error.message
											: "Database query failed",
								},
							},
						},
						HttpStatus.SERVICE_UNAVAILABLE,
					);
				}
			},
		]);
	}
}
