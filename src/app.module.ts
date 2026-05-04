import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./database/prisma.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import appConfig from "./config/app.config";
import { HealthModule } from "./health/health.module";
import { ProductsModule } from "./products/products.module.js";

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
		}),
		ProductsModule,
		PrismaModule,
		HealthModule,
	],
})
export class AppModule {}
