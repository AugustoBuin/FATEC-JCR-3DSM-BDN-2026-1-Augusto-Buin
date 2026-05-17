import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LogSchemaClass,
  LogSchema,
} from './infrastructure/database/mongoose/log.schema';
import { MongooseLogRepository } from './infrastructure/database/repos/mongoose-log.repository';
import { LOG_REPOSITORY } from './domain/repositories/log-repository.interface';
import { LogService } from './application/log.service';
import { ListLogsUseCase } from './application/use-cases/list-logs.use-case';
import { FindLogUseCase } from './application/use-cases/find-log.use-case';
import { LogsController } from './infrastructure/http/logs.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LogSchemaClass.name, schema: LogSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [
    { provide: LOG_REPOSITORY, useClass: MongooseLogRepository },
    LogService,
    ListLogsUseCase,
    FindLogUseCase,
  ],
  exports: [LogService],
})
export class LogsModule {}
