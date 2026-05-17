import { Inject, Injectable } from '@nestjs/common';
import { LojaEntity } from '../../domain/entities/loja.entity';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { CreateLojaDto } from '../dtos/create-loja.dto';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class CreateLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    private readonly logService: LogService,
  ) {}

  async execute(dto: CreateLojaDto, actorId: string): Promise<LojaEntity> {
    const loja = LojaEntity.create(dto);
    await this.lojaRepository.save(loja);
    await this.logService.record(actorId, 'loja.created', loja.id, null, {
      name: loja.name,
      city: loja.city,
      address: loja.address ?? null,
      phone: loja.phone ?? null,
    });
    return loja;
  }
}
