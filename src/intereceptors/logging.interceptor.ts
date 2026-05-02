import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger("HTTP");

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();
		const { method, originalUrl } = req;
		const started = Date.now();

		return next.handle().pipe(
			tap({
				next: () => {
					const ms = Date.now() - started;
					this.logger.log(
						`${method} ${originalUrl} ${res.statusCode} +${ms}ms`,
					);
				},
				error: (err) => {
					const ms = Date.now() - started;
					this.logger.error(
						`${method} ${originalUrl} ${res.statusCode} +${ms}ms`,
						err?.stack,
					);
				},
			}),
		);
	}
}
