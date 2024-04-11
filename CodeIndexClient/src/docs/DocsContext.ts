import { uid } from '../global/domain/UIDGenerator'
import { useDocsContext } from '../App'
import { observe } from 'react-observable-mutations'
import { type GlobalTheme, themeManager } from '../global/application/ThemeManager'
import { RestApi } from './infrastructure/rest/RestApi'
import { DirectoryList } from './domain/DocsModel'
import { DocsViewModel } from './ui/DocsViewModel'
import { DocsRepo } from './domain/DocsRepo'
import { EditTools } from './ui/controller/EditTools'

export class DocsContext {
  readonly uid = uid()
  readonly editTools: EditTools
  readonly dirList: DirectoryList
  readonly vm: DocsViewModel
  readonly repo: DocsRepo
  readonly restApi: RestApi

  static self: DocsContext

  static init() {
    if (DocsContext.self === undefined) {
      DocsContext.self = new DocsContext()
    }
    return DocsContext.self
  }

  get theme(): GlobalTheme { return themeManager.theme }

  private constructor() {
    this.restApi = new RestApi(this)
    this.repo = new DocsRepo(this.restApi)
    this.editTools = new EditTools()
    this.vm = new DocsViewModel()
    this.dirList = new DirectoryList()
  }
}

export function observeVM(): DocsViewModel {
  return observe(useDocsContext().vm)
}

export function observeEditTools(): EditTools {
  return observe(useDocsContext().editTools)
}

export function observeDirList(): DirectoryList {
  return observe(useDocsContext().dirList)
}
