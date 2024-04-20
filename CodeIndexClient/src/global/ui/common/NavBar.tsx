import { HStack, Spacer } from 'react-nocss'
import { themeManager } from '../../application/ThemeManager'
import { useNavigate } from 'react-router-dom'
import { IconButton, TextButton } from './Button'
import React from 'react'
import { VSeparator } from './Separator'
import { LayoutLayer } from '../../application/Application'

export interface NavBarProps {
  showAllTabs?: boolean
  useBg?: boolean
}

export const NavBar = (props: NavBarProps) => {
  const theme = themeManager.theme
  const navigate = useNavigate()

  return <HStack position='fixed'
                 top='0' left='0'
                 halign='left' valign='center'
                 width='100%'
                 paddingHorizontal='10px'
                 bgColor={props.useBg ? theme.appBg + 'cc' : '#00000000'}
                 height='40px' gap="5px"
                 layer={LayoutLayer.HEADER}>
    <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
      theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
    }}/>

    <Spacer/>

    <TextButton title="Home"
                onClick={() => {
                  navigate('/')
                }}/>

    {props.showAllTabs && <>
      <VSeparator height='15px' color={theme.green + '50'} marginHorizontal='10px'/>

      <TextButton title="Docs"
                  onClick={() => {
                    navigate('/docs')
                  }}/>

      <VSeparator height='15px' color={theme.green + '50'} marginHorizontal='10px'/>

      <TextButton title="Formatter"
                  onClick={() => {
                    navigate('/formatter')
                  }}/>
    </>
    }

  </HStack>
}
