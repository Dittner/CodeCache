import { type Directory } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'

export class DeleteDirCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly dir: Directory

  constructor(api: RestApi, dir: Directory) {
    this.api = api
    this.dir = dir
  }

  run() {
    console.log('Deleting dir, path:', this.dir)
    if (!this.dir.isStoring && !this.dir.isNew) {
      this.dir.isStoring = true
      this.deleteDir()
    }
  }

  private async deleteDir() {
    const url = '/dirs/' + this.dir.title
    const [response, _] = await this.api.sendRequest('DELETE', url)

    if (response?.ok) {
      this.api.context.dirList.remove(this.dir)
      this.dir.dispose()
    }
  }
}
