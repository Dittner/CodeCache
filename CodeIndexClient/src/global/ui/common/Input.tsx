import { useEffect, useRef, useState } from 'react'
import { calcSpaceBefore, formatCode, formatIfTextIsCode, parseLang } from './String++'
import { useWindowSize } from '../../../App'
import * as React from 'react'
import { type GlobalTheme, themeManager } from '../../application/ThemeManager'
import {
  Label,
  TextInput,
  type TextInputProps,
  VStack, buildClassName, type StylableComponentProps, type TextAreaProps
} from 'react-nocss'

/*
*
* InputForm
*
* */

export interface InputFormProps extends TextInputProps {
  title?: string
  titleSize?: string
  titleColor?: string
}

const defInputFormProps = (theme: GlobalTheme): any => {
  return {
    width: '100%',
    height: '30px',
    caretColor: theme.text,
    textColor: theme.text,
    bgColor: theme.text + '05',
    titleSize: '0.9rem',
    titleColor: theme.header,
    fontSize: '1rem',
    padding: '10px',
    autoCorrect: 'off',
    autoComplete: 'off',
    border: 'none',
    borderBottom: ['1px', 'solid', theme.violet + '50'],
    focusState: (state: StylableComponentProps) => {
      state.bgColor = theme.violet + '20'
    }
  }
}

export const InputForm = (props: InputFormProps) => {
  console.log('new InputForm')
  const style = { ...defInputFormProps(themeManager.theme), ...props }

  return (
    <VStack halign="left" valign="top" gap="0"
            width={style.width}>

      {style.title &&
        <Label fontSize={style.titleSize}
               width='100%'
               text={style.title}
               textColor={style.titleColor}
               paddingLeft="10px"/>
      }

      <TextInput {...style}/>
    </VStack>
  )
}

/*
*
* TextEditor
*
* */

class TextEditorController {
  static scrollToCursor(ta: HTMLTextAreaElement) {
    ta.blur()
    ta.focus()
  }

  static format(ta: HTMLTextAreaElement) {
    const value = ta.value

    try {
      const formattedCode = formatIfTextIsCode(value)
      if (formattedCode === value) return

      const scrollY = window.scrollY
      let selectionRow = value.slice(0, ta.selectionStart).split('\n').length
      let selectionStart = ta.selectionStart
      if (selectionRow > 0) {
        for (let i = 0; i < formattedCode.length; i++) {
          if (formattedCode.at(i) === '\n') {
            selectionRow--
            if (selectionRow === 0) {
              selectionStart = i
            }
          }
        }
      }

      ta.setSelectionRange(0, value.length)
      document.execCommand('insertText', false, formattedCode)
      ta.setSelectionRange(selectionStart, selectionStart)
      window.scrollTo(0, scrollY)
      TextEditorController.scrollToCursor(ta)
    } catch (e) {
      console.log('Error, while formatting code: ', e)
    }
  }

  static newLine(ta: HTMLTextAreaElement): boolean {
    const value = ta.value
    const selectionStart = ta.selectionStart

    const codeStartInd = value.lastIndexOf('```', selectionStart)
    const isCodeFragment = codeStartInd !== -1 && (/^```[a-zA-Z]+/.test(value.slice(codeStartInd, codeStartInd + 4)))
    const codeEndInd = value.indexOf('```', selectionStart)
    if (isCodeFragment && selectionStart > codeStartInd && selectionStart < codeEndInd) {
      let beginRowIndex = value.lastIndexOf('\n', selectionStart - 1)
      beginRowIndex = beginRowIndex !== -1 ? beginRowIndex : codeStartInd

      const code = value.slice(codeStartInd)
      const lang = parseLang(code)
      const row = value.slice(beginRowIndex + 1, selectionStart + 1) + '.\n'
      const beginRowSpaces = calcSpaceBefore(row)
      const formattedText = formatCode(row, lang)
      let endRowSpaces = 0
      for (let i = formattedText.length - 3; i >= 0; i--) {
        const char = formattedText.charAt(i)
        if (char === ' ') {
          endRowSpaces++
        } else {
          break
        }
      }

      const spaces = '\n' + ' '.repeat(beginRowSpaces + endRowSpaces)
      // func setRangeText unfortunately clears browser history
      // ta.current.setRangeText(spaces, selectionStart, selectionStart, 'end')
      document.execCommand('insertText', false, spaces)
      TextEditorController.scrollToCursor(ta)
      return true
    }
    return false
  }

  static deleteAllSpacesBeforeCursor(ta: HTMLTextAreaElement): boolean {
    const value = ta.value
    const selectionStart = ta.selectionStart

    const deleteAllSpaces = (/\n {2,}$/.test(value.slice(0, selectionStart)))
    //console.log('deleteAllSpaces: ', deleteAllSpaces)
    if (deleteAllSpaces) {
      const firstSpaceIndex = value.lastIndexOf('\n', selectionStart - 1)
      if (firstSpaceIndex !== -1 && firstSpaceIndex + 1 < selectionStart) {
        ta.setSelectionRange(firstSpaceIndex + 1, selectionStart)
        document.execCommand('insertText', false, '')
        if (selectionStart === value.length) ta.setSelectionRange(ta.value.length - 1, ta.value.length - 1)
        return true
      }
    }
    return false
  }

  static adjustScroller(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
      ta.style.height = 'inherit'
      ta.style.height = `${ta.scrollHeight + 5}px`
    }
  }

