import { Observable } from 'react-observable-mutations'
import { uid } from '../../global/domain/UIDGenerator'
import { type InputProtocol } from 'react-nocss'

export interface NumberProtocol {
  value: number
}

export class FormatterVM extends Observable {
  readonly uid
  inputProtocol: InputProtocol = { value: '' }

  //--------------------------------------
  //  removeDuplicateSpaces
  //--------------------------------------
  private _removeDuplicateSpaces: boolean = true
  get removeDuplicateSpaces(): boolean {
    return this._removeDuplicateSpaces
  }

  set removeDuplicateSpaces(value: boolean) {
    if (this._removeDuplicateSpaces !== value) {
      this._removeDuplicateSpaces = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  removeHyphenAndSpace
  //--------------------------------------
  private _removeHyphenAndSpace: boolean = true
  get removeHyphenAndSpace(): boolean {
    return this._removeHyphenAndSpace
  }

  set removeHyphenAndSpace(value: boolean) {
    if (this._removeHyphenAndSpace !== value) {
      this._removeHyphenAndSpace = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  replaceHyphenWithDash
  //--------------------------------------
  private _replaceHyphenWithDash: boolean = true
  get replaceHyphenWithDash(): boolean {
    return this._replaceHyphenWithDash
  }

  set replaceHyphenWithDash(value: boolean) {
    if (this._replaceHyphenWithDash !== value) {
      this._replaceHyphenWithDash = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  maxEmptyLines
  //--------------------------------------
  readonly maxEmptyLines: NumberProtocol = { value: 2 }

  constructor() {
    super('FormatterVM')
    this.uid = uid()
  }

  startFormatting() {
    if (!this.inputProtocol.value) return
    let res = this.inputProtocol.value

    if (this.removeDuplicateSpaces) {
      //remove new lines and spaces at the beginning of the text
      res = res.replace(/^[\n| ]+/, '')
      //remove new lines and spaces at the end of the text
      res = res.replace(/[\n| ]+$/, '')
      //remove spaces at the beginning of line
      res = res.replace(/\n +/g, '\n')
      res = res.replace(/ +/g, ' ')
      res = res.replace(/ +,/g, ',')
    }

    if (this.removeHyphenAndSpace) {
      res = res.replace(/[^ ]- /g, '')
    }

    if (this.replaceHyphenWithDash) {
      res = res.replace(/ - /g, ' — ')
      res = res.replace(/ – /g, ' — ')
    }

    const max = this.maxEmptyLines.value
    res = res.replace(new RegExp(`\n{${max},}`, 'g'), '\n'.repeat(max))

    if (this.inputProtocol.value !== res) {
      this.inputProtocol.value = res
      this.mutated()
    }
  }
}
