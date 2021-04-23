import { expect } from 'chai'
import sinon from 'sinon'
import { Model, loadModule } from '../src/index'
import * as Module from '../src/module'

describe('Module', () => {
  let tmpMod: any
  beforeEach(() => {
    tmpMod = sinon.stub(Module, 'mod').value(undefined)
  })
  afterEach(() => {
    // @ts-ignore
    tmpMod.restore()
  })

  it('should be loaded before anything else', () => {
    expect(() => {
      new Model()
    }).to.throw(Error, 'wasm module not loaded')
  })

  it('should be loadable from another location', async () => {
    const mod = await loadModule()
    expect(mod).to.have.property('HEAPU8')
    expect(mod).to.have.property('_glp_create_prob')
    expect(mod._glp_create_prob).to.be.a('function')
  })
})
