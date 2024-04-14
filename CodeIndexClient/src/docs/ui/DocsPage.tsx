import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DocList } from './DocList'
import { useDocsContext, useWindowSize } from '../../App'
import { DocBody } from './DocBody'
import { DocTopics } from './DocTopics'
import { Header } from './Header'
import { LayoutLayer } from '../../global/application/Application'
import { observeEditTools, observeVM } from '../DocsContext'
import { observe, observer } from 'react-observable-mutations'
import { TextEditor } from '../../global/ui/common/Input'
import { HStack, Label, VStack } from 'react-nocss'
import { buildClassName, type StylableComponentProps } from 'react-nocss'
import { NavBar } from '../../global/ui/common/NavBar'

export const DocsPage = observer(() => {
  console.log('new DocsPage')
  observeVM()
  const editTools = observeEditTools()
  const {
    theme,
    restApi
  } = useDocsContext()
  observe(restApi)
  useWindowSize()

  const editorWidth = 0.5 * window.innerWidth - theme.docListWidth - 8
  const bodyWidth = 0.5 * window.innerWidth - theme.topicListWidth - 8

  useEffect(() => {
    restApi.loadAllDirs()
  }, [])

  const {
    pathname,
    hash,
    key
  } = useLocation()

  useEffect(() => {
    if (hash === '') {
      window.scrollTo(0, 0)
    } else {
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          const elementPos = Math.round(element.getBoundingClientRect().top + document.documentElement.scrollTop)
          // element.scrollIntoView();
          console.log('elementPos=', elementPos)
          window.scrollTo(0, elementPos < 100 ? 0 : elementPos - 50)
        }
      }, 0)
    }
  }, [pathname, hash, key]) // do this on route change

  if (!restApi.isServerRunning) {
    const title = `The server is not running.
To start the server, execute commands in the terminal:`
    const commands = `$ cd ../CodeIndex
$ python3 run_server.py`
    return <VStack halign="center"
                   valign="center"
                   gap='20px'
                   width="100%" height="100vh">
      <NavBar/>

      <Label text={title}
             textAlign='center'
             whiteSpace="pre"
             textColor={theme.text}
             fontSize='1.1rem'/>

      <Label text={commands}
             className='mono'
             minWidth='500px'
             textAlign='left'
             whiteSpace="pre"
             paddingVertical='10px'
             paddingHorizontal='20px'
             bgColor={theme.codePanelBg}
             cornerRadius='8px'
             textColor={theme.white}
             fontSize='0.9rem'/>
    </VStack>
  }

  if (editTools.editMode) {
    return <HStack width='100%' halign='left' valign='top'
                   layer={LayoutLayer.ONE}>
      <Header left='0' right='0' top="0"
              layer={LayoutLayer.HEADER}
              position='fixed'/>
      <DocList className='listScrollbar'
               width={theme.docListWidth + 'px'}
               height="100%"
               borderRight={['1px', 'solid', theme.border]}
               left='0' top='40px'
               position='fixed'
               enableOwnScroller/>

      <PageBlockEditor width={editorWidth + 'px'}
                       position='fixed'
                       left={theme.docListWidth + 'px'} top='40px' bottom='0'/>

      <DocBody width={bodyWidth + 'px'}
               top='40px'
               position='relative'
               left={editorWidth + theme.docListWidth + 'px'}/>

      <DocTopics className='listScrollbar'
                 width={theme.topicListWidth + 'px'}
                 height='100%'
                 borderLeft={['1px', 'solid', theme.border]}
                 position='fixed' right='0' top='40px'
                 enableOwnScroller
      />
    </HStack>
  }

  return <HStack width='100%' height='100%' halign='center' valign='top'
                 layer={LayoutLayer.ONE}>
    <Header left='0' right='0' top="0"
            layer={LayoutLayer.HEADER}
            position='fixed'/>
    <DocList className='listScrollbar'
             width={theme.docListWidth + 'px'}
             height={(window.innerHeight - 40) + 'px'}
             borderRight={['1px', 'solid', theme.border]}
             left='0' top='40px'
             position='fixed'
             enableOwnScroller/>

    <PageBlockEditor width={editorWidth + 'px'}
                     visible={false}
                     position='fixed'
                     left={theme.docListWidth + 'px'} top='40px' bottom='0'/>

    <DocBody width={2 * bodyWidth + 'px'} height='100%'
             top='40px'
             maxWidth={theme.maxDocBodyWidth + 'px'}
             position='relative'/>

    <DocTopics className='listScrollbar'
               width={theme.topicListWidth + 'px'}
               height={(window.innerHeight - 40) + 'px'}
               borderLeft={['1px', 'solid', theme.border]}
               position='fixed' right='0' top='40px'
               enableOwnScroller
    />
  </HStack>
})

const PageBlockEditor = observer((props: StylableComponentProps) => {
  console.log('new PageBlockEditor')
  const editTools = observeEditTools()

  const apply = (_: string) => {
    editTools.applyEnteredText()
  }

  const cancel = () => {
    editTools.cancelEnteredText()
  }

  let className = buildClassName(props)
  if ('className' in props) className += ' ' + props.className

  if ('visible' in props && !props.visible) return <></>

  return <div id={props.id}
              key={props.keyValue}
              className={className}>
    <TextEditor protocol={editTools.inputProtocol}
                width='100%' height='100%' minHeight='100%'
                className="mono"
                paddingHorizontal="20px"
                paddingTop="10px"
                onApply={apply}
                onCancel={cancel}
                autoFocus/>
  </div>
})
