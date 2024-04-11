import { uid } from '../domain/UIDGenerator'
import { Observable, observe } from 'react-observable-mutations'
import { buildRule, type StylableComponentProps } from 'react-nocss'

export interface GlobalTheme {
  id: string
  isLight: boolean
  defFontSize: string
  defFontWeight: string
  appBg: string
  headerBgColor: string
  white: string
  black: string
  black05: string
  black10: string
  black25: string
  black50: string
  black75: string
  header: string
  inputText: string
  text: string
  text50: string
  orange: string
  red: string
  olive: string
  gray: string
  green: string
  blue: string
  pink: string
  purple: string
  violet: string
  modalViewBg: string
  codePanelBg: string
  separator: string
  transparent: string
  code: string
  codeBg: string
  search: string
  //docs
  maxDocBodyWidth: number
  docListWidth: number
  topicListWidth: number
  selectedBlockBg: string
  border: string
  error: string
  link: string
  linkHover: string
  prevNextPageBtnBg: string
  docLink: string
  docLinkIcon: string
  docLinkHovered: string
  docLinkBgHovered: string
  docLinkSelected: string
  docLinkBgSelected: string
}

export class ThemeManager extends Observable {
  readonly uid

  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme

  //--------------------------------------
  //  globalTheme
  //--------------------------------------
  private _theme: GlobalTheme
  get theme(): GlobalTheme {
    return this._theme
  }

  setLightTheme() {
    this._theme = this._lightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.theme.appBg
    }
    window.localStorage.setItem('theme', 'light')
    this.mutated()
  }

  setDarkTheme() {
    this._theme = this._darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.theme.appBg
    }
    window.localStorage.setItem('theme', 'dark')
    this.mutated()
  }

  constructor() {
    super('ThemeManager')
    this.uid = uid()

    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this._theme = this._lightTheme

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setLightTheme()
    } else {
      this.setDarkTheme()
    }
  }

  /*
  *
  * LIGHT THEME
  *
  * */

  createLightTheme(): GlobalTheme {
    const black = '#151a1c'
    const white = '#f0f1f2'
    return {
      id: 'light',
      isLight: true,
      defFontSize: '1rem',
      defFontWeight: '400',
      appBg: white,
      headerBgColor: '#24292c',
      white,
      orange: '#a56a26',
      black05: black + '05',
      black10: black + '10',
      black25: black + '44',
      black50: black + '88',
      black75: black + 'CC',
      black,
      header: black,
      inputText: black,
      text: black,
      text50: black + '88',
      red: '#95353d',
      olive: '#ab9b4d',
      gray: '#8a9fb6',
      green: '#7198a9',
      blue: '#084891',
      pink: '#9434a6',
      purple: '#6739d9',
      violet: '#48356a',
      modalViewBg: '#e5d8f1',
      codePanelBg: '#151a1cdd',
      separator: '#283238',
      transparent: '#00000000',
      code: black,
      codeBg: '#7198a920',
      search: '#DC9B30',
      //docs
      maxDocBodyWidth: 1200,
      docListWidth: 250,
      topicListWidth: 250,
      border: black + '10',
      error: '#ff719a',
      link: '#003a73',
      linkHover: '#a56a26',
      selectedBlockBg: '#88397b20',
      prevNextPageBtnBg: '#652664',
      docLink: black,
      docLinkIcon: black,
      docLinkHovered: black,
      docLinkBgHovered: '#396f8810',
      docLinkSelected: '#9434a6',
      docLinkBgSelected: '#00000000'
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const darkWhite = '#bcc9d3' //abc3d0
    const blue = '#569cee'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#25262f',
      header: '#cfdbe8',
      text: darkWhite,
      text50: darkWhite + '88',
      inputText: '#a3d5ea',
      red: '#d05f68',
      gray: '#778594',
      border: '#ffFFff10',
      blue,
      green: '#8bbbd0',
      violet: '#6b4f9d',
      //docs
      modalViewBg: '#43354b',
      codePanelBg: '#eff0fb07',
      link: blue,
      linkHover: '#c1cdd9',
      code: '#a6bed3',
      codeBg: '#8bbbd010',
      docLink: darkWhite + '88',
      docLinkIcon: darkWhite,
      docLinkHovered: darkWhite,
      docLinkBgHovered: darkWhite + '10',
      docLinkSelected: darkWhite
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const textColor = t.text
    const textHeaderColor = t.header
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    const h1Props: StylableComponentProps = {
      textTransform: 'capitalize',
      fontSize: '2.5rem',
      fontWeight: '700',
      textColor: textHeaderColor
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: StylableComponentProps = {
      fontSize: '1.25rem',
      fontWeight: '600',
      textColor
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: StylableComponentProps = {
      fontSize: '1.25rem',
      fontWeight: '600',
      textColor: t.purple
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: StylableComponentProps = {
      fontSize: '1.25rem',
      fontWeight: '600',
      textColor: t.pink
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: StylableComponentProps = {
      fontSize: '1.25rem',
      fontWeight: '500',
      textColor: textColor + '44'
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: StylableComponentProps = {
      fontSize: '1.25rem',
      fontWeight: '500',
      textColor: textColor + '44'
    }
    buildRule(h6Props, parentSelector, 'h6')

    const pProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      letterSpacing: '0.5px',
      textColor
    }
    buildRule(pProps, parentSelector, 'p')

    const boldProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: '600',
      textColor
    }
    buildRule(boldProps, parentSelector, 'strong')
    buildRule(boldProps, parentSelector, 'b')

    const globalProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor
    }
    buildRule(globalProps, parentSelector, 'i')
    buildRule(globalProps, parentSelector, 'li')

    const inlineCodeProps: StylableComponentProps = {
      fontFamily: monoFont,
      fontSize: '0.9rem',
      textColor: t.code,
      paddingHorizontal: '5px',
      bgColor: t.codeBg
    }
    buildRule(inlineCodeProps, parentSelector, 'code')
    inlineCodeProps.textColor = t.search

    buildRule({
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: t.search,
      textColor
    }, parentSelector, 'mark')

    const linkProps: StylableComponentProps = {
      fontFamily: monoFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: t.blue
    }
    buildRule(linkProps, parentSelector, 'a:link')
    buildRule(linkProps, parentSelector, 'a:visited')
    buildRule(linkProps, parentSelector, 'a:active')
    linkProps.textDecoration = 'underline'
    buildRule(linkProps, parentSelector, 'a:hover')

    const blockquoteProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      padding: '20px',
      borderLeft: ['7px', 'solid', textColor]
    }
    buildRule(blockquoteProps, parentSelector, 'blockquote')
  }
}

export const themeManager = new ThemeManager()

export function observeThemeManager(): ThemeManager {
  return observe(themeManager)
}
