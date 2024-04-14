import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AppSize, Dialog, LayoutLayer } from '../../global/application/Application'
import { observeVM, observeDirList, observeEditTools } from '../DocsContext'
import { observe, observer } from 'react-observable-mutations'
import { useDocsContext } from '../../App'
import * as React from 'react'
import { useState } from 'react'
import { observeApp } from '../../global/GlobalContext'
import { themeManager } from '../../global/application/ThemeManager'
import { stylable, HStack, Label, Spacer, Switcher, TextInput } from 'react-nocss'
import { IconButton, RedButton, TextButton } from '../../global/ui/common/Button'
import { type InputFormProps } from '../../global/ui/common/Input'

export const Header = stylable(() => {
  return <Routes>
    <Route path="/" element={<HeaderView/>}/>
    <Route path=":docTitle" element={<HeaderView/>}/>
  </Routes>
})

export const HeaderView = observer(() => {
  console.log('new AuthPanel')
  const [filterProtocol] = useState({ value: '' })
  const editTools = observeEditTools()
  const app = observeApp()
  const vm = observeVM()
  const dirList = observeDirList()
  const {
    theme, repo
  } = useDocsContext()
  observe(repo)

  const params = useParams()
  const doc = dirList.findDoc(d => params.docTitle === d.title)

  const navigate = useNavigate()

  const createPage = () => {
    if (doc && !doc.isNew) {
      const page = doc.createPage()
      doc.add(page)
      editTools.select(page)
    }
  }

  const saveChanges = () => {
    repo.store()
  }

  const startSearching = () => {
    vm.searchFilter = filterProtocol.value
  }

  const createDir = () => {
    const d = dirList.createDir()
    d.isEditing = true
    dirList.add(d)
  }

  return (
    <HStack halign="right"
            valign="center"
            width="100%"
            height="40px"
            bgColor={theme.appBg}
            gap="0"
            borderBottom={['1px', 'solid', theme.border]}
            paddingHorizontal="10px">

      <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
        theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
      }}/>

      {doc && editTools.editMode &&
        <>
          <TextButton title="Add Dir"
                      onClick={createDir}/>

          <RedButton title="Save"
                     left={theme.docListWidth + 'px'}
                     position='absolute' top='2px'
                     height='35px' padding='0'
                     paddingHorizontal='50px'
                     popUp='Save Changes (Ctrl + Shift + S)'
                     visible={repo.isStorePending}
                     disabled={!repo.isStorePending}
                     onClick={saveChanges}/>

          <Spacer width={(window.innerWidth / 2 - 120) + 'px'}/>

          <TextButton title="Add Page"
                      onClick={createPage}/>

          <Spacer width="10px"/>

          <ToolsPanel/>
        </>
      }

      {doc && !editTools.editMode &&
        <>
          <Spacer width='180px'/>
          <SearchInput protocol={filterProtocol} onSubmitted={startSearching}/>
        </>
      }

      <Spacer/>

      <Label whiteSpace="pre"
             visible={app.size !== AppSize.XS}
             text={editTools.editMode ? 'Edit mode: ' : 'Read mode: '}
             textColor={theme.text50}/>

      <Switcher isSelected={editTools.editMode}
                bgColor={theme.text50}
                selectedBgColor={theme.red}
                thumbColor={theme.isLight ? theme.white : theme.black}
                popUp='Toggle Edit Mode (Ctrl + Shift + E)'
                onClick={() => {
                  editTools.toggleEditMode()
                }}/>
      <Spacer width={theme.topicListWidth - 50 + 'px'}/>

      <TextButton title="Home"
                  onClick={() => { navigate('/') }}/>
    </HStack>
  )
})

const ToolsPanel = observer(() => {
  const editTools = observeEditTools()
  const app = observeApp()

  const createBlock = () => {
    if (editTools.editMode && editTools.selectedPage) {
      editTools.select(editTools.selectedPage.createAndAddBlock())
    } else if (editTools.editMode && editTools.selectedBlock?.page) {
      const curBlockIndex = editTools.selectedBlock.page.blocks.findIndex(b => b.uid === editTools.selectedBlock?.uid)
      editTools.select(editTools.selectedBlock.page.createAndAddBlock(curBlockIndex + 1))
    }
  }

  const moveBlockUp = () => {
    if (editTools.editMode && editTools.selectedBlock?.page?.doc) {
      editTools.selectedBlock?.page?.moveBlockUp(editTools.selectedBlock)
    }
  }

  const moveBlockDown = () => {
    if (editTools.editMode && editTools.selectedBlock?.page?.doc) {
      editTools.selectedBlock?.page?.moveBlockDown(editTools.selectedBlock)
    }
  }

  const deleteBlock = () => {
    if (editTools.editMode && editTools.selectedPage) {
      console.log('---Deleting page title!')
      app.dialog = new Dialog(
        'Delete?',
        `Are you sure you want to remove the page «${editTools.selectedPage.title}» with its content?`,
        () => {
          editTools.selectedPage?.doc?.remove(editTools.selectedPage)
          editTools.select(undefined)
        },
        () => {
        }
      )
    } else if (editTools.editMode && editTools.selectedBlock) {
      console.log('---Deleting block!')
      app.dialog = new Dialog(
        'Delete?',
        "Are you sure you want to remove the selected page's block?",
        () => {
          const page = editTools.selectedBlock?.page
          if (page) {
            page.remove(editTools.selectedBlock)
            editTools.select(undefined)
          }
        },
        () => {
        }
      )
    }
  }

  if (editTools.editMode) {
    return (
      <HStack className="tools"
              valign="center"
              halign="left"
              height="40px" gap="4px">

        <IconButton icon="plus"
                    popUp="New Block (Ctrl + Shift + B)"
                    onClick={createBlock}
                    disabled={!editTools.selectedPage && !editTools.selectedBlock}/>

        <IconButton icon="up"
                    popUp="Move Block up"
                    onClick={moveBlockUp}
                    disabled={!editTools.selectedBlock}/>

        <IconButton icon="down"
                    popUp="Move Block down"
                    onClick={moveBlockDown}
                    disabled={!editTools.selectedBlock}/>

        <IconButton icon="delete"
                    popUp="Delete Block"
                    onClick={deleteBlock}
                    disabled={!editTools.selectedPage && !editTools.selectedBlock}/>

      </HStack>
    )
  }
  return <></>
})

export const SearchInput = (props: InputFormProps) => {
  console.log('new SearchInput')
  const theme = themeManager.theme

  return (
    <HStack halign="left" valign="center" gap="10px" paddingLeft='25px'
            width={props.width}>

      <Label textColor={theme.text50} layer={LayoutLayer.ONE}>
        <span className="icon icon-search"/>
      </Label>

      <TextInput whiteSpace="pre"
                 fontSize='1rem'
                 fontWeight='400'
                 width='300px' height='35px'
                 marginLeft='-35px'
                 paddingLeft='35px'
                 placeholder='Search'
                 textColor={theme.text}
                 caretColor={theme.text}
                 borderColor={theme.transparent}
                 bgColor={theme.transparent}
                 focusState={state => {
                   state.bgColor = theme.orange + '25'
                 }}
                 hoverState={state => {
                   state.bgColor = theme.orange + '25'
                 }}
                 placeholderState={state => {
                   state.textColor = theme.text50
                   state.opacity = '1'
                 }}
                 {...props}/>
    </HStack>
  )
}
