// Small shared data payload used before lazy route chunks load.

const PLUGINS = [
  {
    id: 'flowstate',
    name: 'FlowState',
    oneline: 'Search Premiere footage by meaning, not filenames.',
    price: null,
    version: 'COMING SOON',
    badge: 'COMING SOON',
    status: 'coming-soon',
    variant: 'ai-media-browser',
    what: 'FlowState scans a bin, analyzes clips with Gemini, and builds a searchable catalog.',
    who: 'Editors sorting A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'Premiere panel · Gemini workflow · searchable catalog.json · results bin · launch list early access.',
    install: [
      'Join the launch list.',
      'Get the release email when FlowState ships.',
      'Download the installer for Mac or Windows.',
      'Open Window → Extensions → FlowState in Premiere.',
      'Select a bin subtree, run analysis, then search and send matches to a results bin.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      'Gemini API access required',
      'Release timing: 2026',
      'In active development',
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
];

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Warm, polished color for footage shot in natural light.',
    seoDescription: 'Meridian is a .CUBE LUT for warm, polished color on footage shot in natural light.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/meridian mockup.png',
    mockupAlt: 'Meridian LUT product mockup',
    demoLabel: 'Meridian',
    compare: {
      title: 'Meridian',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Meridian ungraded preview',
      afterTitle: 'Meridian graded preview',
      beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
    },
    compareScenes: [
      {
        id: 'scene-01',
        label: 'Scene 01',
        title: 'Meridian scene 01',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'Meridian scene 01 ungraded preview',
        afterTitle: 'Meridian scene 01 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
      },
      {
        id: 'scene-02',
        label: 'Scene 02',
        title: 'Meridian scene 02',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'Meridian scene 02 ungraded preview',
        afterTitle: 'Meridian scene 02 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 2 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 2 graded.mp4',
      },
    ],
  },
  {
    id: 'onyx',
    name: 'Onyx',
    oneline: 'Crafted for the night, where deep shadows meet luminous skin and city light.',
    seoDescription: 'Onyx is a .CUBE LUT crafted for nighttime footage, deep shadows, luminous skin, and city light.',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    available: true,
    checkoutProductId: 'onyx',
    mockupSrc: 'mockups/onyx mockup.png',
    mockupAlt: 'Onyx LUT product mockup',
    demoLabel: 'Onyx',
    details: {
      whatItDoes: 'Shapes nighttime footage with deeper shadows, luminous skin, and controlled city-light glow.',
      whoItsFor: 'Editors grading night streets, low-light portraits, events, and neon-lit creator footage.',
      whatYouGet: '1 x .CUBE',
    },
    compare: {
      title: 'Onyx',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Onyx ungraded preview',
      afterTitle: 'Onyx graded preview',
      beforeSrc: 'videos/lut showcase/onyx 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/onyx 1 graded.mp4',
    },
  },
  {
    id: 'interior-03',
    name: 'Haloclyne',
    oneline: 'Soft interior color for natural light, interviews, and lifestyle footage.',
    price: null,
    formats: '.CUBE',
    badge: 'COMING SOON',
    tone: 'warm-film',
    available: false,
    release: 'Q2',
    demoLabel: 'Haloclyne',
  },
];

const LUT_FAQS = [
  {
    q: 'What footage works best with these LUTs?',
    a: 'Meridian performs best with clean natural light. Onyx is built for nighttime footage, city lights, and deeper shadow work.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, and Final Cut Pro?',
    a: 'Yes. The LUTs ship as .CUBE files for Premiere Pro, DaVinci Resolve, Final Cut Pro, and most modern color workflows.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform, then fine-tune each shot.',
  },
];

const LUT_DETAIL_FAQS = [
  {
    q: 'Who are these LUTs best for?',
    a: 'Editors who want focused looks for specific lighting conditions instead of a giant bundle.',
  },
  {
    q: 'What software can open these LUTs?',
    a: 'Any editor that accepts .CUBE files, including Premiere Pro, DaVinci Resolve, and Final Cut Pro.',
  },
  {
    q: 'How strong should the LUT be?',
    a: 'Start around 30 to 60 percent, then adjust exposure and white balance.',
  },
];

const FAQS = [
  { q: 'Do your plugins work on Windows?', a: 'Yes. Every plugin ships with a signed installer for Mac and Windows. Premiere Pro 2024 (24.0) or later.' },
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
