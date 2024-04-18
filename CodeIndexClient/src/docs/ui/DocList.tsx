import { useLocation, useNavigate } from 'react-router-dom'
import * as React from 'react'
import { useState } from 'react'
import { useDocsContext } from '../../App'
import { Dialog } from '../../global/application/Application'
import { observeDirList, observeEditTools } from '../DocsContext'
import { observe, observer } from 'react-observable-mutations'
import { IconButton, TextButton } from '../../global/ui/common/Button'
import { sortByKey } from '../../global/utils/Utils'
import { InputForm } from '../../global/ui/common/Input'
import { type Directory, type Doc, LoadStatus } from '../domain/DocsModel'
import { observeApp } from '../../global/GlobalContext'
import { stylable, HStack, Label, StylableContainer, VStack } from 'react-nocss'

export const DocList = observer(stylable(() => {
  console.log('new DocList')
  const dirList = observeDirList()
  const {
    theme
  } = useDocsContext()

  if (dirList.loadStatus === LoadStatus.LOADING) {
    return <StylableContainer width="100%"
                              height="100%"
                              borderRight={['1px', 'solid', theme.border]}/>
  }
  return (
    <VStack valign="top"
            halign="center"
            gap="0"
            width="100%"
            height="100%">

      {dirList.dirs.sort(sortByKey('title')).map(dir => {
        return <DirectoryView key={dir.uid} dir={dir}/>
      })}
    </VStack>
  )
}))

const DirectoryView = observer(({ dir }: { dir: Directory }) => {
  const app = observeApp()
  observe(dir)
  const editTools = observeEditTools()
  const {
    restApi,
    theme
  } = useDocsContext()

  const [newDoc, setNewDoc] = useState<Doc | null>(null)
  const [isSettingsOpened, setIsSettingsOpened] = useState<boolean>(false)

  const createDoc = () => {
    setNewDoc(dir.createDoc())
    setIsSettingsOpened(false)
  }
  const onApplyDocCreating = (title: string) => {
    if (newDoc && title) {
      newDoc.title = title
      restApi.storeDoc(newDoc, dir)
      newDoc.isEditing = false
      setNewDoc(null)
    }
  }

  const onCancelDocCreating = () => {
    setNewDoc(null)
  }

  const onApplyDirEditing = (title: string) => {
    if (dir.isNew) {
      dir.title = title
      restApi.storeDir(dir)
    } else if (dir && title && dir.title !== title) {
      restApi.renameDir(dir, title)
      dir.isEditing = false
    }
  }

  const onDeleteDir = () => {
    app.dialog = new Dialog(
      'Are you sure you want to delete the directory «' + dir.title + '»?',
      'The directory and its files will be moved to the recycle bin. You can undo this action manually.',
      () => {
        restApi.deleteDir(dir)
        dir.isEditing = false
      },
      () => {
      })
  }

  const onCancelDirEditing = () => {
    dir.isEditing = false
  }

  const startEditing = () => {
    if (!dir.isStoring && editTools.editMode) {
      dir.isEditing = true
      setIsSettingsOpened(false)
    }
  }

  if (editTools.editMode && dir.isEditing) {
    return <>
      <DirForm dir={dir}
               padding='10px'
               width='100%'
               onCancel={onCancelDirEditing}
               onApply={onApplyDirEditing}/>
      {
        dir.docs.map(doc => {
          return <DocLink key={doc.uid} doc={doc}/>
        })
      }
    </>
  }
  return <>
    <VStack width="100%"
            gap='0'
            halign="left"
            valign="center"
            paddingBottom='20px'>

      <HStack halign='left' valign='center'
              width="100%" gap='0'>
        <Label className="notSelectable"
               width='100%'
               whiteSpace='nowrap'
               overflow='clip'
               textOverflow='ellipsis'
               textColor={theme.text50}
               paddingHorizontal="20px"
               text={dir.title}
               textAlign="left"/>

        {editTools.editMode &&
          <IconButton icon='settings'
                      isSelected={isSettingsOpened}
                      popUp="Show settings"
                      onClick={() => {
                        setIsSettingsOpened(!isSettingsOpened)
                      }}/>

        }
      </HStack>

      {editTools.editMode && isSettingsOpened &&
        <VStack halign='center' valign='center' gap='0' bgColor='#00000010'>
          <TextButton title="New Doc"
                      onClick={createDoc}/>
          <TextButton title="Edit"
                      onClick={startEditing}/>
          <TextButton title="Delete"
                      popUp="Delete"
                      visible={dir.isNew}
                      onClick={onDeleteDir}/>
        </VStack>
      }

      {newDoc &&
        <DocForm doc={newDoc}
                 padding='10px'
                 width='100%'
                 onCancel={onCancelDocCreating}
                 onApply={onApplyDocCreating}/>
      }

      {
        dir.docs.map(doc => {
          return <DocLink key={doc.uid} doc={doc}/>
        })
      }
    </VStack>

  </>
})

