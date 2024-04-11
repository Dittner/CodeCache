import { useDocsContext } from '../../../App'
import * as React from 'react'
import { Button, type ButtonProps } from 'react-nocss'
import { themeManager } from '../../application/ThemeManager'

type IconType =
  'sun'
  | 'moon'
  | 'down'
  | 'up'
  | 'scrollBack'
  | 'nextPage'
  | 'prevPage'
  | 'close'
  | 'menu'
  | 'settings'
  | 'search'
  | 'plus'
  | 'delete'
  | 'edit'
  | 'link'

interface IconButtonProps extends ButtonProps {
  icon: IconType
}

export const IconButton = (props: IconButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = useDocsContext().theme

  return <Button className={'icon-' + props.icon}
                 bgColor={undefined}
                 textColor={theme.red}
                 paddingHorizontal='10px'
                 hoverState={state => {
                   state.textColor = theme.white
                   state.bgColor = theme.isLight ? theme.red : theme.transparent
                 }}
                 selectedState={state => {
                   state.textColor = theme.white
                   state.bgColor = theme.isLight ? theme.red : theme.transparent
                 }}
                 disabledState={state => {
                   state.opacity = '1'
                   state.textColor = theme.text50
                 }}
                 onClick={props.onClick}
                 {...props}/>
}

export const TextButton = (props: ButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <Button title={props.title}
                 bgColor={undefined}
                 textColor={theme.red}
                 hoverState={state => {
                   state.textColor = theme.isLight ? theme.black : theme.white
                 }}
                 {...props}/>
}

export const RedButton = (props: ButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <Button textColor={theme.white}
                 bgColor={theme.red + 'dd'}
                 hoverState={state => {
                   state.bgColor = theme.red
                 }}
                 selectedState={state => {
                   state.bgColor = theme.red
                 }}
                 disabledState={state => {
                   state.bgColor = theme.gray
                 }}
                 {...props}/>
}
