import { Observable } from 'react-observable-mutations'
import { uid, type UID } from '../../../global/domain/UIDGenerator'
import { Page, PageBlock } from '../../domain/DocsModel'
import { DocsContext } from '../../DocsContext'
import { type InputProtocol } from 'react-nocss'

export class EditTools extends Observable {
  readonly uid: UID
  readonly inputProtocol: InputProtocol

  constructor() {
    super('EditTools')
    this.uid = uid()
    this.inputProtocol = { value: '' }
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  //--------------------------------------
  //  editMode
  //--------------------------------------
  private _editMode: boolean = false
  get editMode(): boolean {
    return this._editMode
  }

  set editMode(value: boolean) {
    if (this._editMode !== value) {
      this._editMode = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  selectedPage
  //--------------------------------------
  private _selectedPage: Page | undefined = undefined
  get selectedPage(): Page | undefined {
    return this._selectedPage
  }

  //--------------------------------------
  //  selectedBlock
  //--------------------------------------
  private _selectedBlock: PageBlock | undefined = undefined
  get selectedBlock(): PageBlock | undefined {
    return this._selectedBlock
  }

  select(item: Page | PageBlock | undefined) {
    this.applyEnteredText()
    this._selectedPage = item instanceof Page ? item : undefined
    this._selectedBlock = item instanceof PageBlock ? item : undefined
    this.inputProtocol.value = this.selectedPage?.title ?? this.selectedBlock?.text ?? ''
    this.mutated()
  }

  applyEnteredText() {
    if (this.selectedPage) this.selectedPage.title = this.inputProtocol.value
    else if (this.selectedBlock) this.selectedBlock.text = this.inputProtocol.value
    this.mutated()
  }

  cancelEnteredText() {
    this.inputProtocol.value = this.selectedPage?.title ?? this.selectedBlock?.text ?? ''
    this.mutated()
  }

  private onKeyDown(e: KeyboardEvent) {
    //Ctrl + Shift + B
    if (this.editMode && (this.selectedPage ?? this.selectedBlock) && e.ctrlKey && e.key === 'B' && e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      //console.log('Ctrl + Shift + ', e.keyCode)
      if (this.selectedPage) {
        this.select(this.selectedPage.createAndAddBlock())
      } else if (this.selectedBlock?.page) {
        const curBlockIndex = this.selectedBlock.page.blocks.findIndex(b => b.uid === this.selectedBlock?.uid)
        this.select(this.selectedBlock.page.createAndAddBlock(curBlockIndex + 1))
      }
    }
    //Ctrl + Shift + S
    else if (e.ctrlKey && e.key === 'S' && e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      DocsContext.self.repo.store()
    }
    //Ctrl + Shift + E
    else if (e.ctrlKey && e.key === 'E' && e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      this.toggleEditMode()
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode
  }
}
