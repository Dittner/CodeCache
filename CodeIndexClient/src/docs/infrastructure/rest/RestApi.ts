import { type DocsContext } from '../../DocsContext'
import { LoadAllDirsCmd } from './cmd/LoadAllDirsCmd'
import { StoreDirCmd } from './cmd/StoreDirCmd'
import { type RequestBody } from './Dto'
import { StoreDocCmd } from './cmd/StoreDocCmd'
import { LoadDocPagesCmd } from './cmd/LoadDocPagesCmd'
import { DeleteDocCmd } from './cmd/DeleteDocCmd'
import { DeleteDirCmd } from './cmd/DeleteDirCmd'

import { type Directory, type Doc } from '../../domain/DocsModel'
import { GlobalContext } from '../../../global/GlobalContext'
import { RenameDirCmd } from './cmd/RenameDirCmd'
import { RenameDocCmd } from './cmd/RenameDocCmd'
import { Observable } from 'react-observable-mutations'
import { CheckServerCmd } from './cmd/CheckServerCmd'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class RestApi extends Observable {
  readonly baseUrl: string
  readonly context: DocsContext
  headers: any = { 'Content-Type': 'application/json' }

  constructor(context: DocsContext) {
    super('RestApi')
    this.baseUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.context = context
    this.isServerRunning = false
    this.checkServer()
  }

  //--------------------------------------
  //  isServerRunning
  //--------------------------------------
  private _isServerRunning: boolean = false
  get isServerRunning(): boolean {
    return this._isServerRunning
  }

  set isServerRunning(value: boolean) {
    if (this._isServerRunning !== value) {
      this._isServerRunning = value
      this.mutated()
    }
  }

  checkServer() {
    const cmd = new CheckServerCmd(this)
    cmd.run()
  }

  //--------------------------------------
  //  dir
  //--------------------------------------

  loadAllDirs() {
    const cmd = new LoadAllDirsCmd(this, this.context.dirList)
    cmd.run()
  }

  storeDir(dir: Directory) {
    const cmd = new StoreDirCmd(this, dir)
    cmd.run()
  }

  renameDir(dir: Directory, newTitle: string) {
    const cmd = new RenameDirCmd(this, dir, newTitle)
    cmd.run()
  }

  deleteDir(dir: Directory) {
    const cmd = new DeleteDirCmd(this, dir)
    cmd.run()
  }

  //--------------------------------------
  //  doc
  //--------------------------------------

  storeDoc(doc: Doc, dir: Directory) {
    const cmd = new StoreDocCmd(this, doc, dir)
    cmd.run()
  }

  renameDoc(doc: Doc, newTitle: string) {
    const cmd = new RenameDocCmd(this, doc, newTitle)
    cmd.run()
  }

  deleteDoc(doc: Doc) {
    const cmd = new DeleteDocCmd(this, doc)
    cmd.run()
  }

  loadDocPages(doc: Doc) {
    const cmd = new LoadDocPagesCmd(this, doc)
    cmd.run()
  }

  //--------------------------------------
  //  sendRequest
  //--------------------------------------

  async sendRequest(method: HttpMethod, path: string, body: RequestBody | null = null, handleErrors: boolean = true): Promise<[Response | null, any | null]> {
    try {
      console.log('===>', method, ':', path)
      const response = await fetch(this.baseUrl + path, {
        method,
        headers: this.headers,
        credentials: 'same-origin',
        body: body?.serialize()
      })

      console.log('<===', response.status, method, path)

      if (response.ok) {
        if (response.status === 204) {
          return [response, null]
        } else {
          try {
            const body = await response.json()
            return [response, body]
          } catch (_) {
          }
        }
      } else if (handleErrors) {
        const details = await this.getResponseDetails(response) ?? ''

        if (response.status === 401 || response.status === 403) {
          console.warn('Authorization is required!')
        } else if (response.status >= 500) {
          GlobalContext.self.app.errorMsg = response.status + ': Internal server error'
        } else if (response.status === 400) {
          GlobalContext.self.app.errorMsg = response.status + ': ' + details ?? 'Bad Request'
        } else {
          GlobalContext.self.app.errorMsg = response.status + ': ' + details ?? 'Unknown error'
        }
      }
      return [response, null]
    } catch (e: any) {
      const msg = 'Unable to ' + method + ' resource: ' + this.baseUrl + path
      //GlobalContext.self.app.errorMsg = msg
      console.log(msg, '. Details:', e)
      return [null, null]
    }
  }

  async getResponseDetails(response: Response) {
    try {
      const details = await response.text()
      console.log('Details:', details)
      return details
    } catch (_) {}
    return null
  }

  //--------------------------------------
  //  id
  //--------------------------------------
  private fakeId = 100
  generateFakeId(): string {
    return (this.fakeId++).toString()
  }
}
