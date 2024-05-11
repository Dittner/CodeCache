import { type Directory, type Doc } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { DirDto, DocDto, PageDto } from '../Dto'

export class RenameDocCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly doc: Doc
  private readonly newTitle: string

  constructor(api: RestApi, doc: Doc, newTitle: string) {
    this.api = api
    this.doc = doc
    this.newTitle = newTitle
  }

  run() {
    if (!this.doc.isStoring) {
      this.doc.isStoring = true
      this.store().then()
    }
  }

  private async store() {
    const pagesDto = this.doc.pages.map(p => new PageDto(p.title, p.blocks.map(b => b.text)))
    const requestBody = new DocDto(this.newTitle, pagesDto)
    const path = '/dirs/' + this.doc.dir?.title + '/docs/' + this.doc.title
    const [response, _] = await this.api.sendRequest('PUT', path, requestBody)

    if (response?.ok) {
      this.doc.title = this.newTitle
    }

    this.doc.isStoring = false
  }
}