  static moveCursorToEndLine(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
      const endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
      if (endOfTheLineIndex !== -1) {
        ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
      } else {
        ta.setSelectionRange(ta.value.length, ta.value.length)
      }
    }
  }

  static moveCursorToBeginLine(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
      let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
      if (beginOfTheLineIndex !== -1) {
        for (let i = beginOfTheLineIndex + 1; i < ta.value.length; i++) {
          if (ta.value.at(i) !== ' ') {
            beginOfTheLineIndex = i
            break
          }
        }
        ta.setSelectionRange(beginOfTheLineIndex, beginOfTheLineIndex)
      } else {
        ta.setSelectionRange(0, 0)
      }
    }
  }

  static onKeyDown(e: any) {

  }
}

interface TextEditorProps extends TextAreaProps {
  onApply?: ((value: string) => void) | undefined
  onCancel?: (() => void) | undefined
}

const defTextEditorProps = (theme: GlobalTheme): any => {
  return {
    width: '100%',
    caretColor: theme.red,
    textColor: theme.inputText,
    bgColor: theme.appBg,
    borderColor: theme.text + '20',
    focusState: (state: StylableComponentProps) => {
      state.bgColor = theme.text + '05'
    }
  }
}

export const TextEditor = (props: TextEditorProps) => {
  const theme = themeManager.theme
  const customProps = { ...defTextEditorProps(theme), ...props }
  const [value, setValue] = useState(props.text ?? props.protocol?.value ?? '')
  const [width, height] = useWindowSize()

  if (props.protocol && props.protocol.value !== value) {
    setValue(props.protocol.value)
  }

  const ta = useRef<HTMLTextAreaElement>(null)

  const onChange = (event: any) => {
    setValue(event.target.value)
    if (props.protocol) props.protocol.value = event.target.value
    TextEditorController.adjustScroller(ta?.current)
  }

  useEffect(() => {
    TextEditorController.adjustScroller(ta?.current)
  }, [width, height])

  const onKeyDown = (e: any) => {
    //console.log('e.keyCode = ', e.keyCode)
    // ESC
    if (e.keyCode === 27) {
      e.preventDefault()
      e.stopPropagation()
      customProps.onCancel()
    }
    // Ctrl + Alt + L
    else if (e.keyCode === 76 && e.ctrlKey && e.shiftKey && ta?.current) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.format(ta.current)
      TextEditorController.moveCursorToBeginLine(ta?.current)
    }
    // Enter key
    else if (e.keyCode === 13 && e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.adjustScroller(ta?.current)
      props.onApply?.(value)
    } else if (ta?.current && e.keyCode === 13 && !e.shiftKey) {
      if (TextEditorController.newLine(ta.current)) {
        e.stopPropagation()
        e.preventDefault()
        TextEditorController.adjustScroller(ta?.current)
      } else {
        e.stopPropagation()
      }
    }
    // PageUp key
    else if (e.keyCode === 33 && ta?.current) {
      e.preventDefault()
      e.stopPropagation()
      ta.current.setSelectionRange(0, 0)
      TextEditorController.scrollToCursor(ta.current)
    }
    // PageDown key
    else if (e.keyCode === 34 && ta?.current) {
      e.preventDefault()
      e.stopPropagation()
      const length = ta?.current?.value.length ?? 0
      ta.current.setSelectionRange(length, length)
      TextEditorController.scrollToCursor(ta.current)
    }
    // Home key
    else if (e.keyCode === 36) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToBeginLine(ta?.current)
    }
    // End key
    else if (e.keyCode === 35) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToEndLine(ta?.current)
    }
    // Delete key
    else if (e.keyCode === 8 && ta?.current && ta.current.selectionStart === ta.current.selectionEnd) {
      if (TextEditorController.deleteAllSpacesBeforeCursor(ta.current)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  const className = 'className' in props ? props.className + ' ' + buildClassName(customProps) : buildClassName(customProps)

  return <textarea className={className + ' listScrollbar'}
                   value={value}
                   autoFocus={customProps.autoFocus}
                   ref={ta}
                   spellCheck="false"
                   onChange={onChange}
                   onKeyDown={onKeyDown}/>
}
