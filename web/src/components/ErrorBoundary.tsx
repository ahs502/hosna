import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { ErrorInfo, PropsWithChildren, PureComponent, ReactNode } from 'react'
import { webConfig } from '../modules/webConfig'
import { Button } from '../ui/button'

type Props = PropsWithChildren<{
  renderError?(error: Error, errorInfo: ErrorInfo): ReactNode
  onError?(error: Error, errorInfo: ErrorInfo): void
}>

type State =
  | {
      hasError: false
    }
  | {
      hasError: true
      error: Error
      errorInfo: ErrorInfo
    }

export class ErrorBoundary extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
    this.props.onError && this.props.onError(error, errorInfo)
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) return this.renderError()
    return this.props.children
  }

  renderError(): ReactNode {
    if (!this.state.hasError) return null
    return this.props.renderError?.(this.state.error, this.state.errorInfo) ?? ErrorBoundary.renderErrorDefault()
  }

  static renderErrorDefault(): ReactNode {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center md:p-16">
        <div className="text-primary-500 mb-6 h-24 w-24">
          <ExclamationTriangleIcon className="h-full w-full animate-pulse" />
        </div>
        <h3 className="mb-4 scroll-m-20 text-2xl font-semibold tracking-tight">Oops! Something unexpected happened</h3>
        <p className="mb-6 max-w-md text-gray-600">
          We've encountered an issue while trying to display this content. Our team has been notified and is working to
          fix it.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
            asChild
          >
            <a href={webConfig.urls.web}>Refresh page</a>
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 transition-colors"
          >
            Go back
          </Button>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          If the problem persists, please contact our support team for assistance.
        </div>
      </div>
    )
  }
}
