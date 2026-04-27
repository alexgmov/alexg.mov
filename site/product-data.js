// Small shared data payload used before lazy route chunks load.

const PLUGINS = [
  {
    id: 'flowstate',
    name: 'FlowState',
    oneline: 'Search Premiere footage by meaning, not filenames.',
    price: 28,
    version: '1.0.0',
    badge: 'RELEASED',
    status: 'released',
    variant: 'ai-media-browser',
    what: 'FlowState scans a bin, analyzes clips with Gemini, and builds a searchable catalog.',
    who: 'Editors sorting A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'Premiere panel · Gemini workflow · searchable catalog.json · results bin.',
    install: [
      'Download the installer (.dmg for Mac, .exe for Windows).',
      'Close Premiere if it is currently running.',
      'Double-click the installer. Follow the two prompts.',
      'Reopen Premiere. Window → Extensions → FlowState.',
      'Select a bin subtree, run analysis, then search and send matches to a results bin.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      'Gemini API access required',
      'Writes data/catalog.json',
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
    q: 'What footage works best with Meridian?',
    a: 'Meridian performs best with footage shot in natural light that already has clean exposure and white balance.',
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
    q: 'Who is Meridian best for?',
    a: 'Editors who want one warm, polished LUT for lifestyle, creator, and social footage shot in natural light.',
  },
  {
    q: 'What software can open Meridian?',
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
