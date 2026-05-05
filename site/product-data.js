// Small shared data payload used before lazy route chunks load.

const PLUGINS = [
  {
    id: 'flowstate',
    name: 'FlowState',
    oneline: 'Search Premiere footage by meaning, not filenames.',
    price: 18,
    version: '1.0.0',
    badge: 'LIVE',
    status: 'released',
    variant: 'ai-media-browser',
    visual: 'blank',
    what: 'FlowState scans a bin, analyzes clips with Gemini, and builds a searchable catalog.',
    who: 'Editors sorting A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'FlowState 1.0.0 ZXP · Premiere panel · Gemini workflow · searchable catalog.json · results bin · lifetime download.',
    install: [
      'Buy once and check your email for the FlowState download link.',
      'Download FlowState-1.0.0.zxp on your editing computer.',
      'Install the ZXP with your Adobe extension installer.',
      'Open Window → Extensions → FlowState in Premiere.',
      'Select a bin subtree, run analysis, then search and send matches to a results bin.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      'Gemini API access required',
      'ZXP extension package',
      'Version 1.0.0',
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
    q: 'What is the best Premiere Pro plugin for searching footage by meaning?',
    a: 'FlowState analyzes selected bins, builds clip metadata, and lets editors search by content instead of filename.',
  },
  {
    q: 'Does FlowState replace a normal editing workflow?',
    a: 'No. It helps you find and organize footage faster. You still make the edit decisions.',
  },
  {
    q: 'Who should use an AI media browser plugin?',
    a: 'Editors with large bins, interviews, B-roll, product footage, launches, and creator shoots.',
  },
];

const PLUGIN_DETAIL_FAQS = [
  {
    q: 'What does FlowState do in Premiere Pro?',
    a: 'It scans selected bins with AI and turns clip details into searchable metadata.',
  },
  {
    q: 'What does FlowState help me find?',
    a: 'A-roll, B-roll, shot type, motion, lighting, subject matter, and clip context.',
  },
  {
    q: 'What software do I need?',
    a: 'FlowState is built for Adobe Premiere Pro 2024 or later on macOS 13+ or Windows 10/11. Gemini API access is required for analysis.',
  },
  {
    q: 'How do I receive FlowState after checkout?',
    a: 'The FlowState ZXP download link is sent to the email you use at checkout, so you can buy on your phone and install it later on your editing computer.',
  },
];

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'MERIDIAN',
    oneline: 'Warm, polished color for footage shot in natural light.',
    seoDescription: 'MERIDIAN is a .CUBE LUT for warm, polished color on footage shot in natural light.',
    price: 18,
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
    oneline: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
    seoDescription: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    available: true,
    checkoutProductId: 'onyx',
    mockupSrc: 'mockups/onyx mockup.png',
    mockupAlt: 'ONYX LUT product mockup',
    demoLabel: 'ONYX',
    details: {
      whatItDoes: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
      whoItsFor: 'Editors grading underwater, ocean, diving, snorkel, reef, and tropical travel footage.',
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
    a: 'MERIDIAN performs best with clean natural light. ONYX: One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea. HALOCLYNE is made for underwater footage, ocean life, turquoise water, and hazy sand-heavy scenes.',
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
  { q: 'Do your plugins work on Windows?', a: 'FlowState ships as a ZXP extension for Premiere Pro 2024 (24.0) or later on macOS 13+ and Windows 10/11. Gemini API access is required.' },
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
