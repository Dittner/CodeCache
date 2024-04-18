import React, { useState } from 'react'
import {
  HStack,
  Spacer,
  VStack,
  type StylableComponentProps,
  TextArea,
  Label,
  Switcher,
  stylable
} from 'react-nocss'
import { observe, observer } from 'react-observable-mutations'
import { themeManager } from '../../global/application/ThemeManager'
import { RedButton } from '../../global/ui/common/Button'
import { FormatterVM, type NumberProtocol } from './FormatterVM'
import { NavBar } from '../../global/ui/common/NavBar'

const formatterVM = new FormatterVM()

export const FormatterPage = observer(() => {
  const vm = observe(formatterVM)
  const theme = themeManager.theme

  return <HStack maxWidth="100%"
                 width="100vw"
                 height="100vh"
                 halign="left"
                 valign="top"
                 gap="0"
                 disableHorizontalScroll>

    <NavBar/>

    <Tools width='50%' height='100%'/>

    <TextArea protocol={vm.inputProtocol}
              className='article listScrollbar'
              width='100%' maxWidth='900px' height='100%'
              textColor={theme.text}
              fontSize='1.2rem'
              caretColor={theme.isLight ? '#000000' : theme.red}
              bgColor={theme.appBg}
              borderRight={['1px', 'solid', theme.text + '20']}
              borderLeft={['1px', 'solid', theme.text + '20']}
              padding="20px"
              focusState={(state: StylableComponentProps) => {
                state.bgColor = theme.text + '05'
              }}
              autoFocus/>

    <Spacer width='50%'/>
  </HStack>
})

const Tools = observer(stylable(() => {
  const vm = observe(formatterVM)
  const theme = themeManager.theme
  const lblColumnWidth = '60%'

  return (
    <VStack width='100%' height='100%' halign='center'
            paddingTop='40px' padding='20px'>
      <HStack width='100%' valign='center'>
        <Label width={lblColumnWidth} whiteSpace="pre"
               textAlign='right'
               text={'Remove duplicate spaces:'}
               textColor={theme.text50}/>

        <Switcher isSelected={vm.removeDuplicateSpaces}
                  bgColor={theme.text50}
                  selectedBgColor={theme.red}
                  thumbColor={theme.isLight ? theme.white : theme.black}
                  onClick={() => {
                    vm.removeDuplicateSpaces = !vm.removeDuplicateSpaces
                  }}/>
      </HStack>

      <HStack width='100%' valign='center'>
        <Label width={lblColumnWidth} whiteSpace="pre"
               textAlign='right'
               text={'Remove hyphen and space:'}
               textColor={theme.text50}/>

        <Switcher isSelected={vm.removeHyphenAndSpace}
                  bgColor={theme.text50}
                  selectedBgColor={theme.red}
                  thumbColor={theme.isLight ? theme.white : theme.black}
                  onClick={() => {
                    vm.removeHyphenAndSpace = !vm.removeHyphenAndSpace
                  }}/>
      </HStack>

      <HStack width='100%' valign='center'>
        <Label width={lblColumnWidth} whiteSpace="pre"
               textAlign='right'
               text={'Replace hyphen with dash:'}
               textColor={theme.text50}/>

        <Switcher isSelected={vm.replaceHyphenWithDash}
                  bgColor={theme.text50}
                  selectedBgColor={theme.red}
                  thumbColor={theme.isLight ? theme.white : theme.black}
                  onClick={() => {
                    vm.replaceHyphenWithDash = !vm.replaceHyphenWithDash
                  }}/>
      </HStack>

      <HStack width='100%' valign='center'>
        <Label width={lblColumnWidth} whiteSpace="pre"
               textAlign='right'
               text={'Max new lines:'}
               textColor={theme.text50}/>

        <NumberSelector protocol={vm.maxEmptyLines}/>
      </HStack>

      <Spacer/>

      <RedButton title='Start formatting'
                 padding='20px'
                 cornerRadius='5px'
                 onClick={() => {
                   vm.startFormatting()
                 }}/>
    </VStack>
  )
}))

interface NumberSelectorProps {
  protocol: NumberProtocol
}

export const NumberSelector = (props: NumberSelectorProps) => {
  const theme = themeManager.theme
  const [value, setValue] = useState(props.protocol.value)
  if (props.protocol.value !== value) {
    setValue(props.protocol.value)
  }

  const inc = () => {
    props.protocol.value = props.protocol.value + 1
    setValue(props.protocol.value)
  }

  const dec = () => {
    props.protocol.value = props.protocol.value > 0 ? props.protocol.value - 1 : 0
    setValue(props.protocol.value)
  }

  return <HStack valign='center' halign='center' gap='2px'>
    <Label text={value.toString()}
           textAlign='center'
           width='40px' height='30px'
           bgColor={theme.red + '20'}
           textColor={theme.text}/>
    <RedButton title='+' width='40px' height='30px'
               onClick={inc}/>
    <RedButton title='–' width='40px' height='30px'
               onClick={dec}/>
  </HStack>
}
