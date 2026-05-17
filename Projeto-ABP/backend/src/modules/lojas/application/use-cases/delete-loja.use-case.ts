import { Inject, Injectable } from '@nestjs/common';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class DeleteLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    private readonly logService: LogService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) {
      throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');
    }
    const snapshot = {
      name: loja.name,
      city: loja.city,
      address: loja.address ?? null,
      phone: loja.phone ?? null,
    };
    await this.lojaRepository.delete(id);
    await this.logService.record(actorId, 'loja.deleted', id, snapshot, null);
  }
}
