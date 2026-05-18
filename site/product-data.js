// Small shared data payload used before lazy route chunks load.

const PLUGINS = [
  {
    id: 'sidestream',
    name: 'Sidestream',
    oneline: 'Search YouTube, preview, download, convert, and import media without leaving Premiere.',
    price: 0,
    version: '1.0.2',
    badge: 'LIVE',
    status: 'released',
    variant: 'media-intake',
    visual: 'demo-video',
    demoVideoSrc: 'videos/plugin showcase/sidestream demo.optimized.mp4',
    demoPosterSrc: 'videos/plugin showcase/sidestream demo.optimized.poster.jpg',
    demoDuration: '11s',
    seoTitle: 'Sidestream Premiere Pro Plugin | YouTube Media Intake for Editors',
    seoDescription: 'Sidestream helps Premiere editors search YouTube, preview sources, download video or audio, convert media, and import files without leaving the edit.',
    what: 'Sidestream brings YouTube search, preview, video/audio download, conversion, and project import into a compact Premiere panel.',
    who: 'Editors pulling licensed reference clips, interviews, sound bites, and web footage into active Premiere projects.',
    get: 'Sidestream 1.0.2 ZXP · Premiere panel · YouTube search · video/audio downloads · Premiere-safe MP4 conversion · lifetime download.',
    install: [
      'Free for now: enter your email at checkout and Sidestream sends the download link.',
      'Download Sidestream-1.0.2.zxp on your editing computer.',
      'Install the ZXP with your Adobe extension installer.',
      'Open Window → Extensions → Sidestream in Premiere.',
      'Search YouTube, preview a result, download video or audio, then import the finished file.',
    ],
    specs: [
      'Adobe Premiere Pro 2020 (14.0) or later',
      'macOS · Windows',
      'YouTube-first media intake workflow',
      'ZXP extension package',
      'Version 1.0.2',
    ],
    detailGuide: {
      title: 'Sidestream keeps media intake inside Premiere.',
      intro: 'Built for reference pulls, licensed source clips, sound bites, and fast edit-room gathering.',
      items: [
        {
          title: 'YouTube research without browser hopping',
          body: 'Search, inspect, and preview candidates from the Premiere panel before downloading anything.',
        },
        {
          title: 'Video or audio downloads',
          body: 'Pull the format you need, normalize it for Premiere, and keep the handoff close to the timeline.',
        },
        {
          title: 'Project-aware import',
          body: 'Save into a predictable Sidestream folder and import finished media into the active project.',
        },
      ],
    },
    detailFaqs: [
      {
        q: 'What does Sidestream do in Premiere Pro?',
        a: 'It searches YouTube, previews sources, downloads video or audio, converts media when needed, and imports the finished file into Premiere.',
      },
      {
        q: 'Is Sidestream for licensed or permitted media?',
        a: 'Yes. Use it only with media you own, have licensed, or are otherwise permitted to download and edit.',
      },
      {
        q: 'How do I receive Sidestream after checkout?',
        a: 'The free Sidestream checkout sends the ZXP download link to your email, so you can claim it on your phone and install it later on your editing computer.',
      },
    ],
  },
  {
    id: 'demonclipper',
    name: 'Demon Clip',
    oneline: 'A faster way to carve long sessions into usable selects.',
    price: null,
    version: 'COMING SOON',
    badge: 'COMING SOON',
    status: 'coming-soon',
    variant: 'toolkit',
    what: 'Demon Clip turns long raw sessions into tight selects before the edit.',
    who: 'Editors cutting interviews, multicam podcasts, and long creator shoots.',
    get: 'Premiere extension for Mac and Windows · launch list early access.',
    install: [
      'Join the launch list.',
      'Get the release email when Demon Clip ships.',
      'Download the installer for Mac or Windows.',
      'Open Window → Extensions → Demon Clip in Premiere.',
      'Start clipping down long sessions into selects.',
    ],
    specs: [
      'Premiere Pro 2024 (24.0)+',
      'macOS 13+ / Windows 10/11',
      'Release timing: 2026',
      'In active development',
    ],
  },
];

const PLUGIN_FAQS = [
  {
    q: 'Which Premiere plugin should I start with?',
    a: 'Use Sidestream when you need YouTube-first media intake, preview, download, conversion, and import inside Premiere.',
  },
  {
    q: 'Do these plugins replace a normal editing workflow?',
    a: 'No. They handle specific bottlenecks inside Premiere so you can keep making the edit decisions.',
  },
  {
    q: 'How do I receive a plugin after checkout?',
    a: 'The ZXP download link is sent to the email you use at checkout, so you can buy or claim it on your phone and install later on your editing computer.',
  },
];

