import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpException, HttpStatus } from "@nestjs/common";
import {
	HealthCheckResult,
	HealthCheckService,
	HealthCheckStatus,
	HealthIndicatorService,
} from "@nestjs/terminus";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../database/prisma.service";
import { HealthController } from "./health.controller";

const mockHealth = {
	check: jest.fn<() => Promise<HealthCheckResult>>(),
};

const mockIndicator = {
	check: jest.fn().mockReturnValue({
		up: jest.fn(),
		down: jest.fn(),
	}),
};

const mockPrisma = {
	$queryRaw: jest.fn(),
};

const makeResult = (
	status: HealthCheckStatus,
	keys: string[],
): HealthCheckResult => ({
	status,
	info: Object.fromEntries(keys.map((k) => [k, { status: "up" as const }])),
	error: {},
	details: Object.fromEntries(keys.map((k) => [k, { status: "up" as const }])),
});

describe("HealthController", () => {
	let controller: HealthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: mockHealth as unknown as HealthCheckService,
				},
				{
					provide: HealthIndicatorService,
					useValue: mockIndicator as unknown as HealthIndicatorService,
				},
				{
					provide: PrismaService,
					useValue: mockPrisma as unknown as PrismaService,
				},
			],
		}).compile();

		controller = module.get<HealthController>(HealthController);
		jest.clearAllMocks();
	});

	describe("GET /health/live", () => {
		it("should return app up", async () => {
			const expected = makeResult("ok", ["app"]);
			mockHealth.check.mockResolvedValue(expected);
			const result = await controller.liveness();
			expect(result).toEqual(expected);
		});
	});

	describe("GET /health/ready", () => {
		it("should return database up when query succeeds", async () => {
			const expected = makeResult("ok", ["database"]);
			mockHealth.check.mockResolvedValue(expected);
			const result = await controller.readiness();
			expect(result).toEqual(expected);
		});

		it("should throw SERVICE_UNAVAILABLE when database is down", async () => {
			mockHealth.check.mockRejectedValue(
				new HttpException({ status: "error" }, HttpStatus.SERVICE_UNAVAILABLE),
			);
			await expect(controller.readiness()).rejects.toThrow(HttpException);
		});
	});

	describe("GET /health", () => {
		it("should return both app and database up", async () => {
			const expected = makeResult("ok", ["app", "database"]);
			mockHealth.check.mockResolvedValue(expected);
			const result = await controller.check();
			expect(result).toEqual(expected);
		});
	});
});
