import { type Directory, type Doc, PageBlock } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { DocDto, PageDto } from '../Dto'

export class StoreDocCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly doc: Doc
  private readonly dir: Directory

  constructor(api: RestApi, doc: Doc, dir: Directory) {
    this.api = api
    this.doc = doc
    this.dir = dir
  }

  run() {
    if (!this.doc.isStoring) {
      this.doc.isStoring = true
      this.store().then()
    }
  }

  private async store() {
    const method = this.doc.isNew ? 'POST' : 'PUT'
    const url = this.doc.isNew ? '/dirs/' + this.dir.title + '/docs' : '/dirs/' + this.dir.title + '/docs/' + this.doc.title
    const pagesDto = this.doc.pages.map(p => new PageDto(p.title, p.blocks.map(b => b.text)))
    const requestBody = new DocDto(this.doc.title, pagesDto)
    const [response, _] = await this.api.sendRequest(method, url, requestBody)

    if (response?.ok) {
      if (this.doc.isNew) {
        this.doc.isNew = false
        this.dir.add(this.doc)
      }
    }

    this.doc.isStoring = false
  }
}
