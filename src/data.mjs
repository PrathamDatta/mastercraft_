// Single source of truth for verified company and product facts.
// Everything here was taken from https://mastercraftengineers.com/ (audited 2026-10-27).
// Values are kept as published; units/formatting are normalised only.

export const SITE = {
  url: 'https://mastercraftengineers.com',
  name: 'Mastercraft Engineers',
  legalName: 'Mastercraft Engineers Pvt. Ltd.',
  tagline: 'Moulding the future… your way',
  founded: 1992,
  email: 'info@mcraft.net',
  phones: [
    { display: '+91-80-27839712', tel: '+918027839712' },
    { display: '+91-80-27839713', tel: '+918027839713' }
  ],
  address: {
    lines: ['# 126 & 127, Phase 4', 'Bommasandra Industrial Area', 'Bangalore – 560 099', 'INDIA'],
    street: '# 126 & 127, Phase 4, Bommasandra Industrial Area',
    locality: 'Bengaluru',
    region: 'Karnataka',
    postalCode: '560099',
    country: 'IN'
  },
  youtube: 'https://www.youtube.com/@mastercraftengineers6417',
  videoId: 'ab02wJ7du5g',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Mastercraft+Engineers+Bommasandra+Industrial+Area+Bangalore+560099',
  buildDate: new Date().toISOString().slice(0, 10)
};

export const NAV = [
  { href: '/about/', label: 'About' },
  { href: '/facilities/', label: 'Facilities' },
  {
    label: 'Products', href: '/injection-moulds/', children: [
      { href: '/injection-moulds/', label: 'Small precision injection moulds', note: 'Compact tools, up to 64 cavities' },
      { href: '/large-size-injection-moulds/', label: 'Large injection moulds', note: '1.3 – 18.5 t documented' },
      { href: '/components/', label: 'Plastic injection-moulded components', note: 'Weights, materials, photos' },
      { href: '/2k-parts/', label: 'Two-component (2K) parts', note: 'Hard + soft material parts' }
    ]
  },
  { href: '/quality/', label: 'Quality' },
  { href: '/contact/', label: 'Contact' }
];

// ---------- Process (verified stages; see facilities page) ----------
export const PROCESS = [
  {
    id: 'project-management', n: '01', title: 'Project management', img: 'projectMgmt',
    text: 'Meticulous planning of each project supports execution and adherence to delivery commitments.',
    facts: [['Focus', 'Planning and delivery commitments']],
    group: 'Design & engineering'
  },
  {
    id: 'cad', n: '02', title: 'CAD design', img: 'cadOffice',
    text: 'Advanced CAD software, used by a strong team of designers, results in efficient mould designs.',
    facts: [['Output', 'Mould design']],
    group: 'Design & engineering'
  },
  {
    id: 'cam', n: '03', title: 'CAM programming', img: 'camToolpath',
    text: 'CAM software generates the NC codes that output cutter paths for precise machining.',
    facts: [['Output', 'NC codes / cutter paths']],
    group: 'Design & engineering'
  },
  {
    id: 'machining', n: '04', title: 'Precision machining', img: 'machining5',
    text: 'A battery of precision machines translates cutter paths into complex shapes, holding very close tolerances and good surface quality.',
    facts: [
      ['Machining centres, 5-axis', '600 × 400 mm stroke'],
      ['Machining centres, 3-axis', '900 mm to 700 mm stroke'],
      ['Ultra-precision wire EDM', '500 × 350 mm stroke'],
      ['CNC EDM', '500 × 400 mm stroke'],
      ['Also', 'Tool presetter and tool measurement']
    ],
    group: 'Machining & tooling'
  },
  {
    id: 'assembly', n: '05', title: 'Mould assembly', img: 'crane',
    text: 'Mould elements are assembled by skilled craftsmen in a bay served by an overhead crane.',
    facts: [['EOT crane', '5 / 3 tons']],
    group: 'Mould assembly'
  },
  {
    id: 'moulding', n: '06', title: 'Injection moulding', img: 'moulding',
    text: 'High-precision injection moulding machines produce small precision parts. The production process is monitored with Statistical Process Control (SPC) techniques on an hourly basis.',
    facts: [
      ['Clamping capacity', '45 ~ 150 tons'],
      ['Part weight range', '0.5 ~ 300 g'],
      ['Process monitoring', 'SPC, hourly']
    ],
    group: 'Injection moulding'
  },
  {
    id: 'inspection', n: '07', title: 'Quality inspection', img: 'qualityCmm',
    text: 'Mould inserts and plastic components are inspected to ensure they meet the design intent and customer expectations.',
    facts: [
      ['Dimensional', 'CMM touch probe, video and laser measurement'],
      ['Material', 'MFI testing machine']
    ],
    group: 'Quality & testing'
  }
];

