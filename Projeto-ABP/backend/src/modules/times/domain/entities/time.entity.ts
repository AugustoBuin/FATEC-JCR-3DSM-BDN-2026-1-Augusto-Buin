import { Entity } from '@/shared/core/entity';

interface TimeProps {
  name: string;
  lojaId: string;
}

export class TimeEntity extends Entity<TimeProps> {
  static create(props: TimeProps): TimeEntity {
    return new TimeEntity(props);
  }

  static restore(props: TimeProps, id: string): TimeEntity {
    return new TimeEntity(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get lojaId(): string {
    return this.props.lojaId;
  }

  update(fields: Partial<Pick<TimeProps, 'name'>>): void {
    this.props = { ...this.props, ...fields };
  }
}
