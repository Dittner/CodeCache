import { Directory, type DirectoryList, Doc, LoadStatus } from '../../../domain/DocsModel'
import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { Dir } from 'fs'

export class LoadAllDirsCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly dirList: DirectoryList

  constructor(api: RestApi, dirList: DirectoryList) {
    this.api = api
    this.dirList = dirList
  }

  run() {
    if (this.dirList.loadStatus === LoadStatus.PENDING) {
      this.dirList.loadStatus = LoadStatus.LOADING
      console.log('LoadAllDirsCmd running')
      this.loadDirs()
    }
  }

  private async loadDirs() {
    const [response, body] = await this.api.sendRequest('GET', '/dirs')
    if (response?.ok) {
      const dict: Record<string, string[]> = body
      console.log(dict)
      const dirs = []
      for (const [dirTitle, docs] of Object.entries(dict)) {
        const dir = new Directory(dirTitle, false)
        dir.docs = docs.map(docTitle => new Doc(docTitle, false))
        dirs.push(dir)
      }
      this.dirList.dirs = dirs

      this.api.context.editTools.editMode = this.dirList.loadStatus === LoadStatus.LOADED && this.dirList.dirs.length === 0

      this.dirList.loadStatus = LoadStatus.LOADED
    } else {
      this.dirList.loadStatus = LoadStatus.ERROR
    }
  }
}
