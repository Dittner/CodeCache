import { type UID, uid } from '../../global/domain/UIDGenerator'
import { Observable } from 'react-observable-mutations'
import { DocsContext } from '../DocsContext'

export const UNDEFINED_ID = ''

interface Serializable {
  serialize: () => any
}

export enum LoadStatus {
  PENDING = 'PENDING',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class DirectoryList extends Observable {
  readonly uid: UID

  constructor() {
    super('DirList')
    this.uid = uid()
  }

  //--------------------------------------
  //  dirs
  //--------------------------------------
  private _dirs = Array<Directory>()
  get dirs(): Directory[] {
    return this._dirs
  }

  set dirs(value: Directory[]) {
    if (this._dirs !== value) {
      this._dirs.forEach(d => {
        d.dispose()
      })
      this._dirs = value
      this._dirs.forEach(d => {
        d.subscribe(() => {
          this.mutated()
        })
      })
      this.mutated()
    }
  }

  //--------------------------------------
  //  loadStatus
  //--------------------------------------
  private _loadStatus: LoadStatus = LoadStatus.PENDING
  get loadStatus(): LoadStatus {
    return this._loadStatus
  }

  set loadStatus(value: LoadStatus) {
    if (this._loadStatus !== value) {
      this._loadStatus = value
      this.mutated()
    }
  }

  findDoc(predicate: (doc: Doc) => boolean): Doc | undefined {
    for (const dir of Object.values(this.dirs)) {
      for (const doc of Object.values(dir.docs)) {
        if (predicate(doc)) {
          return doc
        }
      }
    }
    return undefined
  }

  createDir() {
    return new Directory()
  }

  add(dir: Directory) {
    this.dirs.push(dir)
    dir.subscribe(this.mutated)
    this.mutated()
  }

  remove(dir: Directory) {
    const dirInd = this.dirs.findIndex(d => d.uid === dir.uid)
    if (dirInd !== -1) {
      this.dirs.splice(dirInd, 1)
      this.mutated()
      return dir
    }
    return undefined
  }

  removeAll() {
    this.dirs.forEach(d => {
      d.dispose()
    })
    this.dirs = Array<Directory>()
    this.loadStatus = LoadStatus.PENDING
    this.mutated()
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class Directory extends Observable {
  readonly uid = uid()
  isNew: boolean

  constructor(title: string = '', isNew: boolean = true) {
    super('Dir')
    this.isNew = isNew
    this._title = title
  }

  //--------------------------------------
  //  title
  //--------------------------------------
  private _title: string = ''
  get title(): string {
    return this._title
  }

  set title(value: string) {
    if (this._title !== value) {
      this._title = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  dirs
  //--------------------------------------
  private _docs = Array<Doc>()
  get docs(): Doc[] {
    return this._docs
  }

  set docs(value: Doc[]) {
    if (this._docs !== value) {
      this._docs.forEach(d => {
        d.dispose()
      })
      this._docs = value
      this._docs.forEach(d => {
        d._dir = this
      })
      this.mutated()
    }
  }

  //--------------------------------------
  //  loadStatus
  //--------------------------------------
  private _loadStatus: LoadStatus = LoadStatus.PENDING
  get loadStatus(): LoadStatus {
    return this._loadStatus
  }

  set loadStatus(value: LoadStatus) {
    if (this._loadStatus !== value) {
      this._loadStatus = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  isEditing
  //--------------------------------------
  private _isEditing: boolean = false
  get isEditing(): boolean {
    return this._isEditing
  }

  set isEditing(value: boolean) {
    if (this._isEditing !== value) {
      this._isEditing = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  isStoring
  //--------------------------------------
  private _isStoring: boolean = false
  get isStoring(): boolean {
    return this._isStoring
  }

  set isStoring(value: boolean) {
    if (this._isStoring !== value) {
      this._isStoring = value
      this.mutated()
    }
  }

  createDoc() {
    return new Doc()
  }

  add(doc: Doc) {
    if (doc.dir) {
      doc.dir.remove(doc)
    }
    this.docs.push(doc)
    doc._dir = this
    this.mutated()
  }

  remove(doc: Doc): Doc | undefined {
    const docInd = this.docs.findIndex(d => d.uid === doc.uid)
    if (docInd !== -1) {
      this.docs.splice(docInd, 1)
      this.mutated()
      return doc
    }
    return undefined
  }

  dispose() {
    super.dispose()
    this.docs.forEach(d => {
      d.dispose()
    })
    this.docs.length = 0
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export enum DocLoadStatus {
  HEADER_LOADED = 'HEADER_LOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export class Doc extends Observable implements Serializable {
  readonly uid = uid()
  isNew: boolean

  constructor(title: string = '', isNew: boolean = true) {
    super('Doc')
    this.isNew = isNew
    this._title = title
  }

  //--------------------------------------
  //  isEditing
  //--------------------------------------
  private _isEditing: boolean = false
  get isEditing(): boolean {
    return this._isEditing
  }

  set isEditing(value: boolean) {
    if (this._isEditing !== value) {
      this._isEditing = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  isStoring
  //--------------------------------------
  private _isStoring: boolean = false
  get isStoring(): boolean {
    return this._isStoring
  }

  set isStoring(value: boolean) {
    if (this._isStoring !== value) {
      this._isStoring = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  title
  //--------------------------------------
  private _title: string = ''
  get title(): string {
    return this._title
  }

  set title(value: string) {
    if (this._title !== value) {
      this._title = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  loadStatus
  //--------------------------------------
  private _loadStatus: DocLoadStatus = DocLoadStatus.HEADER_LOADED
  get loadStatus(): DocLoadStatus {
    return this._loadStatus
  }

  set loadStatus(value: DocLoadStatus) {
    if (this._loadStatus !== value) {
      this._loadStatus = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  dir
  //--------------------------------------
  _dir: Directory | undefined = undefined
  get dir(): Directory | undefined {
    return this._dir
  }

  //--------------------------------------
  //  pages
  //--------------------------------------
  private _pages: Page[] = []
  get pages(): Page[] {
    return this._pages
  }

  set pages(value: Page[]) {
    this.pages.forEach(p => {
      p.dispose()
    })
    this._pages = value.sort(sortByKey('title'))
    this._pages.forEach(p => p._doc = this)
    this.mutated()
  }

  serialize(): any {
    return {
      title: this.title,
      pages: this.pages.map(p => p.serialize())
    }
  }

  add(page: Page): void {
    page._doc = this
    this.pages.unshift(page)
    this.mutated()
    DocsContext.self.repo.add(this)
  }

  get key(): string {
    return strToHashId(this.title)
  }

  createPage(): Page {
    return new Page(UNDEFINED_ID, 'TITLE')
  }

  remove(page: Page): void {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1) {
      this.pages.splice(pageInd, 1)
      page.dispose()
      this.mutated()
      DocsContext.self.repo.add(this)
    }
  }

  dispose() {
    super.dispose()
    this.pages.forEach(p => {
      p.dispose()
    })
    this._dir = undefined
    this._pages = []
  }
}

const strToHashId = filterCharacters()

function filterCharacters() {
  const cache = new Map<string, string>()
  const notAllowedSymbols = /[^a-z0-9а-я\-_]+/g
  return (str: string) => {
    const key = str
    const value = cache.get(key)
    if (value) return value
    const res = key.toLowerCase().replaceAll(/ |\./g, '-').replace(notAllowedSymbols, '')
    cache.set(key, '#' + res)
    return '#' + res
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class Page extends Observable implements Serializable {
  readonly uid = uid()
  id: string
  isNew: boolean

  constructor(id: string = UNDEFINED_ID, title: string = '') {
    super('Page')
    this.id = id
    this.isNew = id === UNDEFINED_ID
    this._title = title
  }

  //--------------------------------------
  //  isStoring
  //--------------------------------------
  private _isStoring: boolean = false
  get isStoring(): boolean {
    return this._isStoring
  }

  set isStoring(value: boolean) {
    if (this._isStoring !== value) {
      this._isStoring = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  title
  //--------------------------------------
  private _title: string = ''
  get title(): string {
    return this._title
  }

  set title(value: string) {
    if (this._title !== value) {
      this._title = value
      this.mutated()
      this.storeDoc()
    }
  }

  //--------------------------------------
  //  doc
  //--------------------------------------
  _doc: Doc | undefined = undefined
  get doc(): Doc | undefined {
    return this._doc
  }

  //--------------------------------------
  //  blocks
  //--------------------------------------
  private _blocks: PageBlock[] = []
  get blocks(): PageBlock[] {
    return this._blocks
  }

  set blocks(value: PageBlock[]) {
    this._blocks.forEach(b => {
      b.dispose()
    })
    this._blocks = value
    this._blocks.forEach(b => b._page = this)
  }

  private storeDoc() {
    DocsContext.self.repo.add(this.doc)
  }

  serialize(): any {
    return {
      title: this.title,
      blocks: this.blocks.map(b => b.serialize())
    }
  }

  get key(): string {
    return strToHashId(this.title)
  }

  includes(str: string): boolean {
    if (str.length < 2) return true
    const rx = new RegExp(str, 'gi')
    if (this.title.includes(str)) {
      return true
    }
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].text.match(rx)) return true
    }
    return false
  }

  add(block: PageBlock): void {
    block._page = this
    this.blocks.unshift(block)
    this.mutated()
    this.storeDoc()
  }

  createAndAddBlock(atIndex: number = 0): PageBlock {
    const block = new PageBlock('_New Block_')
    block._page = this
    if (atIndex === 0) {
      this.blocks.unshift(block)
    } else if (atIndex === this.blocks.length) {
      this.blocks.push(block)
    } else {
      this._blocks = [...this._blocks.slice(0, atIndex), block, ...this._blocks.slice(atIndex)]
    }
    this.mutated()
    this.storeDoc()
    return block
  }

  moveBlockUp(block: PageBlock): boolean {
    const blockInd = this.blocks.findIndex(b => b.uid === block.uid)
    if (blockInd !== -1 && blockInd !== 0) {
      this.blocks[blockInd] = this.blocks[blockInd - 1]
      this.blocks[blockInd - 1] = block
      this.mutated()
      this.storeDoc()
      return true
    }
    return false
  }

  moveBlockDown(block: PageBlock): boolean {
    const blockInd = this.blocks.findIndex(b => b.uid === block.uid)
    if (blockInd !== -1 && blockInd < this.blocks.length - 1) {
      this.blocks[blockInd] = this.blocks[blockInd + 1]
      this.blocks[blockInd + 1] = block
      this.mutated()
      this.storeDoc()
      return true
    }
    return false
  }

  remove(block: PageBlock): boolean {
    const blockInd = this.blocks.findIndex(b => b.uid === block.uid)
    if (blockInd !== -1) {
      this.blocks.splice(blockInd, 1)
      block.dispose()
      this.mutated()
      this.storeDoc()
      return true
    }
    return false
  }

  dispose() {
    super.dispose()
    this._doc = undefined
    this.blocks.forEach(b => {
      b.dispose()
    })
    this._blocks = []
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class PageBlock extends Observable implements Serializable {
  readonly uid = uid()

  constructor(text: string) {
    super('PageBlock')
    this._text = text
  }

  //--------------------------------------
  //  text
  //--------------------------------------
  private _text: string = ''
  get text(): string {
    return this._text
  }

  set text(value: string) {
    if (this._text !== value) {
      this._text = value
      this.mutated()
      DocsContext.self.repo.add(this.page?.doc)
    }
  }

  //--------------------------------------
  //  page
  //--------------------------------------
  _page: Page | undefined = undefined
  get page(): Page | undefined {
    return this._page
  }

  serialize(): any {
    return { text: this.text }
  }

  dispose() {
    super.dispose()
    this._page = undefined
  }
}

const sortByKey = (key: string) => {
  return (a: any, b: any) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}
