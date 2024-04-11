import { Observable } from 'react-observable-mutations'
import { type Page } from '../domain/DocsModel'
import { uid } from '../../global/domain/UIDGenerator'

export class DocsViewModel extends Observable {
  readonly uid
  lastShownPage: Page | undefined = undefined

  //--------------------------------------
  //  searchFilter
  //--------------------------------------
  private _searchFilter: string = ''
  get searchFilter(): string { return this._searchFilter }
  set searchFilter(value: string) {
    if (this._searchFilter !== value) {
      this._searchFilter = value
      this.mutated()
    }
  }

  constructor() {
    super('DocsViewModel')
    this.uid = uid()
  }
}
