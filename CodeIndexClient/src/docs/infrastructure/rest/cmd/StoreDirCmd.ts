import { type Directory } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { DirDto } from '../Dto'

export class StoreDirCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly dir: Directory

  constructor(api: RestApi, dir: Directory) {
    this.api = api
    this.dir = dir
  }

  run() {
    if (!this.dir.isStoring) {
      this.dir.isStoring = true
      this.store()
    }
  }

  private async store() {
    const method = this.dir.isNew ? 'POST' : 'PUT'
    const requestBody = new DirDto(this.dir.title)
    const [response, _] = await this.api.sendRequest(method, '/dirs', requestBody)

    if (response?.ok) {
      this.dir.isNew = false
    }

    this.dir.isStoring = false
    this.dir.isEditing = false
  }
}
