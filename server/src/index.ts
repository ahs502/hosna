import { prismaClient } from './access/prismaClient'
import { otel } from './modules/otel'
import { broadcastRunner, broadcastRunRunner, workflowRunRunner } from './modules/runners'
import { Server } from './modules/Server'
import { serverConfig } from './modules/serverConfig'
import { Task } from './modules/Task'

void (async (): Promise<void> => {
  try {
    console.log(`${serverConfig.app.name}: Server`)

    // console.log(`Server Config = ${JSON.stringify(serverConfig, null, 2)};`)

    console.log('Initializing...')
    await start()
    console.log('Initialized.')

    void ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(eventType => {
      process.on(eventType, cleanUp)
    })
  } catch (error) {
    console.error(error)
    if (serverConfig.environment.target !== 'local') {
      process.exit(1)
    }
  }

  let cleaningUp = false
  async function cleanUp(): Promise<void> {
    if (cleaningUp) return
    cleaningUp = true

    console.log('Cleaning up...')
    await finish()
    console.log('Cleaned up.') // TODO: This message is not logged when the process is terminated by a signal, why?

    process.exit()
  }
})()

async function start(): Promise<void> {
  if (serverConfig.environment.target !== 'local') {
    await otel.startOpenTelemetry()
  }
  await prismaClient.$connect()
  Task.startAll()
  await broadcastRunner.start()
  await broadcastRunRunner.start()
  await workflowRunRunner.start()
  workflowRunRunner.startListeningToEvents()
  workflowRunRunner.startListeningToContacts()
  workflowRunRunner.startListeningToObjects()
  // More initializations here.
  Server.listen()
}

async function finish(): Promise<void> {
  // More clean-ups here.
  await prismaClient.$disconnect()
  if (serverConfig.environment.target !== 'local') {
    await otel.closeOpenTelemetry()
  }
}
