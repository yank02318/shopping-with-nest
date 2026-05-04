import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it("should return app details", () => {
			expect(appController.getHello()).toEqual(
				expect.objectContaining({
					appName: expect.any(String),
					status: expect.any(String),
					version: expect.any(String),
				}),
			);
		});
	});
});
