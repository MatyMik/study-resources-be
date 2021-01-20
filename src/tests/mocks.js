import { BaseEntity } from 'typeorm';

function mockRepositoryProvider<T extends BaseEntity>(entity: Type<T>): ValueProvider {
    const mkFailFn = (name: string) => () => {
        throw new Error(`unexpected/unmocked call to Repository<${entity.name}>.${name}`);
    };
    const mockRepo: Partial<Repository<T>> = [
        'find',
        'findOne',
        'findOneOrFail',
        'save',
        'delete',
        'remove',
    ].reduce(
        (acc, fnName) => {
            acc[fnName] = mkFailFn(fnName);
            return acc;
        },
        {},
    );
    return {
        provide: getRepositoryToken(entity),
        useValue: mockRepo,
    };
}