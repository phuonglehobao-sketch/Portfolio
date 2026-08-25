import './case-study-template.css'

const yasmunCoverUrl = new URL(
  './assets/Youth-Ascendency-Model-Cover.png',
  import.meta.url
).href

const handHeartCoverUrl = new URL(
  './assets/HAND-and-HEART-cover.png',
  import.meta.url
).href

const handHeartCharacterSystemUrl = new URL(
  './assets/heart-and-hand/02-character-system.png',
  import.meta.url
).href

const handHeartCampaignUrl = new URL(
  './assets/heart-and-hand/03-campaign-applications.png',
  import.meta.url
).href

const handHeartSocialUrl = new URL(
  './assets/heart-and-hand/04-social-and-merchandise.png',
  import.meta.url
).href

const handHeartBillboardUrl = new URL(
  './assets/heart-and-hand/05-billboard.png',
  import.meta.url
).href

const traDaMentorCoverUrl = new URL(
  './assets/Tra-Da-Mentor-cover.png',
  import.meta.url
).href

const traDaHomepageUrl = new URL(
  './assets/tra-da-mentor/01-homepage.png',
  import.meta.url
).href

const traDaResponsiveSystemUrl = new URL(
  './assets/tra-da-mentor/02-responsive-system.png',
  import.meta.url
).href

const traDaCmsSystemUrl = new URL(
  './assets/tra-da-mentor/03-cms-system.png',
  import.meta.url
).href

const traDaPageSystemUrl = new URL(
  './assets/tra-da-mentor/04-page-system.png',
  import.meta.url
).href

const traDaResponsivePagesUrl = new URL(
  './assets/tra-da-mentor/05-responsive-pages.png',
  import.meta.url
).href

const heroUrl = new URL(
  './assets/yasmun/01-hero.jpg',
  import.meta.url
).href

const screensUrl = new URL(
  './assets/yasmun/02-screens.jpg',
  import.meta.url
).href

const stickersUrl = new URL(
  './assets/yasmun/03-stickers.jpg',
  import.meta.url
).href

const recruitmentLeftUrl = new URL(
  './assets/yasmun/04-recruitment-left.jpg',
  import.meta.url
).href

const recruitmentRightUrl = new URL(
  './assets/yasmun/05-recruitment-right.jpg',
  import.meta.url
).href

const identitySystemUrl = new URL(
  './assets/yasmun/07-identity-system.png',
  import.meta.url
).href

const shirtUrl = new URL(
  './assets/yasmun/08-shirt.jpg',
  import.meta.url
).href

const flagUrl = new URL(
  './assets/yasmun/09-flag.png',
  import.meta.url
).href

const emblemUrl = new URL(
  './assets/yasmun/10-emblem.jpg',
  import.meta.url
).href

const objectsUrl = new URL(
  './assets/yasmun/11-objects.png',
  import.meta.url
).href

const overviewUrl = new URL(
  './assets/yasmun/12-overview.png',
  import.meta.url
).href

const certificateUrl = new URL(
  './assets/yasmun/13-certificate.png',
  import.meta.url
).href

const businessCardUrl = new URL(
  './assets/yasmun/14-business-card.jpg',
  import.meta.url
).href

