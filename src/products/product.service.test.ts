import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { ProductsService } from "./products.service";

const mockProduct = {
	id: 1,
	name: "Milk",
	desc: "Whole milk 1L",
	price: new Prisma.Decimal("2.99"),
	createdAt: new Date(),
	updatedAt: new Date(),
};

type ProductDelegate = PrismaService["product"];

const mockPrisma = {
	product: {
		create: jest.fn<ProductDelegate["create"]>(),
		findMany: jest.fn<ProductDelegate["findMany"]>(),
		findUnique: jest.fn<ProductDelegate["findUnique"]>(),
		update: jest.fn<ProductDelegate["update"]>(),
		delete: jest.fn<ProductDelegate["delete"]>(),
	},
};

describe("ProductsService", () => {
	let service: ProductsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductsService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile();

		service = module.get<ProductsService>(ProductsService);
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should create a product", async () => {
			mockPrisma.product.create.mockResolvedValue(mockProduct);

			const result = await service.create({
				name: "Milk",
				desc: "Whole milk 1L",
				price: new Prisma.Decimal("2.99"),
			});
			expect(result).toEqual(mockProduct);
			expect(mockPrisma.product.create).toHaveBeenCalledWith({
				data: {
					name: "Milk",
					desc: "Whole milk 1L",
					price: new Prisma.Decimal("2.99"),
				},
			});
		});
	});

	describe("findAll", () => {
		it("should return an array of products", async () => {
			mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
			const result = await service.findAll();
			expect(result).toEqual([mockProduct]);
		});
	});

	describe("findOne", () => {
		it("should return a product by id", async () => {
			mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
			const result = await service.findOne(1);
			expect(result).toEqual(mockProduct);
		});

		it("should throw NotFoundException if product does not exist", async () => {
			mockPrisma.product.findUnique.mockResolvedValue(null);
			await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		it("should update a product", async () => {
			const updated = { ...mockProduct, price: new Prisma.Decimal("3.49") };
			mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
			mockPrisma.product.update.mockResolvedValue(updated);
			const result = await service.update(1, {
				price: new Prisma.Decimal("3.49"),
			});
			expect(result).toEqual(updated);
		});

		it("should throw NotFoundException if product does not exist", async () => {
			mockPrisma.product.findUnique.mockResolvedValue(null);
			await expect(
				service.update(99, { price: new Prisma.Decimal("3.49") }),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a product", async () => {
			mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
			mockPrisma.product.delete.mockResolvedValue(mockProduct);
			const result = await service.remove(1);
			expect(result).toEqual(mockProduct);
		});

		it("should throw NotFoundException if product does not exist", async () => {
			mockPrisma.product.findUnique.mockResolvedValue(null);
			await expect(service.remove(99)).rejects.toThrow(NotFoundException);
		});
	});
});
