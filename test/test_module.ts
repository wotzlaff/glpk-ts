import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import sinon from 'sinon'
import { Model, loadModule } from '../src/index'
import * as Module from '../src/module'

describe('Module', () => {
  let tmpMod: any
  let tmpModPromise: any
  beforeEach(() => {
    tmpMod = sinon.stub(Module, 'mod').value(undefined)
    tmpModPromise = sinon.stub(Module, 'modPromise').value(undefined)
  })
  afterEach(() => {
    // @ts-ignore
    tmpMod.restore()
    tmpModPromise.restore()
  })

  it('should be loaded before anything else', () => {
    expect(() => {
      new Model()
    }).to.throw(Error, 'wasm module not loaded')
  })

  it('should be loadable from another location', async () => {
    const mod = await loadModule('./node_modules/glpk-wasm/dist/glpk.all.wasm')
    expect(mod).to.have.property('HEAPU8')
    expect(mod).to.have.property('_glp_create_prob')
    expect(mod._glp_create_prob).to.be.a('function')
  })

  it('should throw on invalid location', () => {
    // @ts-ignore
    return expect(loadModule('not-found.wasm')).to.be.rejectedWith(Error)
  })
})