// ---------- Products ----------
const row = (label, value) => (value ? { label, value } : null);
const mm3 = (s) => s.replace(/\s*[xX×]\s*/g, ' × ');

function mould(o) {
  return {
    kind: 'mould', ...o,
    specs: [
      row('Mould size', o.mouldSize && `${mm3(o.mouldSize)} mm`),
      row('Mould weight', o.mouldWeight),
      row('Cavities', o.cavities),
      row('Hot runner (HRS)', o.hrs),
      row('Part size', o.partSize && `${mm3(o.partSize)} mm`),
      row('Part weight', o.partWeight),
      row('Plastic raw material', o.material)
    ].filter(Boolean)
  };
}

export const SMALL_MOULDS = [
  mould({ slug: '2-cavity-lid-battery-mould', name: 'Two-cavity mould for battery lid', img: 'mouldSmall1', cavities: '2', partSize: '240 x 210 x 98', mouldSize: '600 x 500 x 475', mouldWeight: '750 kg', weightKg: 750, material: 'PP' }),
  mould({ slug: 'base-plate-4-drop-hot-runner-mould', name: 'Mould for base plate with 4-drop hot runner', img: 'mouldSmall2', hrs: '4 drops', partSize: '398 x 373 x 12', mouldSize: '600 x 550 x 350', mouldWeight: '640 kg', weightKg: 640, material: 'PP' }),
  mould({ slug: 'led-cover-mould', name: 'LED cover mould', img: 'ledCover', cavities: '2', partSize: '64 x 34 x 17', mouldSize: '250 x 250 x 250', material: 'PC FR' }),
  mould({ slug: 'blende-saule-a-oben-mould', name: 'Blende Saule A oben mould', img: 'blendeSaule', cavities: '1 + 1', partSize: '90 x 210 x 220', mouldSize: '696 x 996 x 775', material: 'Hostacom EKC 330N E1 D1V884' }),
  mould({ slug: 'rahmen-a-saule-mould', name: 'Rahmen A Saule mould', img: 'rahmenSaule', cavities: '2 + 2', partSize: '30 x 32 x 240', mouldSize: '596 x 746 x 739', material: 'Hostacom EKC 330N E1 D1V884' }),
  mould({ slug: 'telephone-socket-64-cavity-mould', name: 'Telephone socket 64-cavity mould', img: 'telephoneSocket', cavities: '64', partSize: '12 x 10 x 6', mouldSize: '596 x 446 x 395', material: 'Hostacom EKC 330N E1 D1V884' }),
  mould({ slug: 'eye-drop-nozzle-32-cavity-mould', name: 'Eye drop nozzle 32-cavity mould', img: 'eyeDrop', cavities: '32', partSize: 'Dia 13 x 19', mouldSize: '446 x 296 x 440', material: 'LDPE' })
];
// Part-size values for the last mould need unit handling ("Dia 13 x 19"):
SMALL_MOULDS[6].specs = SMALL_MOULDS[6].specs.map(s => s.label === 'Part size' ? { ...s, value: 'Ø 13 × 19 mm' } : s);

