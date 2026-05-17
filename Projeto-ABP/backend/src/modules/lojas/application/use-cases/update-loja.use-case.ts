import { Inject, Injectable } from '@nestjs/common';
import { LojaEntity } from '../../domain/entities/loja.entity';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { UpdateLojaDto } from '../dtos/update-loja.dto';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class UpdateLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateLojaDto,
    actorId: string,
  ): Promise<LojaEntity> {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) {
      throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');
    }
    const before = {
      name: loja.name,
      city: loja.city,
      address: loja.address ?? null,
      phone: loja.phone ?? null,
    };
    loja.update(dto);
    await this.lojaRepository.save(loja);
    await this.logService.record(actorId, 'loja.updated', loja.id, before, {
      name: loja.name,
      city: loja.city,
      address: loja.address ?? null,
      phone: loja.phone ?? null,
    });
    return loja;
  }
}
