import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DocsContext } from './docs/DocsContext'
import React, { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { LayoutLayer } from './global/application/Application'
import { IconButton, TextButton } from './global/ui/common/Button'
import { GlobalContext, observeApp } from './global/GlobalContext'
import { observeThemeManager, themeManager } from './global/application/ThemeManager'
import { TodoListView } from './TodoListView'
import { observer } from 'react-observable-mutations'
import { HStack, Label, VStack } from 'react-nocss'

export const API_URL = process.env.REACT_APP_API_URL
export const IS_DEV_MODE = process.env.REACT_APP_MODE === 'development'

console.log('React v.' + React.version)
console.log('API_URL:', API_URL)
console.log('DEV_MODE:', IS_DEV_MODE)

const globalContext = React.createContext(GlobalContext.init())
export const useGlobalContext = () => React.useContext(globalContext)

const docsContext = React.createContext(DocsContext.init())
export const useDocsContext = () => React.useContext(docsContext)

export const LazyDocsPage = lazy(async() => await import('./docs/ui/DocsPage').then((module) => ({ default: module.DocsPage })))
export const LazyIntroPage = lazy(async() => await import('./docs/ui/IntroPage').then((module) => ({ default: module.IntroPage })))

export const App = observer(() => {
  console.log('new App')
  observeThemeManager()

  return <>
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/todo" element={<TodoListView/>}/>
          <Route path="/docs/*" element={<LazyDocsPage/>}/>
          <Route path="/" element={<LazyIntroPage/>}/>
          <Route path="*" element={<Navigate replace to="/"/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>

    <ErrorMsgView/>
    <ModalView/>
  </>
})

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    let width = window.innerWidth
    let height = window.innerHeight

    function updateSize() {
      if (Math.abs(window.innerWidth - width) > 100 || Math.abs(window.innerHeight - height) > 100) {
        width = window.innerWidth
        height = window.innerHeight
        setSize([window.innerWidth, window.innerHeight])
      }
    }

    window.addEventListener('resize', updateSize)
    updateSize()
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])
  return size
}

export const ModalView = observer(() => {
  console.log('new ModalView')

  const app = observeApp()
  const theme = themeManager.theme
  const apply = () => {
    if (app.dialog) {
      app.dialog.onApply?.()
      app.dialog = undefined
    }
  }

  const cancel = () => {
    if (app.dialog) {
      app.dialog.onCancel?.()
      app.dialog = undefined
    }
  }

  const ok = () => {
    if (app.dialog) {
      app.dialog = undefined
    }
  }

  if (!app.dialog) {
    return <></>
  }

  const hasApplyBtn = app.dialog.onApply !== undefined
  const hasCancelBtn = app.dialog.onCancel !== undefined
  const hasOkBtn = !hasApplyBtn && !hasCancelBtn

  return <VStack halign="center"
                 valign="center"
                 width="100%"
                 height="100%"
                 bgColor='#00000050'
                 layer={LayoutLayer.MODAL}
                 top='0'
                 position='fixed'>

    <VStack halign="stretch"
            valign="center"
            shadow="0 10px 20px #00000020"
            bgColor={theme.modalViewBg}
            padding='40px'
            gap="30px" width='100%' maxWidth='500px'>
      {app.dialog &&
        <>
          <Label type="h3"
                 width='100%'
                 textAlign='center'
                 text={app.dialog?.title}
                 textColor={theme.header}
                 layer={LayoutLayer.ONE}/>

          <Label width='100%'
                 text={app.dialog?.text}
                 textColor={theme.text}/>

          <HStack halign="center" valign="top" gap="50px">
            {app.dialog.onCancel &&
              <TextButton title="No"
                          onClick={cancel}/>
            }

            {hasOkBtn &&
              <TextButton title="Ok"
                          onClick={ok}/>
            }

            {hasApplyBtn &&
              <TextButton title="Yes"
                          onClick={apply}/>
            }

          </HStack>
        </>
      }
    </VStack>
  </VStack>
})

export const ErrorMsgView = observer(() => {
  console.log('new ErrorMsgView')

  const app = observeApp()
  const theme = themeManager.theme

  const close = () => {
    if (app.errorMsg) {
      app.errorMsg = ''
    }
  }

  if (!app.errorMsg) {
    return <></>
  }

  return <HStack halign="stretch"
                 valign="center"
                 width="100%"
                 bottom='0'
                 minHeight="50px"
                 bgColor={theme.modalViewBg}
                 layer={LayoutLayer.ERR_MSG}
                 position='fixed'>

    <Label className='ibm'
           width='100%'
           textAlign='center'
           text={app.errorMsg}
           textColor={theme.text}/>

    <IconButton icon="close"
                popUp="Close"
                textColor={theme.text50}
                hoverState={state =>
                  state.textColor = theme.text}
                onClick={close}/>
  </HStack>
})
