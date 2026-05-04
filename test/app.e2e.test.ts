import { afterAll, beforeAll, describe, it, jest } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Products (e2e)", () => {
	let app: INestApplication;

	type ProductDelegate = PrismaService["product"];

	const mockPrismaService = {
		product: {
			findMany: jest.fn<ProductDelegate["findMany"]>().mockResolvedValue([]),
			create: jest.fn<ProductDelegate["create"]>(),
			findUnique: jest.fn<ProductDelegate["findUnique"]>(),
			update: jest.fn<ProductDelegate["update"]>(),
			delete: jest.fn<ProductDelegate["delete"]>(),
		},
	};

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(PrismaService)
			.useValue(mockPrismaService)
			.compile();

		app = module.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /products returns 200", () => {
		return request(app.getHttpServer()).get("/products").expect(200).expect([]);
	});
});
