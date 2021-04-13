import glpkWasm, { GLPKModule } from 'glpk-wasm'

export const modPromise: Promise<GLPKModule> = glpkWasm()
export let mod: GLPKModule

export async function loadModule(): Promise<GLPKModule> {
  mod = await modPromise
  return mod
}

export type RawModel = ReturnType<GLPKModule['_glp_create_prob']>
