import { Route, Routes, useParams, useNavigate } from 'react-router-dom'
import { DocLoadStatus, type Page } from '../domain/DocsModel'
import { observeVM, observeDirList } from '../DocsContext'
import { observe, observer } from 'react-observable-mutations'
import { useDocsContext } from '../../App'
import { stylable, Label, VStack } from 'react-nocss'

export const DocTopics = stylable(() => {
  return <Routes>
    <Route path="/" element={<EmptyDocTopicsView/>}/>
    <Route path=":docTitle" element={<DocTopicsView/>}/>
  </Routes>
})

const EmptyDocTopicsView = () => {
  return <VStack width="100%"/>
}

const DocTopicsView = observer(() => {
  console.log('new DocTopicsView')
  const dirList = observeDirList()
  const params = useParams()
  const doc = dirList.findDoc(d => params.docTitle === d.title)
  if (!doc || doc.loadStatus === DocLoadStatus.LOADING) {
    return <EmptyDocTopicsView/>
  }

  observe(doc)

  return (
    <VStack halign="left" valign="top" gap="0"
            width="100%" height='100%'
            paddingHorizontal="10px" paddingTop="5px">
      {doc.pages.map(page => {
        return <TopicLink key={page.uid}
                          page={page}/>
      })}
    </VStack>
  )
})

interface TopicLinkProps {
  page: Page
}

const TopicLink = observer((props: TopicLinkProps) => {
  const app = observeVM()
  const page = observe(props.page)
  const { theme } = useDocsContext()
  const navigate = useNavigate()
  const showPage = (pageKey: string) => {
    navigate(`${pageKey}`)
  }
  //return <NavLink className={className} to={page.key}>{page.title}</NavLink>
  return <Label textColor={page.includes(app.searchFilter) ? theme.link : theme.text50}
                text={page.title}
                textAlign="left"
                lineHeight='1.4'
                btnCursor
                width="100%"
                hoverState={state => {
                  state.textColor = theme.linkHover
                }}
                onClick={() => {
                  showPage(page.key)
                }}/>
})