export const LARGE_MOULDS = [
  mould({ slug: 'fr-base-grill-mould', name: 'Mould for FR base grill', img: 'frBaseGrill', mouldSize: '1196 x 746 x 938', mouldWeight: '6 t', weightT: 6, hrs: '3 drops, valve gate', partSize: '810 x 223 x 267', partWeight: '750 g', material: 'PP' }),
  mould({ slug: 'fr-door-trim-lwr-mould', name: 'Mould for FR door trim LWR (LH + RH)', img: 'frDoorTrim', mouldSize: '1690 x 1446 x 1258', mouldWeight: '18.5 t', weightT: 18.5, hrs: '3 drops, SVG', partSize: '769 x 572 x 135', partWeight: '1196 + 1196 g', material: 'PP (3080HCRM)' }),
  mould({ slug: 'b-pillar-mould', name: 'B pillar mould (LH + RH)', img: 'bPillar', mouldSize: '1200 x 1600 x 1250', mouldWeight: '14 t', weightT: 14, hrs: '4 drops, SVG', partSize: '833 x 472 x 110', partWeight: '611 + 611 g', material: 'PP' }),
  mould({ slug: 'a-pillar-mould', name: 'A pillar mould (LH + RH)', img: 'aPillar', mouldSize: '1000 x 1400 x 900', mouldWeight: '9 t', weightT: 9, hrs: '2 drops, HRS', partSize: '812 x 175 x 62', partWeight: '281 + 281 g', material: 'PP' }),
  mould({ slug: 'cowl-mould', name: 'Mould for cowl', img: 'cowl', mouldSize: '2200 x 1100 x 1050', mouldWeight: '12.5 t', weightT: 12.5, hrs: '3 drops, SVG', partSize: '1576 x 330 x 100', partWeight: '720 g', material: 'PP' }),
  mould({ slug: 'dr-panel-mould', name: 'DR panel mould', img: 'drPanel', mouldSize: '1376 x 946 x 856', mouldWeight: '5.8 t', weightT: 5.8, hrs: '4 drops, valve gate', partSize: '870 x 273 x 159', partWeight: '476 g', material: 'PP – HPP/IN6 (HESC252)' }),
  mould({ slug: 'ctr-panel-mould', name: 'CTR panel mould', img: 'ctrPanel', mouldSize: '1800 x 1230 x 1115', mouldWeight: '16 t', weightT: 16, hrs: '2 drops, HRS', partSize: '998 x 258 x 282', partWeight: '1107 g', material: 'HPP-IN2 (PP-SRH35NFACR)' }),
  mould({ slug: 'dr-cover-mould', name: 'DR cover mould', img: 'drCover', mouldSize: '816 x 746 x 704', mouldWeight: '2.6 t', weightT: 2.6, hrs: '1 drop, HRS', partSize: '543 x 328 x 135', partWeight: '412 g', material: 'PP (HPP 2N6 NPI-220SR ACR)' }),
  mould({ slug: 'panel-ctr-mould', name: 'Panel CTR mould', img: 'panelCtr', mouldSize: '641 x 596 x 574', mouldWeight: '1.3 t', weightT: 1.3, partSize: '269 x 144 x 39', partWeight: '248 g', material: 'PP (NPI 220 SR ACR)' }),
  mould({ slug: 'licence-garnish-mould', name: 'Licence garnish mould', img: 'licenceGarnish', mouldSize: '1496 x 696 x 930', mouldWeight: '11 t', weightT: 11, hrs: '3 drops, valve gate', partSize: '1275 x 105 x 220', partWeight: '635 g', material: 'HSM B3G – ABS MTZ – NH900L' }),
  mould({ slug: 'side-sill-mould', name: 'Side sill mould', img: 'sideSill', mouldSize: '2396 x 1070 x 1047', mouldWeight: '16.3 t', weightT: 16.3, cavities: '1 + 1', hrs: '6 drops, HRS', partSize: '1849 x 244 x 252', partWeight: '934 g', material: 'PP – X425 – ACI NH792L' }),
  mould({ slug: 'wheel-arch-lh-rh-mould', name: 'Wheel arch mould (LH/RH)', img: 'wheelArch', mouldSize: '1496 x 1411 x 1153', mouldWeight: '13.8 t', weightT: 13.8, cavities: '1 + 1', hrs: '3 + 3 drops, HRS', partSize: '892 x 492 x 260', partWeight: '440 + 440 g', material: 'PP X425 ACI – NH 792 L' }),
  mould({ slug: 'wheel-cap-mould', name: 'Wheel cap mould', img: 'wheelCap', mouldSize: '816 x 696 x 472', mouldWeight: '3.8 t', weightT: 3.8, hrs: 'Hot valve on the part', partSize: 'Ø 390', partWeight: '408 g', material: 'PA 6 (Ultramide)' }),
  mould({ slug: 'ornament-sub-assy-fr-door-mould', name: 'Ornament sub-assembly mould, FR door RH + LH', img: 'ornamentFr', mouldSize: '926 x 796 x 608', mouldWeight: '2.6 t', weightT: 2.6, cavities: '1 + 1', partSize: '609 x 179 x 64', partWeight: '218 + 218 g', material: 'PP (ID – NBC03HRS – 201 B)' }),
  mould({ slug: 'ornament-sub-assy-rr-door-trim-mould', name: 'Ornament sub-assembly mould, RR door trim RH + LH', img: 'ornamentRr', mouldSize: '696 x 696 x 458', mouldWeight: '1.8 t', weightT: 1.8, cavities: '1 + 1', partSize: '491 x 77 x 24', partWeight: '72 + 72 g', material: 'PP (ID – NBC03HRS – 201 B)' }),
  mould({ slug: 'cover-drive-mould', name: 'Cover drive mould', img: 'coverDrive', mouldSize: '596 x 446 x 659', mouldWeight: '2 t', weightT: 2, hrs: '3 drops, hot sprue', partSize: '157 x 197 x 62', partWeight: '133 g', material: 'Innoprene 5430 B' }),
  mould({ slug: 'housing-drive-mould', name: 'Housing drive mould', img: 'housingDrive', mouldSize: '396 x 396 x 385', mouldWeight: '4 t', weightT: 4, hrs: 'N/A', partSize: '133 x 135 x 38', partWeight: '149 g', material: 'PA 6 (K224 PG 8)' })
];
// Fix part-size unit for the diameter-based wheel cap
LARGE_MOULDS[12].specs = LARGE_MOULDS[12].specs.map(s => s.label === 'Part size' ? { ...s, value: 'Diameter 390 mm' } : s);

