import glpkWasm, { GLPKModule } from 'glpk-wasm'

export let modPromise: Promise<GLPKModule>
export let mod: GLPKModule

export async function loadModule(wasmLocation?: string): Promise<GLPKModule> {
  if (modPromise === undefined) {
    modPromise =
      wasmLocation === undefined
        ? glpkWasm()
        : // @ts-ignore
          glpkWasm({
            locateFile() {
              return wasmLocation
            },
          })
  }
  mod = await modPromise
  return mod
}

export type RawModel = ReturnType<GLPKModule['_glp_create_prob']>
