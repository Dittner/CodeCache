import { type Doc } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'

export class DeleteDocCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly doc: Doc

  constructor(api: RestApi, doc: Doc) {
    this.api = api
    this.doc = doc
  }

  run() {
    if (!this.doc.isStoring && !this.doc.isNew && this.doc.dir) {
      this.doc.isStoring = true
      this.deleteDoc()
    }
  }

  private async deleteDoc() {
    const url = '/dirs/' + this.doc.dir?.title + '/docs/' + this.doc.title
    const [response, _] = await this.api.sendRequest('DELETE', url)

    if (response?.ok) {
      this.doc.dir?.remove(this.doc)
      this.doc.dispose()
    }
  }
}
