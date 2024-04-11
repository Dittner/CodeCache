import { type Directory } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { DirDto } from '../Dto'

export class RenameDirCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly dir: Directory
  private readonly newTitle: string

  constructor(api: RestApi, dir: Directory, newTitle: string) {
    this.api = api
    this.dir = dir
    this.newTitle = newTitle
  }

  run() {
    if (!this.dir.isStoring) {
      this.dir.isStoring = true
      this.store()
    }
  }

  private async store() {
    const requestBody = new DirDto(this.newTitle)
    const [response, _] = await this.api.sendRequest('PUT', '/dirs/' + this.dir.title, requestBody)

    if (response?.ok) {
      this.dir.title = this.newTitle
    }

    this.dir.isStoring = false
  }
}
