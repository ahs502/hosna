import { Contexts } from './Contexts'

export type ContextValues<C extends Contexts<any>> = C extends Contexts<infer V> ? V : never
