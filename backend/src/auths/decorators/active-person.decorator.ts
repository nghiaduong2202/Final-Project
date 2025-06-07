import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActivePersonData } from '../interfaces/active-person-data.interface';

export const ActivePerson = createParamDecorator(
  (field: keyof ActivePersonData, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ people: ActivePersonData }>();

    const person: ActivePersonData = request['person'] as ActivePersonData;

    return field ? person?.[field] : person;
  },
);
