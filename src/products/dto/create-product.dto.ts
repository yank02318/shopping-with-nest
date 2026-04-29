import { IsString, IsOptional, Length, IsCurrency } from 'class-validator';

export class CreateProductDto {

  @IsString()
  @Length(2, 50)
  name!: string;

  @IsString()
  @Length(20, 200)
  @IsOptional()
  desc?: string;

  @IsCurrency()
  price!: number;
}