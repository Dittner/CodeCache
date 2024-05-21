import { type Doc, DocLoadStatus, Page, PageBlock } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { type DocDto } from '../Dto'

export class LoadDocPagesCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly doc: Doc

  constructor(api: RestApi, doc: Doc) {
    this.api = api
    this.doc = doc
  }

  run() {
    if (this.doc.loadStatus === DocLoadStatus.HEADER_LOADED && !this.doc.isNew) {
      this.doc.loadStatus = DocLoadStatus.LOADING
      console.log('LoadDocPagesCmd running')
      this.loadDocPages().then()
    }
  }

  private async loadDocPages() {
    const path = '/dirs/' + this.doc.dir?.title + '/docs/' + this.doc.title
    const [response, body] = await this.api.sendRequest('GET', path)
    if (response?.ok) {
      console.log('LoadDocPagesCmd: body:', body)
      const dto = body as DocDto
      if (dto) {
        this.doc.pages = dto.pages.map(dto => {
          const p = new Page(dto.title, dto.title)
          p.blocks = dto.blocks.map(b => new PageBlock(b))
          return p
        })
        this.doc.loadStatus = DocLoadStatus.LOADED
      }
    }
    console.log('LoadDocPagesCmd is failed, path:', path)
    this.doc.loadStatus = DocLoadStatus.ERROR
  }
}
