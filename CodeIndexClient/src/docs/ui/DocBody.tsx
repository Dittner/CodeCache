import { Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useDocsContext } from '../../App'
import * as React from 'react'
import { useEffect, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import ReactMarkdown from 'react-markdown'
import { observeVM, observeDirList, observeEditTools } from '../DocsContext'
import { IconButton } from '../../global/ui/common/Button'
import { observe, observer } from 'react-observable-mutations'
import { DocLoadStatus, type Page, type PageBlock } from '../domain/DocsModel'
import { Button, HStack, Label, Spacer, StylableContainer, VStack, stylable } from 'react-nocss'

const MAX_CONTENT_WIDTH = '900px'

export const DocBody = stylable(() => {
  return <Routes>
    <Route path="/" element={<EmptyDoc msg="No document selected"/>}/>
    <Route path=":docTitle" element={<PageList/>}/>
  </Routes>
})

const EmptyDoc = ({ msg }: { msg: string }) => {
  const { theme } = useDocsContext()

  return <VStack halign="center"
                 valign="center"
                 width="100%" height="90vh">
    <Label text={msg} textColor={theme.text50}/>
  </VStack>
}

const PageList = observer(() => {
  console.log('new PageList')
  const vm = observeVM()
  const dirList = observeDirList()
  const {
    restApi,
    theme
  } = useDocsContext()

  //console.log('  dirList = ', dirList)
  const params = useParams()
  const location = useLocation()
  const [pagesSlice, setPagesSlice] = useState(
    {
      start: 0,
      end: 0,
      isFirstPageShown: true,
      isLastPageShown: true
    })

  const doc = dirList.findDoc(d => params.docTitle === d.title)

  observe(doc)
  //console.log('  PageList, doc = ', doc)

  useEffect(() => {
    if (doc && doc.loadStatus === DocLoadStatus.HEADER_LOADED && !doc.isNew) {
      console.log('DocBody, docs loading...: ', doc.title)
      restApi.loadDocPages(doc)
    }
  }, [doc])

  useEffect(() => {
    if (doc) {
      let start = 0
      if (doc.pages.length > 0 && location.hash) {
        const isFirstLaunch = pagesSlice.end === 0
        const pageIndex = doc.pages.findIndex(p => p.key === location.hash)
        start = Math.max(isFirstLaunch ? pageIndex : pageIndex - 1, 0)
      }

      let end = 0
      let blocksTotal = 0
      for (let i = start; i < doc.pages.length; i++) {
        end = i
        const p = doc.pages[i]
        blocksTotal += p.blocks.length

        if (blocksTotal > 20) {
          if (!location.hash) {
            break
          } else if (location.hash && i > start) break
        }
      }
      const isFirstPageShown = start === 0
      const isLastPageShown = doc && end === (doc.pages.length - 1)
      //console.log('Slice: rowsTotal=', rowsTotal, ', start=', start, ', end=', end, 'isFirstPageShown=', isFirstPageShown, ', isLastPageShown=', isLastPageShown)
      setPagesSlice({
        start,
        end,
        isFirstPageShown,
        isLastPageShown
      })
    }
  }, [doc?.uid, doc?.pages.length, location.key])

  useEffect(() => {
    if (vm.searchFilter) {
      setTimeout(() => {
        const coll = document.getElementsByClassName('markdown')
        const rx = new RegExp('[\>][^\<\>]*' + vm.searchFilter, 'gim')
        if (coll) {
          for (let i = 0; i < coll.length; i++) {
            const el = coll[i]
            let text = el.innerHTML
            text = text.replace(rx, function(item, exp) {
              const subRegex = new RegExp(vm.searchFilter, 'gi')
              return item.replace(subRegex, '<mark>$&</mark>')
            })
            el.innerHTML = text
          }
        }
      }, 10)
    }
  })

  useEffect(() => {
    const coll = document.getElementsByClassName('markdown')
    if (coll) {
      for (let i = 0; i < coll.length; i++) {
        const el = coll[i]
        let text = el.innerHTML
        text = text.replace(/(<mark>|<\/mark>)/gim, '')
        el.innerHTML = text
      }
    }
  }, [vm.searchFilter])

  const showPrevPage = () => {
    if (doc && pagesSlice.start > 0) {
      const start = pagesSlice.start - 1
      const end = pagesSlice.end - start > 3 ? pagesSlice.end - 1 : pagesSlice.end

      const isFirstPageShown = true
      const isLastPageShown = end === (doc.pages.length - 1)
      window.scrollTo(0, 1)

      setTimeout(() => {
        setPagesSlice({
          start,
          end,
          isFirstPageShown,
          isLastPageShown
        })
      }, 2)

      setTimeout(() => {
        const isFirstPageShown = start === 0
        setPagesSlice({
          start,
          end,
          isFirstPageShown,
          isLastPageShown
        })
      }, 4)
    }
  }

  const showNextPage = () => {
    if (doc && pagesSlice.end < (doc.pages.length - 1)) {
      const end = pagesSlice.end + 1
      const start = end - pagesSlice.start > 3 ? pagesSlice.start + 1 : pagesSlice.start
      const isFirstPageShown = start === 0
      const isLastPageShown = end === (doc.pages.length - 1)
      setPagesSlice({
        start,
        end,
        isFirstPageShown,
        isLastPageShown
      })
    }
  }

  const scrollBack = () => {
    setPagesSlice({
      start: 0,
      end: 2,
      isFirstPageShown: true,
      isLastPageShown: (doc?.pages.length ?? 0) <= 3
    })
    window.scrollTo(0, 0)
  }

  if (doc?.loadStatus === DocLoadStatus.LOADING) {
    return <></>
  }

  if (!doc) {
    return <EmptyDoc msg="Doc not found"/>
  }

  vm.lastShownPage = doc.pages.length > 0 ? doc.pages.at(pagesSlice.end) : undefined

  return (
    <VStack valign="top" halign="center" gap="10px"
            width="100%"
            bgColor={theme.appBg}
            paddingHorizontal='0'
            paddingVertical="20px">

      {!pagesSlice.isFirstPageShown &&
        <Button onClick={showPrevPage}
                width='100%'
                maxWidth={MAX_CONTENT_WIDTH}
                height='45px'
                bgColor={theme.prevNextPageBtnBg + 'aa'}
                textColor={theme.white + 'cc'}
                hoverState={state => {
                  state.bgColor = theme.prevNextPageBtnBg
                }}>
          <span className="icon icon-prevPage"/>
          <span>  Previous Page</span>
        </Button>

      }

      {doc.pages.length > 0 &&
        doc.pages.slice(pagesSlice.start, pagesSlice.end + 1).map(page => {
          return <PageView key={page.uid} page={page}/>
        })
      }

      {doc.pages.length > 0 && !pagesSlice.isLastPageShown &&
        <Button onClick={showNextPage}
                width='100%'
                maxWidth={MAX_CONTENT_WIDTH}
                height='45px'
                bgColor={theme.prevNextPageBtnBg + 'aa'}
                textColor={theme.white + 'cc'}
                hoverState={state => {
                  state.bgColor = theme.prevNextPageBtnBg
                }}>
          <span className="icon icon-nextPage"/>
          <span>  Next Page</span>
        </Button>
      }

      {doc.pages.length > 0 && pagesSlice.isLastPageShown &&
        <HStack halign="stretch"
                valign="center"
                gap='10px'
                padding="8px"
                width="100%"
                maxWidth={MAX_CONTENT_WIDTH}>
          <Spacer/>

          <IconButton icon="scrollBack"
                      popUp="Scroll back"
                      onClick={scrollBack}/>
        </HStack>
      }
    </VStack>
  )
})

const PageView = observer(({ page }: { page: Page }) => {
  console.log('new PageView')
  observe(page)

  return (
    <VStack id={page.key}
            width="100%"
            maxWidth={MAX_CONTENT_WIDTH}
            halign="stretch"
            paddingBottom='50px'
            valign="top">
      <PageTitle page={page}/>
      {page.blocks.map(block => {
        return <PageBlockView key={block.uid} block={block}/>
      })}
    </VStack>
  )
})

const PageTitle = observer(({ page }: { page: Page }) => {
  const editTools = observeEditTools()
  const app = observeVM()
  const { theme } = useDocsContext()

  const isSelected = editTools.selectedPage === page
  let matchFilter = false
  if (app.searchFilter.length > 1) {
    const rx = new RegExp(app.searchFilter, 'gi')
    matchFilter = page.title.match(rx) !== null
  }

  const toggleSelection = () => {
    editTools.select(isSelected ? undefined : page)
  }

  if (editTools.editMode && isSelected) {
    return (<>
        <StylableContainer width="100%"
                           onMouseDown={toggleSelection}
                           bgColor={theme.selectedBlockBg}
                           borderLeft={['6px', 'solid', theme.red]}>
          <Label fontSize='2rem'
                 fontWeight='bold'
                 paddingVertical='5px'
                 textColor={theme.isLight ? theme.green : theme.header}
                 paddingHorizontal='34px'
                 bgColor={matchFilter ? theme.search : '0'}
                 text={page.title}/>
        </StylableContainer>
      </>
    )
  }

  if (editTools.editMode) {
    return <StylableContainer width="100%"
                              onMouseDown={toggleSelection}
                              hoverState={state => {
                                state.bgColor = theme.selectedBlockBg
                              }}>
      <Label fontSize='2rem'
             fontWeight='bold'
             textColor={theme.isLight ? theme.green : theme.header}
             paddingVertical='5px'
             paddingHorizontal='40px'
             bgColor={matchFilter ? theme.search : '0'}
             text={page.title}/>
    </StylableContainer>
  }

  return (
    <StylableContainer width="100%">
      <Label fontSize='2rem'
             fontWeight='bold'
             textColor={theme.isLight ? theme.green : theme.header}
             paddingVertical='5px'
             paddingHorizontal='40px'
             bgColor={matchFilter ? theme.search : '0'}
             text={page.title}/>
    </StylableContainer>
  )
})

const PageBlockView = observer(({ block }: { block: PageBlock }) => {
  console.log('new PageBlockView')
  const editTools = observeEditTools()
  observe(block)
  const { theme } = useDocsContext()

  const isSelected = editTools.selectedBlock === block

  const toggleSelection = (e: any) => {
    e.stopPropagation()
    editTools.select(isSelected ? undefined : block)
  }

  if (editTools.editMode && isSelected) {
    return (<>
        <StylableContainer className={theme.id}
                           minHeight="30px"
                           paddingRight="40px"
                           paddingLeft="34px"
                           width="100%"
                           onMouseDown={toggleSelection}
                           bgColor={theme.selectedBlockBg}
                           borderLeft={['6px', 'solid', theme.red]}>
          <MarkdownText value={block.text}/>
        </StylableContainer>
      </>
    )
  }

  if (editTools.editMode) {
    return <StylableContainer className={theme.id}
                              minHeight="30px"
                              paddingHorizontal="40px"
                              width="100%"
                              onMouseDown={toggleSelection}
                              hoverState={state => {
                                state.bgColor = theme.selectedBlockBg
                              }}>
      <MarkdownText value={block.text}/>
    </StylableContainer>
  }

  return (
    <StylableContainer className={theme.id}
                       minHeight="30px"
                       paddingHorizontal="40px"
                       width="100%">
      <MarkdownText value={block.text}/>
    </StylableContainer>
  )
})

const MarkdownText = stylable(({ value }: { value: string }) => {
  const { theme } = useDocsContext()
  useEffect(() => {
    console.log('--Prism.highlightAll')
    Prism.highlightAll()
  }, [value])
  return <div className={theme.id}>
    <ReactMarkdown className={'markdown ' + theme.id} key={value}>{value}</ReactMarkdown>
  </div>
})
