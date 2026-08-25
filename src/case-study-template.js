const DEFAULT_CONTACT = {
  label: 'GET IN TOUCH',
  href: 'mailto:YOUR_EMAIL',
  brand: 'THE ALTERNATE CLOUD',
  links: []
}

let removeCaseHeaderScroll = null
let removeCaseHeaderMenuResize = null

function createElement(tag, className, attributes = {}) {
  const element = document.createElement(tag)

  if (className) element.className = className

  Object.entries(attributes).forEach(([name, value]) => {
    if (value === undefined || value === null) return

    if (name === 'text') {
      element.textContent = value
      return
    }

    element.setAttribute(name, value)
  })

  return element
}

function appendText(element, text) {
  if (!text) return element

  text.split('\n').forEach((line, index) => {
    if (index > 0) element.append(document.createElement('br'))
    element.append(document.createTextNode(line))
  })

  return element
}

function createMedia(media, className = '') {
  const figure = createElement(
    'figure',
    ['case-media', className].filter(Boolean).join(' ')
  )

  if (media.ratio) {
    figure.style.setProperty('--media-ratio', media.ratio)
  }

  const image = createElement('img', 'case-media__image', {
    src: media.src,
    alt: media.alt || '',
    loading: media.loading || 'lazy',
    decoding: 'async'
  })

  if (media.fit) image.style.objectFit = media.fit
  if (media.position) image.style.objectPosition = media.position

  figure.append(image)

  if (media.caption) {
    figure.append(
      createElement('figcaption', 'case-media__caption', {
        text: media.caption
      })
    )
  }

  return figure
}

function createStatementBlock(block) {
  const section = createElement(
    'section',
    `case-block case-statement case-statement--${block.align || 'left'}`
  )

  const statement = createElement(
    'blockquote',
    'case-statement__text'
  )

  appendText(statement, block.text)
  section.append(statement)

  if (block.attribution) {
    section.append(
      createElement('p', 'case-statement__attribution', {
        text: block.attribution
      })
    )
  }

  return section
}

function createTextBlock(block) {
  const section = createElement(
    'section',
    [
      'case-block',
      'case-copy',
      `case-copy--${block.align || 'left'}`,
      block.width ? `case-copy--${block.width}` : ''
    ].filter(Boolean).join(' ')
  )

  if (block.eyebrow) {
    section.append(
      createElement('p', 'case-copy__eyebrow', {
        text: block.eyebrow
      })
    )
  }

  const body = createElement('p', 'case-copy__body')

  appendText(body, block.text)
  section.append(body)

  return section
}

function createMediaBlock(block) {
  const section = createElement(
    'section',
    [
      'case-block',
      'case-media-block',
      `case-media-block--${block.size || 'medium'}`,
      block.align ? `case-media-block--${block.align}` : ''
    ].filter(Boolean).join(' ')
  )

  section.append(createMedia(block))

  return section
}

function createGalleryBlock(block) {
  const section = createElement(
    'section',
    [
      'case-block',
      'case-gallery',
      `case-gallery--${block.size || 'wide'}`
    ].join(' ')
  )

  section.style.setProperty(
    '--gallery-columns',
    block.columns || 2
  )

  block.items.forEach((item) => {
    const media = createMedia(
      item,
      'case-gallery__item'
    )

    if (item.span) {
      media.style.setProperty(
        '--gallery-span',
        item.span
      )
    }

    section.append(media)
  })

  return section
}

function createSpacerBlock(block) {
  const spacer = createElement('div', 'case-block case-spacer', {
    'aria-hidden': 'true'
  })

  spacer.style.setProperty('--space', block.size || '10rem')
  return spacer
}

function createCaseBlock(block) {
  switch (block.type) {
    case 'statement':
      return createStatementBlock(block)
    case 'text':
      return createTextBlock(block)
    case 'media':
      return createMediaBlock(block)
    case 'gallery':
      return createGalleryBlock(block)
    case 'spacer':
      return createSpacerBlock(block)
    default:
      throw new Error(`Unknown case-study block type: ${block.type}`)
  }
}

function createMetadataList(items = []) {
  const list = createElement('dl', 'case-intro__metadata')

  items.forEach((item) => {
    const group = createElement('div', 'case-intro__metadata-group')

    group.append(
      createElement('dt', 'case-intro__metadata-label', {
        text: item.label
      }),
      createElement('dd', 'case-intro__metadata-value', {
        text: Array.isArray(item.value)
          ? item.value.join('\n')
          : item.value
      })
    )

    list.append(group)
  })

  return list
}

