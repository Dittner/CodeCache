import React, { useEffect, useLayoutEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
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
import { AppSize, LayoutLayer } from '../../global/application/Application'
import { observer } from 'react-observable-mutations'
import { useDocsContext } from '../../App'
import { TextEditor } from '../../global/ui/common/Input'
import { VSeparator } from '../../global/ui/common/Separator'
import { observeApp } from '../../global/GlobalContext'
import { themeManager } from '../../global/application/ThemeManager'
import { useNavigate } from 'react-router-dom'
import { HStack, Label, Spacer, VStack, stylable } from 'react-nocss'
import { NavBar } from '../../global/ui/common/NavBar'

function useWindowPosition(limit: number = -1): number {
  const [scrollPosition, setPosition] = useState(window.scrollY)
  useLayoutEffect(() => {
    const handler = () => {
      let updatePosition = limit === -1
      updatePosition = updatePosition || (scrollPosition < limit && window.scrollY > limit && scrollPosition !== window.scrollY)
      updatePosition = updatePosition || (scrollPosition > limit && window.scrollY < limit && scrollPosition !== window.scrollY)
      if (updatePosition) setPosition(window.scrollY)
    }
    window.addEventListener('scroll', handler)
    return () => {
      window.removeEventListener('scroll', handler)
    }
  }, [scrollPosition, limit])
  return scrollPosition
}

export const IntroPage = observer(() => {
  const app = observeApp()
  const theme = themeManager.theme

  const SCROLL_POS_LIMIT = 600
  const scrollPosition = useWindowPosition(SCROLL_POS_LIMIT)
  console.log('new IntroPage, scrollPosition: ', scrollPosition)

  let headerFontSize = ''
  switch (app.size) {
    case AppSize.XS:
      headerFontSize = '30px'
      break
    case AppSize.S:
      headerFontSize = '60px'
      break
    case AppSize.M:
      headerFontSize = '65px'
      break
    case AppSize.L:
      headerFontSize = '70px'
      break
  }

  const funcColor = '#a06a9d'
  const highlightColor = '#416fb3'
  const stringColor = '#5e929d'
  const yourNotesColor = '#5b6269'
  const symbolsColor = '#5b6269'

  return <VStack maxWidth="100%"
                 width="100%"
                 height="100%"
                 halign="center"
                 valign="center"
                 gap="0"
                 disableHorizontalScroll>

    <NavBar showAllTabs/>

    <VStack width='100%' minHeight='100vh'
            halign='center' valign='center'
            bgColor={theme.isLight ? theme.text + '10' : theme.pink + '10'}>
      <Label fontFamily='ibm'
             fontSize={headerFontSize}
             fontWeight='800'
             whiteSpace="pre"
             opacity='0.85'
             letterSpacing='-1.5px'
             lineHeight='1.45'
             textAlign='left'
             paddingTop="20px"
             paddingBottom='20px'
             layer={LayoutLayer.ONE}>
        <span style={{ color: funcColor }}>{'              func\n'}</span>
        <span style={{ color: highlightColor }}>{'      highlight\n'}</span>
        <span style={{ color: symbolsColor }}>{'('}</span>
        <span style={{ color: yourNotesColor }}>yourNotes</span>
        <span style={{ color: symbolsColor }}>{':\n           ['}</span>
        <span style={{ color: stringColor }}>String</span>
        <span style={{ color: symbolsColor }}>{'])'}</span>
      </Label>

      <Label className='ibm'
             fontSize='0.9rem'
             whiteSpace='pre'
             padding='20px'
             text={app.size === AppSize.XS ? aboutTxtXS : aboutTxt}
             textColor={theme.text}
             layer={LayoutLayer.ONE}/>

    </VStack>

    <VStack halign="stretch"
            valign="top"
            maxWidth="1800px"
            padding="2rem"
            layer={LayoutLayer.ONE}>

      <Label className="h1"
             text="Examples of Markdown formatting"
             textColor={theme.text}
             paddingVertical="25px"
             layer={LayoutLayer.ONE}/>

      <MarkdownEditor text={headings} title="0.Headings, font style"/>
      <MarkdownEditor text={blockquote} title="1.Blockquote"/>
      <MarkdownEditor text={code} title="2.Code"/>
      <MarkdownEditor text={lists} title="3.Lists"/>
      <MarkdownEditor text={links} title="4.Links"/>
      <MarkdownEditor text={shortcuts} secondMarkdownText={languages} title="5.Editor"/>
    </VStack>

    <Label className="mono"
           width='100%'
           opacity='0.5'
           textAlign='center'
           padding='2rem'
           text={(app.isMobileDevice ? 'Mobile ' : 'Desktop ') + app.size}
           fontSize="10px"
           textColor={theme.black}
           layer={LayoutLayer.ONE}/>
  </VStack>
})

const aboutTxt = `*                                                       *                           
*   Designed by developers for developers               *   ========================
*   This is a web-solution, that enables you to make    *   MODE  |  VER   |  YEAR  
*   notes using a markdown-editor. Markdown helps       *   ––––––––––––––––––––––––
*   to format notes and code fragments easily without   *   Demo  |  5.01  |  2024  
*   having to write a plane text or HTML tags.          *   ========================
*                                                       *                           `

const aboutTxtXS = `
*                                               
*  Designed by developers for developers        
*  This is a web-solution, that enables you to  
*  helps to format notes and code fragments     
*  make notes using a markdown-editor. Markdown 
*  easily without having to write a plane text  
*  or HTML tags.                                
*                                               
*  –––––––––––––––––––––––––––––––––––––––––    
*  MODE: Demo  |  VER: 5.01  |  YEAR: 2024      
*  –––––––––––––––––––––––––––––––––––––––––    
*                                               
`

const headings = `# HAL 9000
## Heuristically Programmed Algorithmic Computer
### Created by Dr. Chandra
#### Urbana, Illinois

***

##### _HAL's mission_
_HAL_ is a sentient artificial general intelligence computer that controls the systems of the _Discovery One_ spacecraft and interacts with the ship's astronaut crew.`

const blockquote = `> «Sorry to interrupt the festivities, Dave, but I think we’ve got a problem.»
>
>__HAL 9000__`

const lists = `## Daisy Bell
+ Daisy...
+ Daisy...
+ Daisy...
    + Give me your answer, do...
    + I'm.. half... crazy...
    + All for the love... of you...`

const languages = `## Supported languages\n
+ C: \`c\`\n
+ C++: \`cpp\`\n
+ C#: \`csharp, cs, dotnet\`\n
+ CSS: \`css\`\n
+ HTML: \`html\`\n
+ Java: \`java\`\n
+ JavaScript: \`js, jsx\`\n
+ JSON: \`json\`\n
+ Kotlin: \`kotlin, kt\`\n
+ Python: \`py\`\n
+ Swift: \`swift\`\n
+ TypeScript: \`ts, tsx\`\n
+ XML: \`xml\``

const shortcuts = `## Shortcuts\n
+ Toggle edit mode: \`Ctrl + Shift + E\`
+ Apply code changes: \`Shift + Enter\`\n
+ Format code: \`Ctrl + Shift + L\`
+ Create a new page's block: \`Ctrl + Shift + B\`
+ Save changes: \`Ctrl + Shift + S\``

const code = `## Memoization
Memoization is an optimization technique based on remembering the results returned by a function called with the same arguments.
\`\`\`js
const memoize = (fn) => {
  const argKey = (x) => x.toString() + ':' + typeof x
  const generateKey = (args) => args.map(argKey).join('|')
  const cache = Object.create(null)

  return (...args) => {
    const key = generateKey(args)
    if (!cache[key]) cache[key] = fn(...args)
    return cache[key]
  }
}

const calc = (x, y, op) => { return x + y }
const exc = memoize(calc)
exc(2, 1, '+') //3, calculated
exc(2, 1, '+') //3, returned from cache
\`\`\``

const links = `## Much more info:
* [React-Markdown](https://remarkjs.github.io/react-markdown/)
* [Markdown basic syntax](https://www.markdownguide.org/basic-syntax/)
* [Source Code (GitHub)](https://github.com/dittner/CodeIndex)`

interface MarkdownEditorProps {
  text: string
  title: string
  autoFocus?: boolean
  secondMarkdownText?: string
}

const MarkdownEditor = observer((props: MarkdownEditorProps) => {
  const app = observeApp()
  const theme = themeManager.theme

  console.log('new MarkdownEditor')
  const [value, setValue] = useState(props.text)
  const apply = (newValue: string) => {
    if (value !== newValue) {
      setValue(newValue)
    }
  }

  const cancel = () => {
    console.log('cancel')
  }

  if (app.size === AppSize.S || app.size === AppSize.XS) {
    return (
      <VStack halign="stretch"
              valign="top"
              gap="10px"
              width="100%"
              layer={LayoutLayer.ONE}>

        <Label text={props.title}
               textColor={theme.text50}
               whiteSpace="pre"
               paddingLeft="25px"
               minWidth="150px"/>

        {props.secondMarkdownText &&
          <MarkdownText value={props.secondMarkdownText}
                        paddingLeft="25px"
                        width="100%"/>
        }

        {!props.secondMarkdownText &&
          <TextEditor className="mono"
                      text={value}
                      paddingHorizontal="25px"
                      paddingVertical="20px"
                      onApply={apply}
                      onCancel={cancel}
                      autoFocus={props.autoFocus}/>
        }

        <HStack halign="left"
                valign="stretch"
                paddingLeft="25px"
                paddingRight="20px">

          {value &&
            <MarkdownText value={value}
                          width="100%"/>
          }
        </HStack>

        <Spacer height="50px"/>
      </VStack>
    )
  }

  return (
    <>
      <Label text={props.title}
             textColor={theme.text50}
             whiteSpace="pre"
             paddingLeft="25px"
             minWidth="150px"/>

      <HStack halign="stretch"
              valign="stretch"
              gap="50px">
        {props.secondMarkdownText &&
          <MarkdownText value={props.secondMarkdownText}
                        width="50%"/>
        }

        {!props.secondMarkdownText &&
          <TextEditor className="mono"
                      text={value}
                      paddingHorizontal="25px"
                      paddingVertical="20px"
                      onApply={apply}
                      onCancel={cancel}
                      autoFocus={props.autoFocus}
                      width="50%"/>
        }

        <VSeparator/>

        <MarkdownText value={value}
                      width="50%"/>
      </HStack>

      <Spacer height="50px"/>
    </>
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