const DocLink = observer(({ doc }: { doc: Doc }) => {
  observe(doc)
  const {
    restApi,
    editTools,
    theme
  } = useDocsContext()

  const navigate = useNavigate()
  const location = useLocation()
  const isDocSelected = location.pathname === '/docs/' + doc.title

  const onApply = (title: string) => {
    if (doc && title && doc.title !== title && doc.dir) {
      restApi.renameDoc(doc, title)
      doc.isEditing = false
    }
  }

  const onCancel = () => {
    doc.isEditing = false
  }

  const startEditing = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (!doc.isStoring && editTools.editMode) {
      doc.isEditing = true
    }
  }

  const openDoc = () => {
    navigate(`./${doc.title}`)
  }

  if (editTools.editMode && doc.isEditing) {
    return (
      <DocForm doc={doc}
               width='100%'
               onCancel={onCancel}
               onApply={onApply}/>
    )
  }

  return (
    <HStack width="100%"
            height='30px'
            halign="left"
            valign="center"
            bgColor={isDocSelected ? theme.docLinkBgSelected : theme.transparent}
            paddingLeft="20px"
            paddingRight="5px"
            gap="8px"
            hoverState={state => {
              if (!isDocSelected) {
                state.bgColor = editTools.editMode ? theme.selectedBlockBg : theme.docLinkBgHovered
              }
            }}
            onClick={openDoc}
            onDoubleClick={startEditing}>

      <Label className='icon-doc'
             textColor={isDocSelected ? theme.docLinkSelected : theme.docLinkIcon}
             paddingBottom='5px' opacity='0.75'/>

      <Label className="notSelectable"
             textColor={isDocSelected ? theme.docLinkSelected : theme.docLink}
             text={isDocSelected ? doc.title + ' ' : doc.title}
             textAlign="left"
             fontWeight={isDocSelected ? '500' : theme.defFontWeight}
             btnCursor
             width="100%"
             hoverState={state => {
               if (!isDocSelected) {
                 state.textColor = theme.docLinkHovered
               }
             }}/>
    </HStack>
  )
})

interface DocFormProps {
  doc: Doc
  onCancel: () => void
  onApply: (title: string) => void
}

const DocForm = stylable((props: DocFormProps) => {
  console.log('new DocEditForm')
  const { theme } = useDocsContext()

  const location = useLocation()
  const isDocSelected = location.pathname === '/docs/' + props.doc.title
  const [newDocTitleProtocol, _] = useState({ value: props.doc.title })

  const apply = () => {
    props.onApply(newDocTitleProtocol.value)
  }
  const cancel = () => {
    props.onCancel()
  }

  return (
    <HStack halign="left" valign="center"
            padding='0'
            paddingLeft="20px"
            paddingRight="5px"
            gap="3px"
            width='100%'
            height='30px'>
      <Label className='icon-doc'
             textColor={isDocSelected ? theme.docLinkSelected : theme.docLinkIcon}
             paddingBottom='5px' opacity='0.75'/>

      <InputForm type="text"
                 paddingHorizontal='5px'
                 height='30px'
                 protocol={newDocTitleProtocol}
                 onSubmitted={apply}
                 onCanceled={cancel}
                 autoFocus/>
    </HStack>
  )
})

interface DirFormProps {
  dir: Directory
  onCancel: () => void
  onApply: (title: string) => void
}

const DirForm = stylable((props: DirFormProps) => {
  console.log('new DirEditForm')
  const [titleProtocol, _] = useState({ value: props.dir?.title ?? '' })

  const apply = () => {
    if (!props.dir.isStoring && titleProtocol.value) {
      props.onApply(titleProtocol.value)
    }
  }

  const cancel = () => {
    props.onCancel()
  }

  return <InputForm type="text"
                    paddingHorizontal='5px'
                    height='30px'
                    protocol={titleProtocol}
                    onSubmitted={apply}
                    onCanceled={cancel}
                    autoFocus
  />
})
