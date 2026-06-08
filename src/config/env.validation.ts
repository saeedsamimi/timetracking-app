import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('timetracking'),
  HOST: Joi.string().default('0.0.0.0'),
  HTTP_PORT: Joi.number().default(3005),
  GRPC_PORT: Joi.number().default(5005),
});
