import * as React from 'react'
import { useDocsContext } from '../../../App'
import { themeManager } from '../../application/ThemeManager'
import { buildClassName } from 'react-nocss'

/*
*
* Separator
*
* */

interface HSeparatorProps {
  visible?: boolean
  width?: string
  height?: string
  maxWidth?: string
  marginHorizontal?: string
  marginVertical?: string
  color?: string
}

export const HSeparator = (props: HSeparatorProps) => {
  if (props.visible === false) return <></>
  const theme = useDocsContext().theme

  const style: any = { ...props }
  if (props.width !== undefined) style.width = props.width
  if (props.marginHorizontal !== undefined) {
    style.marginLeft = props.marginHorizontal
    style.marginRight = props.marginHorizontal
  }
  if (props.marginVertical !== undefined) {
    style.marginTop = props.marginVertical
    style.marginBottom = props.marginVertical
  }
  style.bgColor = props.color ?? theme.text + '25'
  style.height = props.height ?? '1px'
  style.maxHeight = props.height ?? '1px'

  return <div className={buildClassName(style)}/>
}

interface VSeparatorProps {
  visible?: boolean
  width?: string
  height?: string
  marginHorizontal?: string
  marginVertical?: string
  color?: string
}

export const VSeparator = (props: VSeparatorProps) => {
  if (props.visible === false) return <></>
  const theme = themeManager.theme

  const style: any = {}
  style.flexGrow = 1

  if (props.marginHorizontal !== undefined) {
    style.marginLeft = props.marginHorizontal
    style.marginRight = props.marginHorizontal
  }
  if (props.marginVertical !== undefined) {
    style.marginTop = props.marginVertical
    style.marginBottom = props.marginVertical
  }
  style.bgColor = props.color ?? theme.text + '25'
  style.width = props.width ?? '1px'
  style.maxWidth = props.width ?? '1px'

  if (props.height !== undefined) {
    style.height = props.height
    style.minHeight = props.height
    style.maxHeight = props.height
  }

  return <div className={buildClassName(style)}/>
}
