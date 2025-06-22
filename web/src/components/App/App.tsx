import { useLayoutEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CallbackPageParams } from 'shared'
import { useWindowDev } from '../../hooks/useWindowDev'
import { ConnectionStatus } from '../../modules/ConnectionStatus'
import { ExternalDraggingOver } from '../../modules/ExternalDraggingOver'
import { SynchronizedLocalStorage } from '../../modules/SynchronizedLocalStorage'
import { SystemTheme } from '../../modules/SystemTheme'
import { WindowScreen } from '../../modules/WindowScreen'
import { webConfig } from '../../modules/webConfig'
import { Toaster } from '../../ui/toaster'
import { TooltipProvider } from '../../ui/tooltip'
import { ErrorBoundary } from '../ErrorBoundary'
import { Run } from '../Run'
import { UiErrorGenerator } from '../UiErrorGenerator'
import { AppHelmet } from './components/AppHelmet'
import { AuthenticatedPage } from './components/AuthenticatedPage'
import { CallbackPage } from './components/CallbackPage'
import { ForgetPasswordPage } from './components/ForgetPasswordPage'
import { IconsPage } from './components/IconsPage'
import { ManageSubscriptionPage } from './components/ManageSubscriptionPage'
import { SignInPage } from './components/SignInPage'
import { SignOutPage } from './components/SignOutPage'
import { SignUpPage } from './components/SignUpPage'
import { TestPage } from './components/TestPage'
import { printWelcomeMessage } from './helpers/printWelcomeMessage'
import { AppTheme } from './modules/AppTheme'
import { ConfirmationDialog } from './modules/ConfirmationDialog'
import { InformationDialog } from './modules/InformationDialog'
import { Localization } from './modules/Localization'
import * as services from './modules/services'
import { synchronizedLocalStorageEntities } from './modules/synchronizedLocalStorageEntities'
import { synchronizedSessionStorageEntities } from './modules/synchronizedSessionStorageEntities'

export function App() {
  useLayoutEffect(printWelcomeMessage, [])

  SynchronizedLocalStorage.useInitialize()

  return (
    <ErrorBoundary>
      <WindowScreen.Provider>
        <SystemTheme.Provider>
          <ExternalDraggingOver.Provider>
            <ConnectionStatus.Provider>
              <AppTheme.Provider>
                <Localization.Provider>
                  <TooltipProvider>
                    <ConfirmationDialog.Provider>
                      <InformationDialog.Provider>
                        <BrowserRouter>
                          <Run>
                            {() => {
                              useWindowDev(
                                () => ({
                                  webConfig,
                                  synchronizedLocalStorageEntities,
                                  synchronizedSessionStorageEntities,
                                  services,
                                }),
                                []
                              )

                              return (
                                <>
                                  <AppHelmet />

                                  <Routes>
                                    <Route path={CallbackPageParams.path} element={<CallbackPage />} />
                                    <Route path="sign-in" element={<SignInPage />} />
                                    <Route path="sign-up" element={<SignUpPage />} />
                                    <Route path="forget-password" element={<ForgetPasswordPage />} />
                                    <Route path="sign-out" element={<SignOutPage />} />
                                    <Route path="manage-subscription/:contactId" element={<ManageSubscriptionPage />} />
                                    {webConfig.environment.target !== 'live' && (
                                      <Route path="icons" element={<IconsPage />} />
                                    )}
                                    {webConfig.environment.target !== 'live' && (
                                      <Route path="test" element={<TestPage />} />
                                    )}
                                    <Route path="*" element={<AuthenticatedPage />} />
                                  </Routes>

                                  <Toaster />
                                </>
                              )
                            }}
                          </Run>
                        </BrowserRouter>
                      </InformationDialog.Provider>
                    </ConfirmationDialog.Provider>
                  </TooltipProvider>
                </Localization.Provider>
              </AppTheme.Provider>
            </ConnectionStatus.Provider>
          </ExternalDraggingOver.Provider>
        </SystemTheme.Provider>
      </WindowScreen.Provider>
      <UiErrorGenerator />
    </ErrorBoundary>
  )
}
