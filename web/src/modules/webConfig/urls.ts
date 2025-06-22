import { app } from './app'
import { development } from './development'
import { environment } from './environment'

const liveServer = environment.target === 'live' || development.connectToLiveServer
const localTarget = environment.target === 'local' && !liveServer
const subdomainPostfix = environment.target === 'stage' && !liveServer ? '-stage' : ''

const serverRest = localTarget ? 'http://localhost:7002' : `https://api${subdomainPostfix}.${app.domain}`
const serverWs = localTarget ? 'ws://localhost:7002' : `wss://api${subdomainPostfix}.${app.domain}`

export const urls = {
  web:
    environment.target === 'local'
      ? 'http://localhost:7001'
      : environment.target === 'stage'
        ? `https://app-stage.${app.domain}`
        : environment.target === 'live'
          ? `https://app.${app.domain}`
          : ('' as never), // TODO: Shouldn't we simply extract it from the current location?! Or, at least validate it with the current location.

  api: {
    private: {
      rest: `${serverRest}/private`,
      ws: `${serverWs}/private`,
    },
    public: {
      rest: `${serverRest}/v1`,
      ws: `${serverWs}/v1`,
    },
  },

  landing: {
    index: `https://${app.domain}/`,
    privacy: `https://${app.domain}/legal/policy`,
    terms: `https://${app.domain}/legal/terms`,
    copilot: `https://${app.domain}/legal/copilot`,
    pricing: `https://${app.domain}/pricing`,
  },
  docs: {
    index: `https://${app.domain}/`, // TODO: The actual link here.
    help: `https://${app.domain}/`, // TODO: The actual link here.
    domains: `https://${app.domain}/`, // TODO: The actual link here.
    senders: `https://${app.domain}/`, // TODO: The actual link here.
    segments: `https://${app.domain}/`, // TODO: The actual link here.
    brandKits: `https://${app.domain}/`, // TODO: The actual link here.
    contacts: `https://${app.domain}/`, // TODO: The actual link here.
    objects: `https://${app.domain}/`, // TODO: The actual link here.
    events: `https://${app.domain}/`, // TODO: The actual link here.
    workflows: `https://${app.domain}/`, // TODO: The actual link here.
    broadcasts: `https://${app.domain}/`, // TODO: The actual link here.
    emailEditors: {
      index: `https://${app.domain}/`, // TODO: The actual link here.
      marketing: `https://${app.domain}/`, // TODO: The actual link here.
      transactional: `https://${app.domain}/`, // TODO: The actual link here.
      mjmlRich: `https://${app.domain}/`, // TODO: The actual link here.
      mjmlRaw: `https://${app.domain}/`, // TODO: The actual link here.
      htmlRich: `https://${app.domain}/`, // TODO: The actual link here.
      htmlRaw: `https://${app.domain}/`, // TODO: The actual link here.
    },
    forms: `https://${app.domain}/`, // TODO: The actual link here.
    api: `https://${app.domain}/`, // TODO: The actual link here.
  },

  changelog: `https://${app.domain}/`, // TODO: The actual link here.

  integrations: {
    zapier: {
      connect: 'https://zapier.com/', // TODO: The actual link here.
      docs: `https://${app.domain}/`, // TODO: The actual link here.
    },
    segment: {
      connect: 'https://segment.com/', // TODO: The actual link here.
      docs: `https://${app.domain}/`, // TODO: The actual link here.
    },
  },
} as const
