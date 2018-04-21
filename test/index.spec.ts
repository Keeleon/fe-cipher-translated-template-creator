import { expect } from 'chai';
import * as sinon from 'sinon';
import * as AppRootPath from 'app-root-path';
import * as index from '../src/index';

describe('index', () => {
  beforeEach(() => {
  });
  afterEach(() => {
  });

  it('Should work', () => {
    const consoleSpy: sinon.SinonSpy = sinon.spy(console, 'log');
    index.main();
    expect(consoleSpy.calledOnce).to.equal(true);
    expect(consoleSpy.args[0][0]).to.equal('index.ts');
  });
});

