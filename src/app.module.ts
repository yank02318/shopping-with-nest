import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ProductsModule } from './products/products.module.js';
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module.js";
import appConfig from './config/app.config'

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [ConfigModule.forRoot({
		isGlobal: true, load: [appConfig]
	}) ,ProductsModule, PrismaModule],
})
export class AppModule {}
