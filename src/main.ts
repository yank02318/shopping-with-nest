import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./intereceptors/logging.interceptor";

async function bootstrap() {
	const logger = new Logger("Bootstrap");

	const app = await NestFactory.create(AppModule);

	app.useGlobalInterceptors(new LoggingInterceptor());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const configService = app.get(ConfigService);
	const port = configService.get<number>("port") ?? 3500;

	await app.listen(port);
	logger.log(`Application running on http://localhost:${port}`);
}

bootstrap();
