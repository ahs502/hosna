import { app } from './app'
import { development } from './development'
import { device } from './device'
import { environment } from './environment'
import { keyboard } from './keyboard'
import { temporary } from './temporary'
import { urls } from './urls'

export const webConfig = {
  app,
  environment,
  device,
  keyboard,
  development,
  urls,
  temporary,
} as const
