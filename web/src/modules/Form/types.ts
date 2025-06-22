import { Validation } from '../Validation'
import { Form } from './Form'

export type ValuesOf<F extends Form<any, any>> = F extends Form<infer V, any> ? V : never
export type ResultOf<F extends Form<any, any>> = F extends Form<any, infer R> ? R : never

export type SubmitActionState<Result> = Readonly<
  | (
      | { status: 'doing'; progress: 'pending' | 'preparing' | 'prepared' | 'applying' }
      | { status: 'done'; result: Awaited<Result> }
      | { status: 'failed'; error: string }
    )
  | undefined
>

export type Validations<Values extends {}> = Readonly<Partial<Record<keyof Values, Validation>>>

export type ErrorMessages<Values extends {}> = Readonly<Partial<Record<keyof Values, string>>>
