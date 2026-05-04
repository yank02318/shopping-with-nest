import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

const mockProduct = {
	id: 1,
	name: "Milk",
	desc: "Whole milk 1L",
	price: new Prisma.Decimal("2.99"),
	createdAt: new Date(),
	updatedAt: new Date(),
};

type ServiceType = InstanceType<typeof ProductsService>;

const mockProductsService = {
	create: jest.fn<ServiceType["create"]>(),
	findAll: jest.fn<ServiceType["findAll"]>(),
	findOne: jest.fn<ServiceType["findOne"]>(),
	update: jest.fn<ServiceType["update"]>(),
	remove: jest.fn<ServiceType["remove"]>(),
};

describe("ProductsController", () => {
	let controller: ProductsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProductsController],
			providers: [{ provide: ProductsService, useValue: mockProductsService }],
		}).compile();

		controller = module.get<ProductsController>(ProductsController);
		jest.clearAllMocks();
	});

	it("should call service.create with the dto", async () => {
		mockProductsService.create.mockResolvedValue(mockProduct);
		const dto = {
			name: "Milk",
			desc: "Whole milk 1L",
			price: new Prisma.Decimal("2.99"),
		};
		const result = await controller.create(dto);
		expect(mockProductsService.create).toHaveBeenCalledWith(dto);
		expect(result).toEqual(mockProduct);
	});

	it("should call service.findAll", async () => {
		mockProductsService.findAll.mockResolvedValue([mockProduct]);
		const result = await controller.findAll();
		expect(result).toEqual([mockProduct]);
	});

	it("should call service.findOne with a numeric id", async () => {
		mockProductsService.findOne.mockResolvedValue(mockProduct);
		const result = await controller.findOne("1");
		expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
		expect(result).toEqual(mockProduct);
	});

	it("should call service.update with id and dto", async () => {
		const updated = { ...mockProduct, price: new Prisma.Decimal("3.49") };
		mockProductsService.update.mockResolvedValue(updated);
		const result = await controller.update("1", {
			price: new Prisma.Decimal("3.49"),
		});
		expect(mockProductsService.update).toHaveBeenCalledWith(1, {
			price: new Prisma.Decimal("3.49"),
		});
		expect(result).toEqual(updated);
	});

	it("should call service.remove with a numeric id", async () => {
		mockProductsService.remove.mockResolvedValue(mockProduct);
		const result = await controller.remove("1");
		expect(mockProductsService.remove).toHaveBeenCalledWith(1);
		expect(result).toEqual(mockProduct);
	});
});
