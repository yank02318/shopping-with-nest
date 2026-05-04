import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getHello(): { appName: string; status: string; version: string } {
		return { appName: "devops-shopping", status: "running", version: "1.0.0" };
	}
}
