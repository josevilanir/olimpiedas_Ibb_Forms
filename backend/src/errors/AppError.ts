export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
