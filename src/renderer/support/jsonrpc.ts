import { JSONRPCError, JSONRPCRequest, JSONRPCResult, JSONRPCServer, JSONRPCServerChannel } from 'jsonrpc-bridge'
import { FLAG_DEBUG } from '@fe/support/args'
import { isElectron, nodeRequire } from './env'

class ElectronRendererServerChannel implements JSONRPCServerChannel {
  ipcRenderer: Electron.IpcRenderer

  constructor () {
    this.ipcRenderer = nodeRequire('electron').ipcRenderer
  }

  send (message: Partial<JSONRPCResult<any> & JSONRPCError>): void {
    this.ipcRenderer.send('jsonrpc', message)
  }

  setMessageHandler (callback: (message: JSONRPCRequest<any[]>) => void): void {
    this.ipcRenderer.on('jsonrpc', (_event, message) => {
      callback(message)
    })
  }
}

function initElectronRPCServer (modules: Record<string, any>) {
  const server = new JSONRPCServer(new ElectronRendererServerChannel(), { debug: FLAG_DEBUG })
  for (const [name, _module] of Object.entries(modules)) {
    server.addModule(name, _module)
  }
}

export function init (modules: Record<string, any>) {
  if (isElectron) {
    initElectronRPCServer(modules)
  }
}