const PLUGIN_DETAIL_FAQS = [
  {
    q: 'What do these Premiere plugins do?',
    a: 'They handle focused edit-room bottlenecks inside Premiere, from media intake to faster selects.',
  },
  {
    q: 'Are they full editing replacements?',
    a: 'No. They stay narrow so the plugin helps with one workflow without taking over the edit.',
  },
  {
    q: 'What software do I need?',
    a: 'Released plugins ship as ZXP extensions for Premiere Pro on macOS and Windows. Check each plugin page for exact version support.',
  },
  {
    q: 'How do I receive a plugin after checkout?',
    a: 'The ZXP download link is sent to the email you use at checkout, so you can buy or claim it on your phone and install it later on your editing computer.',
  },
];

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'MERIDIAN',
    oneline: 'Warm, polished color for footage shot in natural light.',
    seoDescription: 'MERIDIAN is a .CUBE LUT for warm, polished color on footage shot in natural light.',
    price: 18,
    compareAtPrice: 29,
    priceLabel: 'Launch price',
    priceNote: 'ONE-TIME · SENT BY EMAIL',
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/meridian mockup.png',
    mockupAlt: 'MERIDIAN LUT product mockup',
    demoLabel: 'MERIDIAN',
    compare: {
      title: 'MERIDIAN',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'MERIDIAN ungraded preview',
      afterTitle: 'MERIDIAN graded preview',
      beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
    },
    compareScenes: [
      {
        id: 'scene-01',
        label: 'Scene 01',
        title: 'MERIDIAN scene 01',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'MERIDIAN scene 01 ungraded preview',
        afterTitle: 'MERIDIAN scene 01 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
      },
      {
        id: 'scene-02',
        label: 'Scene 02',
        title: 'MERIDIAN scene 02',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'MERIDIAN scene 02 ungraded preview',
        afterTitle: 'MERIDIAN scene 02 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 2 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 2 graded.mp4',
      },
    ],
  },
  {
    id: 'onyx',
    name: 'ONYX',
    oneline: 'Crafted for the night, where deep shadows meet luminous skin and city light.',
    seoDescription: 'ONYX is a .CUBE LUT crafted for nighttime footage, deep shadows, luminous skin, and city light.',
    price: 18,
    compareAtPrice: 29,
    priceLabel: 'Launch price',
    priceNote: 'ONE-TIME · SENT BY EMAIL',
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    available: true,
    checkoutProductId: 'onyx',
    mockupSrc: 'mockups/onyx mockup.png',
    mockupAlt: 'ONYX LUT product mockup',
    demoLabel: 'ONYX',
    details: {
      whatItDoes: 'Shapes nighttime footage with deeper shadows, luminous skin, and controlled city-light glow.',
      whoItsFor: 'Editors grading night streets, low-light portraits, events, and neon-lit creator footage.',
      whatYouGet: 'ZIP containing 1 x .CUBE',
    },
    compare: {
      title: 'ONYX',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'ONYX ungraded preview',
      afterTitle: 'ONYX graded preview',
      beforeSrc: 'videos/lut showcase/onyx 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/onyx 1 graded.mp4',
    },
  },
  {
    id: 'haloclyne',
    name: 'HALOCLYNE',
    oneline: 'A one-click underwater grade that separates foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
    seoDescription: 'HALOCLYNE is a .CUBE LUT for underwater footage, separating foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
    price: 18,
    compareAtPrice: 29,
    priceLabel: 'Launch price',
    priceNote: 'ONE-TIME · SENT BY EMAIL',
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'warm-film',
    available: true,
    checkoutProductId: 'haloclyne',
    mockupSrc: 'mockups/haloclyne mockup.png',
    mockupAlt: 'HALOCLYNE LUT product mockup',
    demoLabel: 'HALOCLYNE',
    details: {
      whatItDoes: 'Separates foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
      whoItsFor: 'Editors grading underwater, ocean, diving, snorkel, reef, and tropical travel footage.',
      whatYouGet: 'ZIP containing 1 x .CUBE',
    },
    compare: {
      title: 'HALOCLYNE',
      label: 'Scene 01',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'HALOCLYNE ungraded preview',
      afterTitle: 'HALOCLYNE graded preview',
      beforeSrc: 'videos/lut showcase/haloclyne 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/haloclyne 1 graded..mp4',
    },
  },
];

const LUT_FAQS = [
  {
    q: 'What footage works best with these LUTs?',
    a: 'MERIDIAN performs best with clean natural light. ONYX is built for nighttime footage, city lights, and deeper shadow work. HALOCLYNE is made for underwater footage, ocean life, turquoise water, and hazy sand-heavy scenes.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, and CapCut?',
    a: 'Yes. Each download is a .zip containing a .CUBE file for Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, CapCut Desktop, and most modern color workflows. iMovie does not natively import .CUBE LUTs.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform, then fine-tune each shot.',
  },
  {
    q: 'How do I receive the download?',
    a: 'After checkout, the download link is sent to the email you use at checkout, so you can buy on your phone and open the files on your computer.',
  },
];

const LUT_DETAIL_FAQS = [
  {
    q: 'Who are these LUTs best for?',
    a: 'Editors who want focused looks for specific lighting conditions instead of a giant bundle.',
  },
  {
    q: 'What software can open these LUTs?',
    a: 'Any editor that accepts .CUBE files, including Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, and CapCut Desktop. iMovie does not natively import .CUBE LUTs.',
  },
  {
    q: 'How strong should the LUT be?',
    a: 'Start around 30 to 60 percent, then adjust exposure and white balance.',
  },
];

const FAQS = [
  { q: 'Do your plugins work on Windows?', a: 'Released plugins ship as ZXP extensions for Premiere Pro on macOS and Windows. Check each plugin page for exact version support.' },
  { q: 'Can I use the LUTs in client work?', a: 'Yes. Personal and commercial use are both allowed. Don\'t redistribute the files themselves or resell the pack.' },
  { q: 'Do you offer refunds?', a: 'No. These are digital downloads, so all sales are final. If something is broken on my end, email me and I will fix or replace it.' },
  { q: 'How fast do you respond to support?', a: 'Within 24 hours on weekdays. Include your OS, Premiere version, and a screen recording if possible.' },
];

Object.assign(window, {
  PLUGINS,
  PLUGIN_FAQS,
  PLUGIN_DETAIL_FAQS,
  LUTS,
  LUT_FAQS,
  LUT_DETAIL_FAQS,
  FAQS,
});
