import { expect } from 'chai';
import { GUARDS_METADATA, GUARDS_OPTION_METADATA } from '../../constants';
import { UseGuards } from '../../decorators/core/use-guards.decorator';
import { InvalidDecoratorItemException } from '../../utils/validate-each.util';

class Guard {}

describe('@UseGuards', () => {
  const guards = [Guard, Guard];

  @UseGuards(...guards)
  class Test {}

  class TestWithMethod {
    @UseGuards(...guards)
    public static test() {}
  }

  class Test2 {
    @UseGuards(...guards)
    @UseGuards(...guards)
    public static test() {}
  }

  it('should enhance class with expected guards array', () => {
    const metadata = Reflect.getMetadata(GUARDS_METADATA, Test);
    expect(metadata).to.be.eql(guards);
  });

  it('should enhance method with expected guards array', () => {
    const metadata = Reflect.getMetadata(GUARDS_METADATA, TestWithMethod.test);
    expect(metadata).to.be.eql(guards);
  });

  it('should enhance method with multiple guards array', () => {
    const metadata = Reflect.getMetadata(GUARDS_METADATA, Test2.test);
    expect(metadata).to.be.eql(guards.concat(guards));
  });

  it('should throw exception when object is invalid', () => {
    try {
      UseGuards('test' as any)(() => {});
    } catch (e) {
      expect(e).to.be.instanceof(InvalidDecoratorItemException);
    }
  });
});

describe('@UseGuards with parallel option', () => {
  it('should register parallel option metadata on class when parallel is true', () => {
    @UseGuards(Guard, { parallel: true })
    class TestParallelClass {}
    
    const metadata = Reflect.getMetadata(GUARDS_OPTION_METADATA, TestParallelClass);
    expect(metadata).to.be.eql([true]);
  });

  it('should register parallel option metadata on method when parallel is true', () => {
    class TestParallelMethod {
      @UseGuards(Guard, { parallel: true })
      public static test() {}
    }
    const metadata = Reflect.getMetadata(GUARDS_OPTION_METADATA, TestParallelMethod.test);
    expect(metadata).to.be.eql([true]);
  });

  it('should not register parallel option metadata when option is not provided', () => {
    @UseGuards(Guard)
    class TestNoParallel {}
    
    const metadata = Reflect.getMetadata(GUARDS_OPTION_METADATA, TestNoParallel);
    expect(metadata).to.be.undefined;
  });

  it('should accumulate parallel option metadata for multiple decorators', () => {
    class TestMultipleParallel {
      @UseGuards(Guard, { parallel: true })
      @UseGuards(Guard, { parallel: true })
      public static test() {}
    }
    const metadata = Reflect.getMetadata(GUARDS_OPTION_METADATA, TestMultipleParallel.test);
    expect(metadata).to.be.eql([true, true]);
  });
});