const yasmunCaseStudy = {
  slug: 'yasmun-visual-identity',
  brand: 'THE ALTERNATE CLOUD',
  headerLinks: [
    { label: 'Work', page: 'work' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' }
  ],
  title: 'a bridge between credibility and trust.',
  subtitle: 'A visual identity for a student Model United Nations conference—credible enough for institutions, expressive enough for its delegates.',
  summary:
  'YASMUN introduces high school and university students to diplomacy through committee simulations, negotiation and debate. While the conference carries the prestige associated with Model United Nations, it also serves as an entry point for hundreds of first-time delegates each year.\n\nTraditional MUN branding often emphasizes formality and authority. Our challenge was to preserve that credibility while making the conference feel more welcoming to students encountering diplomacy for the first time.\n\nThe identity pairs expressive typography with a restrained structural system. Paint strokes introduce energy while modular layouts maintain consistency across applications.\n\nThe identity pairs expressive typography with a restrained structural system. Paint strokes introduce energy while modular layouts maintain consistency across applications.',

metadata: [
  {
    label: 'Client',
    value: 'Youth Ascendency Model United Nations (YASMUN)'
  },
  {
    label: 'Sector',
    value: 'Education'
  },
  {
    label: 'Role',
    value: 'Visual Identity Designer'
  },
  {
    label: 'Audience',
    value: [
      'High school and university students',
      'First-time MUN delegates'
    ]
  },
  {
    label: 'Responsibilities',
    value: [
      'Brand Identity',
      'Campaign Visual System',
      'Creative Direction',
      'Marketing Assets'
    ]
  },
  {
    label: 'Timeline',
    value: '2024–2025'
  },
  {
    label: 'Team',
    value: [
      'Organizing Committee',
      'Marketing Team'
    ]
  }
],
  sections: [
  {
    type: 'media',
    src: heroUrl,
    alt: 'YASMUN conference identity displayed on a large screen',
    size: 'wide',
    ratio: '1840 / 1106',
    loading: 'eager'
  },
  {
    type: 'statement',
    align: 'right',
    text:
      '“Model United Nations are traditionally perceived as formal, academic and prestigious—as reflected by many of our campaigns.\n\nWe want to change that image.”'
  },
  {
    type: 'media',
    src: screensUrl,
    alt: 'YASMUN digital campaign screens',
    size: 'wide',
    ratio: '1840 / 1148'
  },
  {
    type: 'media',
    src: stickersUrl,
    alt: 'YASMUN sticker collection',
    size: 'wide',
    ratio: '1840 / 1179'
  },
  {
    type: 'text',
    align: 'right',
    width: 'narrow',
    text:
      'The first explorations asked how expressive a Model United Nations identity could become before it stopped feeling trustworthy. Distorted typography and neon gradients became a way of locating that boundary.'
  },
  {
    type: 'gallery',
    columns: 2,
    size: 'wide',
    items: [
      {
        src: recruitmentLeftUrl,
        alt: 'YASMUN member recruitment poster',
        ratio: '911 / 935'
      },
      {
        src: recruitmentRightUrl,
        alt: 'YASMUN member recruitment portrait',
        ratio: '911 / 935'
      }
    ]
  },
  {
    type: 'statement',
    align: 'right',
    text:
      '“Rather than imitating diplomatic tradition, the identity reflected the next generation of delegates entering it.”'
  },
  {
    type: 'media',
    src: identitySystemUrl,
    alt: 'YASMUN logo, typography and identity system',
    size: 'wide',
    ratio: '1840 / 3459'
  },
  {
    type: 'text',
    align: 'right',
    width: 'narrow',
    text:
      'YASMUN introduces high-school and university students to diplomacy. The conference attracts hundreds of first-time delegates every year, making accessibility as important as credibility.'
  },
  {
    type: 'media',
    src: shirtUrl,
    alt: 'YASMUN campaign shirt',
    size: 'wide',
    ratio: '1840 / 1049'
  },
  {
    type: 'gallery',
    columns: 2,
    size: 'wide',
    items: [
        {
        src: flagUrl,
        alt: 'YASMUN campaign flag',

        /* Match the emblem's dynamic rendered height. */
        ratio: '1130 / 983',
        fit: 'contain',
        position: 'center'
      }
    ]
  },
  {
    type: 'text',
    align: 'right',
    width: 'narrow',
    text:
      'As the campaign matured, so did its visual language. Individually crafted graphics gradually evolved into a cohesive system that could be consistently applied across future campaigns.'
  },
  {
    type: 'media',
    src: objectsUrl,
    alt: 'YASMUN three-dimensional campaign objects',
    size: 'wide',
    ratio: '1840 / 680'
  },
  {
    type: 'media',
    src: overviewUrl,
    alt: 'YASMUN conference overview publication',
    size: 'wide',
    ratio: '1840 / 1077'
  },
    {
    type: 'gallery',
    columns: 2,
    size: 'wide',
    items: [
      {
        src: certificateUrl,
        alt: 'YASMUN certificate and printed material',
        ratio: '1840 / 1181',
        span: 2
      },
      {
        src: businessCardUrl,
        alt: 'YASMUN business card',
        ratio: '1840 / 1079',
        span: 2
      }
    ]
  }
],

nextProject: {
  slug: 'tra-da-mentor',
  client: 'Tra Da Mentor',
  title: 'a website that updated itself.',
  image: traDaMentorCoverUrl,
  imageAlt: 'Tra Da Mentor digital experience',
  ratio: '967 / 573',
  href: '#tra-da-mentor',

  related: [
    {
      src: yasmunCoverUrl,
      alt: 'YASMUN visual identity',
      ratio: '967 / 573'
    },
    {
      src: handHeartCoverUrl,
      alt: 'Hand & Heart visual identity',
      ratio: '967 / 573'
    }
  ]
}
}


const handHeartCaseStudy = {
  slug: 'heart-and-hand',
  brand: 'THE ALTERNATE CLOUD',

  headerLinks: [
    { label: 'Work', page: 'work' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' }
  ],

  title: 'typography became the visual language.',

  subtitle:
    'Hand & Heart Collective is a fictional craft brand created to explore an identity that feels original, handcrafted and approachable.',

  summary:
  'Hand & Heart Collective explores how typography can become more than a communication tool—it can become the visual language itself.\n\nThe project began as an experiment, exploring how far typographic forms could be stretched into expressive characters without relying on a separate illustration style. By constructing every visual asset from the same curves, proportions and stroke logic as the display typeface, the identity develops a cohesive system that scales naturally from digital campaigns to physical merchandise.\n\nCreated as a fictional craft brand, Hand & Heart Collective provides a framework for exploring how a single graphic vocabulary can generate an entire identity system.',

metadata: [
  {
    label: 'Responsibilities',
    value: 'Campaign Visual System'
  },
  {
    label: 'Timeline',
    value: '2024–2025'
  }
],

  sections: [
    {
      type: 'media',
      src: handHeartCoverUrl,
      alt: 'Hand & Heart illustrated tote bag',
      size: 'wide',
      ratio: '967 / 573',
      loading: 'eager'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"The project started with experimentation—seeing how far typographic forms could be stretched into expressive characters."'
    },
    {
      type: 'media',
      src: handHeartCharacterSystemUrl,
      alt: 'Hand & Heart character and campaign system',
      size: 'wide'
    },
    {
      type: 'media',
      src: handHeartCampaignUrl,
      alt: 'Hand & Heart campaign and physical applications',
      size: 'wide'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"The flexible visual language scales from digital campaigns to physical merchandise while maintaining a recognizable personality across every touchpoint."'
    },
    {
      type: 'media',
      src: handHeartSocialUrl,
      alt: 'Hand & Heart social media and merchandise applications',
      size: 'wide'
    },
    {
      type: 'text',
      align: 'right',
      width: 'narrow',
      text:
        'Hand & Heart Collective is a fictional business specializing in handcrafted objects. The fictional brand provides context for exploring the identity system across real-world applications.'
    },
    {
      type: 'media',
      src: handHeartBillboardUrl,
      alt: 'Hand & Heart outdoor campaign',
      size: 'wide'
    }
  ],

  nextProject: {
    slug: 'yasmun-visual-identity',
    client: 'Youth Ascendency Model United Nations',
    title:
      'How far can a formal organization push its visual language without losing trust?',
    image: yasmunCoverUrl,
    imageAlt: 'YASMUN conference identity',
    ratio: '967 / 573',
    href: '#yasmun-visual-identity'
  }
}

const traDaMentorCaseStudy = {
  slug: 'tra-da-mentor',
  brand: 'THE ALTERNATE CLOUD',

  headerLinks: [
    { label: 'Work', page: 'work' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' }
  ],

  title: 'a website that updated itself.',

  subtitle:
    'A visual redesign and publishing system for Tra Da Mentor, restoring digital credibility while automating content management.',

  summary:
    'Tra Da Mentor had developed a new visual identity, but its website no longer represented the organization accurately. With a new intake of mentees approaching, the outdated interface was beginning to affect first impressions.\n\nThe project expanded the identity into a responsive digital design system while rebuilding the platform page by page.\n\nA structured publishing workflow connected mentor information to spreadsheet data, allowing new profiles and content to be published without manually creating a new page each time.',

 summary:
  "Tra Da Mentor is a mentoring organization supporting high school and university students through career exploration, skill development, and professional networking.\n\nAs the organization expanded, its website struggled to keep pace. An outdated visual language, inconsistent layouts, and manual publishing workflows made the platform increasingly difficult to maintain while weakening the organization's first impression. The redesign sought to modernize both the experience and the underlying production process, creating a website that was easier to trust, easier to navigate, and easier to grow.\n\nRather than treating the redesign as a visual refresh, the project began by examining why the existing website felt difficult to use. Navigation lacked hierarchy, typography competed for attention, and important information was often hidden beneath inconsistent layouts.\n\nThe redesigned interface simplified the information architecture and introduced a more coherent visual hierarchy across desktop and mobile experiences. Readability, spacing, and responsive behaviour were refined to ensure prospective mentees could understand the organization's services with confidence, regardless of device.\n\nBeyond the public interface, maintaining the website had become increasingly time-consuming. Adding a single mentor profile required manually creating new pages, making regular updates difficult as the organization continued to grow.\n\nTo address this, the project introduced a lightweight publishing workflow that connected structured spreadsheet data with a CMS, allowing mentor profiles to be generated automatically. Rather than solving only today's interface, the redesign established a scalable system capable of supporting future cohorts with significantly less manual work.\n\nThe redesign also expanded the organization's existing identity into a more comprehensive digital system. Typography, illustration, colour, and interface components were refined into a consistent visual language that could move naturally between the website and printed communications.\n\nInstead of redesigning individual pages in isolation, the project established reusable components and responsive layouts that maintained a coherent identity across every touchpoint while remaining flexible enough to evolve alongside the organization.",

  metadata: [
    {
      label: 'Client',
      value: 'Tra Da Mentor'
    },
    {
      label: 'Sector',
      value: 'Education'
    },
    {
      label: 'Role',
      value: [
        'UI/UX Designer',
        'Visual Designer'
      ]
    },
    {
      label: 'Platform',
      value: [
        'Framer',
        'Airtable',
        'Google Sheets'
      ]
    },
    {
      label: 'Responsibilities',
      value: [
        'Website Redesign',
        'Responsive Interface',
        'CMS Workflow Design'
      ]
    },
    {
      label: 'Timeline',
      value: '2024'
    },
    {
      label: 'Team',
      value: [
        'Phuong Le Ho Bao',
        'Pham Le Nhu Quynh',
        'Thien Le Ha Ngan'
      ]
    }
  ],

  sections: [
    {
      type: 'media',
      src: traDaHomepageUrl,
      alt: 'Redesigned Tra Da Mentor homepage',
      size: 'wide',
      loading: 'eager'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"The website no longer reflected our updated visual identity. With a new intake of mentees approaching, the outdated interface was beginning to affect first impressions."'
    },
    {
      type: 'media',
      src: traDaResponsiveSystemUrl,
      alt: 'Tra Da Mentor website across mobile and desktop',
      size: 'wide'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"Adding a new mentor profile meant creating a new page almost every week. We needed a publishing workflow where mentor information could be published automatically from spreadsheet data rather than manually."'
    },
    {
      type: 'media',
      src: traDaCmsSystemUrl,
      alt: 'Tra Da Mentor content-management and visual system',
      size: 'wide'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"The visual identity was expanded into a digital design system, improving readability while maintaining consistency across web and print applications."'
    },
    {
      type: 'media',
      src: traDaPageSystemUrl,
      alt: 'Tra Da Mentor reusable website page system',
      size: 'wide'
    },
    {
      type: 'statement',
      align: 'right',
      text:
        '"Rather than redesigning individual screens, the project rebuilt the platform page by page, establishing a consistent responsive system."'
    },
    {
      type: 'media',
      src: traDaResponsivePagesUrl,
      alt: 'Responsive Tra Da Mentor information pages',
      size: 'wide'
    }
  ],

  nextProject: {
    slug: 'yasmun-visual-identity',
    client: 'Youth Ascendency Model United Nations',
    title:
      'How far can a formal organization push its visual language without losing trust?',
    image: yasmunCoverUrl,
    imageAlt: 'YASMUN conference identity',
    ratio: '967 / 573',
    href: '#yasmun-visual-identity',

    related: [
      {
        src: handHeartCoverUrl,
        alt: 'Hand & Heart visual identity',
        ratio: '967 / 573'
      },
      {
        src: traDaMentorCoverUrl,
        alt: 'Tra Da Mentor digital experience',
        ratio: '967 / 573'
      }
    ]
  }
}

export {
  yasmunCaseStudy,
  handHeartCaseStudy,
  traDaMentorCaseStudy
}