function createHeader(study, onBack, onNavigate) {
  const header = createElement('header', 'case-header')

  const brand = createElement('button', 'case-header__brand', {
    type: 'button',
    text: study.brand || 'THE ALTERNATE CLOUD',
    'aria-label': 'Return to selected work'
  })

  brand.addEventListener('click', () => onBack?.())
  header.append(brand)

  /*
   * Desktop navigation
   */
  if (study.headerLinks?.length) {
    const desktopNav = createElement(
      'nav',
      'case-header__nav',
      {
        'aria-label': 'Case study navigation'
      }
    )

    study.headerLinks.forEach((item) => {
      const targetPage =
        item.page || item.label.toLowerCase()

      const control = onNavigate
        ? createElement('button', 'case-header__link', {
            type: 'button',
            text: item.label,
            'data-case-page': targetPage
          })
        : createElement('a', 'case-header__link', {
            href: item.href || `#${targetPage}`,
            text: item.label
          })

      if (onNavigate) {
        control.addEventListener('click', () => {
          onNavigate(targetPage)
        })
      }

      desktopNav.append(control)
    })

    header.append(desktopNav)
  }

  /*
   * Mobile full-screen menu
   */
  const mobilePages = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Work', page: 'work' },
    { label: 'Contact', page: 'contact' }
  ]

  const safeSlug = (study.slug || 'project')
    .replace(/[^a-z0-9-_]/gi, '-')

  const menuId = `case-menu-${safeSlug}`

  const menuToggle = createElement(
    'button',
    'case-header__menu-toggle',
    {
      type: 'button',
      'aria-label': 'Open menu',
      'aria-expanded': 'false',
      'aria-controls': menuId
    }
  )

  for (let index = 0; index < 3; index += 1) {
    menuToggle.append(
      createElement('span', 'case-header__menu-line', {
        'aria-hidden': 'true'
      })
    )
  }

  const mobileMenu = createElement(
    'nav',
    'case-menu',
    {
      id: menuId,
      'aria-label': 'Mobile navigation',
      'aria-hidden': 'true'
    }
  )

  const menuList = createElement(
    'div',
    'case-menu__list'
  )

  const mobileControls = []
  let isMenuOpen = false

  function setMenuOpen(open, restoreFocus = true) {
    isMenuOpen = open

    header.classList.toggle('is-menu-open', open)
    document.body.classList.toggle(
      'is-case-menu-open',
      open
    )

    menuToggle.setAttribute(
      'aria-expanded',
      String(open)
    )

    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close menu' : 'Open menu'
    )

    mobileMenu.setAttribute(
      'aria-hidden',
      String(!open)
    )

    if (open) {
      requestAnimationFrame(() => {
        mobileControls[0]?.focus()
      })
    } else if (restoreFocus) {
      menuToggle.focus()
    }
  }

  mobilePages.forEach((item) => {
    const control = onNavigate
      ? createElement('button', 'case-menu__link', {
          type: 'button',
          text: item.label,
          'data-case-page': item.page
        })
      : createElement('a', 'case-menu__link', {
          href: `#${item.page}`,
          text: item.label
        })

    if (onNavigate) {
      control.addEventListener('click', () => {
        setMenuOpen(false, false)
        onNavigate(item.page)
      })
    }

    mobileControls.push(control)
    menuList.append(control)
  })

  mobileMenu.append(menuList)

  menuToggle.addEventListener('click', () => {
    setMenuOpen(!isMenuOpen)
  })

  const desktopMenuBreakpoint = window.matchMedia(
    '(min-width: 1200px)'
  )

  function handleMenuBreakpoint(event) {
    if (!header.isConnected) {
      desktopMenuBreakpoint.removeEventListener(
        'change',
        handleMenuBreakpoint
      )
      return
    }

    if (event.matches && isMenuOpen) {
      setMenuOpen(false, false)
    }
  }

  desktopMenuBreakpoint.addEventListener(
    'change',
    handleMenuBreakpoint
  )

  removeCaseHeaderMenuResize = () => {
    desktopMenuBreakpoint.removeEventListener(
      'change',
      handleMenuBreakpoint
    )

    if (isMenuOpen) {
      setMenuOpen(false, false)
    }
  }

  /*
   * Escape closes the menu. Tab remains inside it.
   */
  header.addEventListener('keydown', (event) => {
    if (!isMenuOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setMenuOpen(false)
      return
    }

    if (event.key !== 'Tab') return

    const focusable = [
      menuToggle,
      ...mobileControls
    ]

    const firstControl = focusable[0]
    const lastControl =
      focusable[focusable.length - 1]

    if (
      event.shiftKey &&
      document.activeElement === firstControl
    ) {
      event.preventDefault()
      lastControl.focus()
    } else if (
      !event.shiftKey &&
      document.activeElement === lastControl
    ) {
      event.preventDefault()
      firstControl.focus()
    }
  })

  header.append(menuToggle, mobileMenu)

  return header
}

