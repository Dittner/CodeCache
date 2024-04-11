export interface RequestBody {
  serialize: () => string
}

export class DirDto implements RequestBody {
  title: string
  constructor(title: string) {
    this.title = title
  }

  serialize() {
    return JSON.stringify(this)
  }
}

export class DocDto implements RequestBody {
  title: string
  pages: PageDto[]
  constructor(title: string, pages: PageDto[]) {
    this.title = title
    this.pages = pages
  }

  serialize() {
    return JSON.stringify(this)
  }
}

export class PageDto implements RequestBody {
  title: string
  blocks: string[]
  constructor(title: string, blocks: string[]) {
    this.title = title
    this.blocks = blocks
  }

  serialize() {
    return JSON.stringify(this)
  }
}
