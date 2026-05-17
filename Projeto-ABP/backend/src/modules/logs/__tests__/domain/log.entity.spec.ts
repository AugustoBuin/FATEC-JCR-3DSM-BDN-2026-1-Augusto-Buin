import { LogEntity } from '../../domain/entities/log.entity';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const TARGET_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const LOG_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('LogEntity', () => {
  describe('create()', () => {
    it('sets createdAt to now', () => {
      const before = new Date();
      const log = LogEntity.create({
        userId: USER_ID,
        eventType: 'lead.created',
        targetId: TARGET_ID,
        before: null,
        after: { name: 'Test' },
      });
      const after = new Date();

      expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(log.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('stores all provided props', () => {
      const log = LogEntity.create({
        userId: USER_ID,
        eventType: 'cliente.updated',
        targetId: TARGET_ID,
        before: { name: 'Old' },
        after: { name: 'New' },
      });

      expect(log.userId).toBe(USER_ID);
      expect(log.eventType).toBe('cliente.updated');
      expect(log.targetId).toBe(TARGET_ID);
      expect(log.before).toEqual({ name: 'Old' });
      expect(log.after).toEqual({ name: 'New' });
    });

    it('generates a unique id', () => {
      const a = LogEntity.create({
        userId: USER_ID,
        eventType: 'lead.deleted',
        targetId: TARGET_ID,
        before: null,
        after: null,
      });
      const b = LogEntity.create({
        userId: USER_ID,
        eventType: 'lead.deleted',
        targetId: TARGET_ID,
        before: null,
        after: null,
      });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('restore()', () => {
    it('round-trips all fields', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const log = LogEntity.restore(
        {
          userId: USER_ID,
          eventType: 'usuario.created',
          targetId: TARGET_ID,
          before: null,
          after: { role: 'admin' },
          createdAt,
        },
        LOG_ID,
      );

      expect(log.id).toBe(LOG_ID);
      expect(log.userId).toBe(USER_ID);
      expect(log.eventType).toBe('usuario.created');
      expect(log.createdAt).toBe(createdAt);
      expect(log.after).toEqual({ role: 'admin' });
    });
  });
});
