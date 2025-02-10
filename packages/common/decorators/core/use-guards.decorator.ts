import { CanActivate } from '@nestjs/common';
import { isFunction, isObject } from '../../utils/shared.utils';
import { validateEach } from '../../utils/validate-each.util';
import { extendArrayMetadata } from '../../utils/extend-metadata.util';
import { GUARDS_METADATA, GUARDS_OPTION_METADATA } from '../../constants';

export interface UseGuardsOptions {
  parallel?: boolean;
}

export function UseGuards(
  ...args: (CanActivate | Function | UseGuardsOptions)[]
): MethodDecorator & ClassDecorator {
  let options: UseGuardsOptions = { parallel: false };

  if (
    args.length > 0 &&
    isObject(args[args.length - 1]) &&
    ('parallel' in args[args.length - 1])
  ) {
    options = args.pop() as UseGuardsOptions;
  }
  const guards = args as (CanActivate | Function)[];

  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    const isGuardValid = <T extends Function | Record<string, any>>(guard: T) =>
      guard && (isFunction(guard) || isFunction(guard.canActivate));

    if (descriptor) {
      validateEach(
        target.constructor,
        guards,
        isGuardValid,
        '@UseGuards',
        'guard',
      );
      extendArrayMetadata(GUARDS_METADATA, guards, descriptor.value);
      if(options.parallel) extendArrayMetadata(GUARDS_OPTION_METADATA, [options.parallel], target);
      return descriptor;
    }
    validateEach(target, guards, isGuardValid, '@UseGuards', 'guard');
    extendArrayMetadata(GUARDS_METADATA, guards, target);
    if(options.parallel) extendArrayMetadata(GUARDS_OPTION_METADATA, [options.parallel], target);
    return target;
  };
}
