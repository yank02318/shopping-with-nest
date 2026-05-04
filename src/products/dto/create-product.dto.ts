import { Prisma } from "@prisma/client";
import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateProductDto {
	@IsString()
	@Length(2, 50)
	name!: string;

	@IsString()
	@Length(20, 200)
	@IsOptional()
	desc?: string;

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	price!: Prisma.Decimal;
}