function part(o) {
  return {
    kind: 'part', ...o,
    specs: o.items.flatMap((it, i) => [
      row(o.items.length > 1 ? `Part ${i + 1}` : 'Part', it.name),
      row(o.items.length > 1 ? `Part ${i + 1} weight` : 'Part weight', `${it.weight} g`),
      row(o.items.length > 1 ? `Part ${i + 1} material` : 'Plastic raw material', it.material)
    ]).filter(Boolean)
  };
}

export const COMPONENTS = [
  part({ slug: 'door-lock-actuator-levers', name: 'Door lock actuator levers', img: 'cp1', items: [
    { name: 'Lever door lock actuator locking RR RH', weight: '4.1', material: 'POM M90-44' },
    { name: 'Lever door lock actuator active LH', weight: '3.0', material: 'POM M90-44' }] }),
  part({ slug: 'clip-frame-and-plunger', name: 'Clip frame and Ge 02 plunger', img: 'cp2', items: [
    { name: 'Clip frame', weight: '0.11', material: 'PC' },
    { name: 'Ge 02 plunger', weight: '1.17', material: 'PC – Grey' }] }),
  part({ slug: 'arm-rest-cover-and-movable-cap', name: 'Seat arm-rest cover and movable cap', img: 'cp3', items: [
    { name: 'Cover RR seat arm rest hole', weight: '5.0', material: 'PP' },
    { name: 'Movable cap', weight: '6.0', material: 'PA 6 GF 15%' }] }),
  part({ slug: 'seat-track-protector-and-power-seat-bush', name: 'Seat track protector and power seat bush', img: 'protector', items: [
    { name: 'Protector MNL seat track UPR rail RR', weight: '6.45', material: 'PP' },
    { name: 'Bush power seat – 3', weight: '7.65', material: 'PBT + ABS' }] }),
  part({ slug: 'door-lock-control-link-and-seat-track-protector', name: 'Door lock control link and seat track protector', img: 'snapLock', items: [
    { name: 'Snap door lock control link FR LH', weight: '1.0', material: 'POM M90-44' },
    { name: 'Protector, FR MNL seat track UPR rail RR', weight: '2.15', material: 'PP' }] }),
  part({ slug: 'door-lock-actuator-lever-and-hood-lock-bush', name: 'Door lock actuator lever and hood lock bush', img: 'leverLock', items: [
    { name: 'Lever door lock actuator locking RR LH', weight: '3.0', material: 'POM M90-44' },
    { name: 'Bush hood lock', weight: '0.4', material: 'PP_AZ564G4' }] }),
  part({ slug: 'centre-tube-with-caps', name: 'Centre tube with bottom and top caps', img: 'centreTube', items: [
    { name: 'Centre tube', weight: '11.7', material: 'Ultramide-A3WG6' },
    { name: 'Bottom cap', weight: '12.7', material: 'Ultramide-A3WG6' },
    { name: 'Top cap', weight: '6.7', material: '' }] }),
  part({ slug: 'airvent-screw', name: 'Airvent screw', img: 'airvent', items: [
    { name: 'Airvent screw', weight: '3.61', material: 'PA 6' }] }),
  part({ slug: 'lower-housings', name: 'Lower housing, driver lock and lower housing', img: 'ledCover2', items: [
    { name: 'Lower housing driver lock', weight: '23.7', material: 'Lanxess BKV30H3.0' },
    { name: 'Lower housing', weight: '15.8', material: 'Lanxess BKV30H2.0' }] })
];

