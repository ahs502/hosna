import { typed } from 'shared'
import { environment } from './environment'

const areLogsAllowed = environment.mode === 'development' || environment.target === 'stage'

export const development = {
  ...typed<{
    readonly connectToLiveServer?: boolean
  }>({
    // connectToLiveServer: true, //!Not to be committed! Just make sure it'll remain commented before committing.
  }),

  logs: {
    webSocket: areLogsAllowed && true,
  },
} as const