function createIntro(study) {
  const intro = createElement('section', 'case-intro')
  intro.classList.add('is-collapsed')

  const titleColumn = createElement('div', 'case-intro__title-column')
  const details = createElement('div', 'case-intro__details')
  details.classList.add('is-collapsed')
  const title = createElement('h1', 'case-intro__title')
  let toggle = null

  appendText(title, study.title)
  titleColumn.append(title)

  if (study.subtitle) {
    titleColumn.append(
      createElement('p', 'case-intro__subtitle', {
        text: study.subtitle
      })
    )
  }

  if (study.summary) {
    const detailsId = `case-details-${study.slug || 'project'}`
    details.id = detailsId

    toggle = createElement('button', 'case-intro__toggle', {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': detailsId
    })
    const toggleLabel = createElement('span', 'case-intro__toggle-label', {
      text: 'About the project'
    })
    const toggleIcon = createElement('span', 'case-intro__toggle-icon', {
      text: '+',
      'aria-hidden': 'true'
    })
    const summaryPanel = createElement('div', 'case-intro__summary-panel')
    const summaryInner = createElement('div', 'case-intro__summary-inner')
    const summary = createElement('div', 'case-intro__summary')

    appendText(summary, study.summary)
    summaryInner.append(summary)
    summaryPanel.append(summaryInner)
    toggle.append(toggleLabel, toggleIcon)

    details.append(summaryPanel)
  }

  details.append(createMetadataList(study.metadata))
  intro.append(titleColumn)

  if (toggle) intro.append(toggle)

  intro.append(details)
  return intro
}

function createNextProject(nextProject, onNext) {
  if (!nextProject) return null

  const section = createElement('section', 'case-next')
  const label = createElement('p', 'case-next__label', {
    text: 'Next project'
  })
  const link = createElement('a', 'case-next__link', {
    href: nextProject.href || '#',
    'aria-label': `Open next project: ${nextProject.title}`
  })

  if (onNext) {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      onNext(nextProject)
    })
  }

  link.append(
    createMedia({
      src: nextProject.image,
      alt: nextProject.imageAlt || nextProject.title,
      loading: 'lazy',
      ratio: nextProject.ratio || '16 / 7'
    }, 'case-next__media')
  )

  const caption = createElement('div', 'case-next__caption')
  caption.append(
    createElement('span', 'case-next__client', {
      text: nextProject.client
    }),
    createElement('strong', 'case-next__title', {
      text: nextProject.title
    })
  )
  link.append(caption)
  section.append(label, link)

  return section
}

function createContactFooter(contact = DEFAULT_CONTACT) {
  const settings = { ...DEFAULT_CONTACT, ...contact }
  const footer = createElement('footer', 'case-contact')
  const cta = createElement('a', 'case-contact__cta', {
    href: settings.href
  })

  cta.append(
    document.createTextNode(settings.label),
    createElement('span', 'case-contact__arrow', {
      text: '→',
      'aria-hidden': 'true'
    })
  )

  const identity = createElement('div', 'case-contact__identity')
  identity.append(
    createElement('span', 'case-contact__brand', {
      text: settings.brand
    })
  )

  settings.links.forEach((item) => {
    identity.append(
      createElement('a', 'case-contact__social', {
        href: item.href,
        text: item.label,
        'aria-label': item.ariaLabel || item.label,
        target: item.external ? '_blank' : null,
        rel: item.external ? 'noreferrer' : null
      })
    )
  })

  footer.append(cta, identity)
  return footer
}

function findCaseViewportAnchor(content) {
  const blocks = Array.from(
    content.querySelectorAll('.case-block')
  )

  const targetLine = window.innerHeight * 0.35

  return blocks.find((block) => {
    const rect = block.getBoundingClientRect()

    return (
      rect.bottom >= targetLine &&
      rect.top <= window.innerHeight
    )
  }) || content
}

