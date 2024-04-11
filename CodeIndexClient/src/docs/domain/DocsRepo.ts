import { Observable } from 'react-observable-mutations'
import { uid, type UID } from '../../global/domain/UIDGenerator'
import { type Doc } from './DocsModel'
import { type RestApi } from '../infrastructure/rest/RestApi'

export class DocsRepo extends Observable {
  readonly uid: UID
  private readonly restApi: RestApi
  private readonly pendingDocsToStore: Doc[]

  get isStorePending(): boolean {
    return this.pendingDocsToStore.length > 0
  }

  constructor(restApi: RestApi) {
    super('DocsRepo')
    this.uid = uid()
    this.restApi = restApi
    this.pendingDocsToStore = []
  }

  add(doc: Doc | undefined) {
    if (doc) {
      this.pendingDocsToStore.push(doc)
      if (this.pendingDocsToStore.length === 1) {
        this.mutated()
      }
    }
  }

  store() {
    if (this.pendingDocsToStore.length > 0) {
      const hash = new Set<UID>()
      for (const d of this.pendingDocsToStore) {
        if (hash.has(d.uid)) continue
        hash.add(d.uid)
        if (d.dir) {
          this.restApi.storeDoc(d, d.dir)
        }
      }
      this.pendingDocsToStore.length = 0
      this.mutated()
    }
  }
}
