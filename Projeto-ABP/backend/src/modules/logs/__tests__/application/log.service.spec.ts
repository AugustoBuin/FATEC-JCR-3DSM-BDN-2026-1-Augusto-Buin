import { LogService } from '../../application/log.service';
import { ILogRepository } from '../../domain/repositories/log-repository.interface';
import { LogEntity } from '../../domain/entities/log.entity';

const makeMockRepo = (): jest.Mocked<ILogRepository> => ({
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
});

const USER_ID = '10000000-0000-4000-8000-000000000001';
const TARGET_ID = '20000000-0000-4000-8000-000000000002';

describe('LogService', () => {
  it('creates a LogEntity and persists it via the repository', async () => {
    const repo = makeMockRepo();
    repo.save.mockResolvedValue(undefined);

    const service = new LogService(repo);
    await service.record(USER_ID, 'lead.created', TARGET_ID, null, {
      subject: 'Test',
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = (repo.save as jest.Mock).mock.calls[0][0] as LogEntity;
    expect(saved).toBeInstanceOf(LogEntity);
    expect(saved.userId).toBe(USER_ID);
    expect(saved.eventType).toBe('lead.created');
    expect(saved.targetId).toBe(TARGET_ID);
    expect(saved.before).toBeNull();
    expect(saved.after).toEqual({ subject: 'Test' });
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it('passes before/after snapshots through to the repository', async () => {
    const repo = makeMockRepo();
    repo.save.mockResolvedValue(undefined);

    const service = new LogService(repo);
    const before = { name: 'Antigo' };
    const after = { name: 'Novo' };
    await service.record(USER_ID, 'cliente.updated', TARGET_ID, before, after);

    const saved = (repo.save as jest.Mock).mock.calls[0][0] as LogEntity;
    expect(saved.before).toEqual(before);
    expect(saved.after).toEqual(after);
  });
});