function holdCaseViewportAnchor(
  anchor,
  originalTop,
  duration = 780
) {
  const startTime = performance.now()

  function update(currentTime) {
    if (!anchor?.isConnected) return

    const currentTop =
      anchor.getBoundingClientRect().top

    const difference = currentTop - originalTop

    if (Math.abs(difference) > 0.5) {
      window.scrollBy(0, difference)
    }

    if (currentTime - startTime < duration) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

export function createCaseStudy(study, options = {}) {
  if (!study?.title || !Array.isArray(study.sections)) {
    throw new Error('A case study needs a title and a sections array.')
  }

  const page = createElement('main', 'case-study', {
    'data-case-study': study.slug || ''
  })
const article = createElement('article', 'case-study__article')
const content = createElement('div', 'case-study__content')
const intro = createIntro(study)

const projectToggle = intro.querySelector('.case-intro__toggle')
const projectDetails = intro.querySelector('.case-intro__details')

let projectPanel = null

if (projectToggle && projectDetails) {
  projectPanel = createElement(
    'aside',
    'case-study__project-panel',
    {
      'aria-label': 'About the project'
    }
  )

projectToggle.addEventListener('click', () => {
  const anchor = findCaseViewportAnchor(content)
  const anchorTop = anchor.getBoundingClientRect().top

  const willExpand =
    projectToggle.getAttribute('aria-expanded') !== 'true'

  const toggleIcon = projectToggle.querySelector(
    '.case-intro__toggle-icon'
  )

  projectToggle.setAttribute(
    'aria-expanded',
    String(willExpand)
  )

  if (toggleIcon) {
    toggleIcon.textContent = willExpand ? '\u2212' : '+'
  }

  intro.classList.toggle(
    'is-collapsed',
    !willExpand
  )

  projectDetails.classList.toggle(
    'is-collapsed',
    !willExpand
  )

  article.classList.toggle(
    'is-project-expanded',
    willExpand
  )

  if (willExpand && projectPanel) {
    projectPanel.scrollTop = 0
  }

  holdCaseViewportAnchor(
    anchor,
    anchorTop
  )
})
  projectPanel.append(projectToggle, projectDetails)
}

content.append(intro)

study.sections.forEach((block) => {
  content.append(createCaseBlock(block))
})

if (projectPanel) {
  article.append(projectPanel)
}

article.append(content)

  page.append(
    createHeader(study, options.onBack, options.onNavigate),
    article
  )

  const nextProject = createNextProject(
    study.nextProject,
    options.onNext
  )

  if (nextProject) page.append(nextProject)

  const footer = options.createFooter?.()
    || createContactFooter(study.contact)

  page.append(footer)

  return page
}

function enableCaseHeaderScroll(page) {
  const header = page.querySelector('.case-header')

  if (!header) return () => {}

  let lastScrollY = window.scrollY
  let currentDirection = 0
  let travelledDistance = 0
  let animationFrame = 0

  header.classList.add('is-visible')

  function updateHeader() {
    animationFrame = 0

    if (!header.isConnected) {
      cleanup()
      return
    }

    const currentScrollY = Math.max(window.scrollY, 0)
    const difference = currentScrollY - lastScrollY
    const nextDirection = Math.sign(difference)

    if (
      nextDirection !== 0 &&
      nextDirection !== currentDirection
    ) {
      currentDirection = nextDirection
      travelledDistance = 0
    }

    travelledDistance += Math.abs(difference)

    if (currentScrollY <= 16) {
      header.classList.add('is-visible')
    } else if (
      currentDirection < 0 &&
      travelledDistance >= 8
    ) {
      header.classList.add('is-visible')
      travelledDistance = 0
    } else if (
      currentDirection > 0 &&
      travelledDistance >= 16
    ) {
      header.classList.remove('is-visible')
      travelledDistance = 0
    }

    lastScrollY = currentScrollY
  }

  function handleScroll() {
    if (!animationFrame) {
      animationFrame =
        requestAnimationFrame(updateHeader)
    }
  }

  function cleanup() {
    window.removeEventListener('scroll', handleScroll)

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }

  window.addEventListener('scroll', handleScroll, {
    passive: true
  })

  return cleanup
}

export function mountCaseStudy(container, study, options = {}) {
  removeCaseHeaderScroll?.()
  removeCaseHeaderScroll = null

  removeCaseHeaderMenuResize?.()
  removeCaseHeaderMenuResize = null

  const page = createCaseStudy(study, options)

  container.replaceChildren(page)
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  removeCaseHeaderScroll = enableCaseHeaderScroll(page)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      page.classList.add('is-visible')
    })
  })

  return page
}