function twoK(o) {
  return {
    kind: 'part2k', ...o,
    specs: [row('Part name', o.partName), row('Cavities', o.cavities), row('Plastic material', o.material), row('Part weight', o.weight)].filter(Boolean)
  };
}
export const TWOK = [
  twoK({ slug: 'over-moulded-cover', name: 'Over-moulded cover', partName: 'Over Moulded Cover', img: 'overMoulded', cavities: '2', material: 'PPGF40 + TPE', weight: '4 g' }),
  twoK({ slug: 'hvac-flap', name: 'HVAC flap', partName: 'HVAC Flap', img: 'hvacFlap', cavities: '2', material: 'PPTP 15 + TPO', weight: '34.9 g' }),
  twoK({ slug: 'knob-upper', name: 'Knob upper', partName: 'Knob Upper', img: 'knob', cavities: '2', material: 'PC ASA', weight: '3.5 g' }),
  twoK({ slug: 'dial-r-l', name: 'Dial R/L', partName: 'Dial R/L', img: 'dial', cavities: '1 + 1', material: 'PCABS TPE', weight: '11.44 g' })
];

// ---------- Machining envelopes (published strokes, mm) ----------
export const ENVELOPES = [
  { id: '3ax', label: '3-axis machining centres', w: 900, h: 700, note: 'published as “900 mm to 700 mm”', dash: true },
  { id: '5ax', label: '5-axis machining centres', w: 600, h: 400 },
  { id: 'cnc-edm', label: 'CNC EDM', w: 500, h: 400 },
  { id: 'wire-edm', label: 'Ultra-precision wire EDM', w: 500, h: 350 }
];

// ---------- FAQ (every answer is supported by site content) ----------
export const FAQ = [
  {
    q: 'What does Mastercraft Engineers manufacture?',
    a: 'Mastercraft Engineers designs and builds precision injection moulds, in both small and large sizes, and moulds plastic components, including two-component (2K) parts. Documented examples are listed on the product pages.'
  },
  {
    q: 'Where is Mastercraft Engineers based?',
    a: 'The company is a precision mould-making and moulding company based in Bangalore (Bengaluru), South India, operating since 1992. The facility is at # 126 & 127, Phase 4, Bommasandra Industrial Area, Bangalore – 560 099, India.'
  },
  {
    q: 'What machining and tooling capabilities are available?',
    a: 'Documented equipment includes 5-axis machining centres with a 600 mm × 400 mm stroke, 3-axis machining centres with a stroke of 900 mm to 700 mm, ultra-precision wire EDMs with a 500 mm × 350 mm stroke, CNC EDMs with a 500 mm × 400 mm stroke, and a tool presetter with tool measurement. Design uses CAD and CAM software.'
  },
  {
    q: 'What injection moulding capacity is documented?',
    a: 'High-precision injection moulding machines with clamping capacities from 45 to 150 tons, producing parts from 0.5 to 300 grams. The production process is monitored with Statistical Process Control (SPC) techniques on an hourly basis.'
  },
  {
    q: 'What inspection and testing equipment is used?',
    a: 'Mould inserts and plastic components are inspected using CMM touch-probe, video and laser measurement, and material flow behaviour is checked on an MFI (melt flow index) testing machine.'
  },
  {
    q: 'Which materials and component specifications are documented?',
    a: 'Component pages publish part weight and plastic raw material for each moulded part, for example POM, PC, PP, PA 6, PA 6 GF 15%, PBT + ABS and glass-filled polyamide grades. Mould pages publish mould size, mould weight, hot-runner configuration, part size and material.'
  },
  {
    q: 'What information helps when requesting a quotation?',
    a: 'Share what you want made (a mould, moulded components, or both), the part drawings or 3D model if you have them, the plastic material, the part size and weight, and the number of parts you expect to need. Use the contact form, call +91-80-27839712, or email info@mcraft.net; the team will confirm anything else needed.'
  }
];

export const GLOSSARY = [
  ['HRS (hot runner system)', 'A heated manifold and nozzle arrangement that delivers molten plastic into the mould cavity. Mould pages list the number of drops (injection points) where documented.'],
  ['CMM (coordinate measuring machine)', 'A machine that measures a part’s geometry by touching points on its surface with a probe, or by optical sensing, and comparing the result to the design.'],
  ['MFI (melt flow index)', 'A test that measures how readily a thermoplastic melt flows under a set temperature and load. It is used to check the flow behaviour of plastic material.'],
  ['SPC (statistical process control)', 'Monitoring a production process with statistical methods so that variation is detected and acted on early. At Mastercraft it is applied to injection moulding on an hourly basis.'],
  ['EDM (electrical discharge machining)', 'Shaping hard metal by controlled electrical discharges. Wire EDM cuts with a thin travelling wire; CNC EDM uses shaped electrodes.'],
  ['2K (two-component) moulding', 'Moulding a part from two different materials, for example a hard plastic with a soft elastomer, as in the over-moulded cover and dial on the 2K parts page.']
];
