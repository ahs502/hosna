import { webConfig } from '../../../modules/webConfig'

export function getVersion(): string {
  return `${webConfig.app.version} (${
    webConfig.environment.target === 'local'
      ? 'Development'
      : webConfig.environment.target === 'stage'
      ? 'Stage'
      : webConfig.environment.target === 'live'
      ? 'Live'
      : 'Unknown Environment'
  })`
}
