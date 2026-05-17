import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeSchemaClass, TimeSchema } from './infrastructure/database/mongoose/time.schema';
import { MongooseTimeRepository } from './infrastructure/database/repos/mongoose-time.repository';
import { TIME_REPOSITORY } from './domain/repositories/time-repository.interface';
import { CreateTimeUseCase } from './application/use-cases/create-time.use-case';
import { FindTimeUseCase } from './application/use-cases/find-time.use-case';
import { ListTimesUseCase } from './application/use-cases/list-times.use-case';
import { UpdateTimeUseCase } from './application/use-cases/update-time.use-case';
import { DeleteTimeUseCase } from './application/use-cases/delete-time.use-case';
import { TimesController } from './infrastructure/http/times.controller';
import { LojasModule } from '@/modules/lojas/lojas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeSchemaClass.name, schema: TimeSchema },
    ]),
    LojasModule,
  ],
  controllers: [TimesController],
  providers: [
    { provide: TIME_REPOSITORY, useClass: MongooseTimeRepository },
    CreateTimeUseCase,
    FindTimeUseCase,
    ListTimesUseCase,
    UpdateTimeUseCase,
    DeleteTimeUseCase,
  ],
  exports: [TIME_REPOSITORY],
})
export class TimesModule {}
