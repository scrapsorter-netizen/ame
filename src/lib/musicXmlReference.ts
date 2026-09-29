/**
 * Comprehensive MusicXML Tags & Attributes Reference Guide
 * Focused on core scoring, Arabic quarter-tones, microtonal accidentals, and violin notation.
 */

export interface MusicXmlAttributeDoc {
  name: string;
  type: string;
  description: string;
  allowedValues?: string[];
  example?: string;
}

export interface MusicXmlTagDoc {
  id: string;
  tag: string;
  category: 
    | 'Structure'
    | 'Attributes (Setup)'
    | 'Notes & Pitches'
    | 'Quarter-Tones & Accidentals'
    | 'Violin & Ornaments'
    | 'Directions & Dynamics'
    | 'Barlines & Repeats';
  summary: string;
  parent: string;
  childrenOrValue: string;
  attributes: MusicXmlAttributeDoc[];
  example: string;
  arabicTip?: string;
}

export const MUSIC_XML_CATEGORIES = [
  'All',
  'Quarter-Tones & Accidentals',
  'Notes & Pitches',
  'Attributes (Setup)',
  'Violin & Ornaments',
  'Directions & Dynamics',
  'Barlines & Repeats',
  'Structure',
] as const;

export const MUSIC_XML_REFERENCE: MusicXmlTagDoc[] = [
  // 1. Quarter-Tones & Accidentals
  {
    id: 'alter',
    tag: '<alter>',
    category: 'Quarter-Tones & Accidentals',
    summary: 'Specifies the chromatic and microtonal pitch alteration in decimal semitones. Essential for Arabic quarter-tones (±0.5 = ±50 cents).',
    parent: '<pitch>, <key>',
    childrenOrValue: 'Decimal number (-2.0 to +2.0, e.g. -0.5, 0.5, -1, 1)',
    attributes: [],
    example: `<pitch>
  <step>E</step>
  <alter>-0.5</alter>
  <octave>4</octave>
</pitch>`,
    arabicTip: 'Use -0.5 for Sikah, Bayati, and Rast half-flats (نصف بيمول). Use 0.5 for Hijaz quarter-sharps.',
  },
  {
    id: 'accidental',
    tag: '<accidental>',
    category: 'Quarter-Tones & Accidentals',
    summary: 'Controls the visual notation accidental symbol rendered on the staff, including SMuFL quarter-tone glyphs.',
    parent: '<note>',
    childrenOrValue: 'slash-flat | quarter-flat | quarter-sharp | flat | sharp | natural | three-quarters-flat | double-sharp',
    attributes: [
      { name: 'bracket', type: 'yes | no', description: 'Whether accidental is enclosed in editorial brackets' },
      { name: 'parentheses', type: 'yes | no', description: 'Whether accidental is enclosed in cautionary parentheses' },
      { name: 'cautionary', type: 'yes | no', description: 'Indicates a cautionary / courtesy accidental' },
    ],
    example: `<note>
  <pitch>
    <step>E</step>
    <alter>-0.5</alter>
    <octave>4</octave>
  </pitch>
  <duration>2</duration>
  <type>quarter</type>
  <accidental>slash-flat</accidental>
</note>`,
    arabicTip: '`slash-flat` produces the standard Arabic half-flat symbol (b with stroke through the stem 𝄳).',
  },
  {
    id: 'key-step-alter',
    tag: '<key-step> & <key-alter>',
    category: 'Quarter-Tones & Accidentals',
    summary: 'Specifies non-traditional microtonal key signature elements for Arabic Maqamat directly in the staff header.',
    parent: '<key>',
    childrenOrValue: '<key-step>C..B</key-step>, <key-alter>-0.5..0.5</key-alter>, <key-accidental>slash-flat</key-accidental>',
    attributes: [],
    example: `<key>
  <fifths>0</fifths>
  <mode>major</mode>
  <!-- Sikah half-flat on E -->
  <key-step>E</key-step>
  <key-alter>-0.5</key-alter>
  <key-accidental>slash-flat</key-accidental>
  <!-- Awj half-flat on B -->
  <key-step>B</key-step>
  <key-alter>-0.5</key-alter>
  <key-accidental>slash-flat</key-accidental>
</key>`,
    arabicTip: 'Allows Maqam Rast key signatures to display quarter-flats on the 3rd and 7th lines/spaces of the staff.',
  },

  // 2. Notes & Pitches
  {
    id: 'note',
    tag: '<note>',
    category: 'Notes & Pitches',
    summary: 'Fundamental building block of musical score content representing pitched notes, chords, and rests.',
    parent: '<measure>',
    childrenOrValue: '<pitch> | <rest>, <duration>, <type>, <accidental>, <notations>, <lyric>',
    attributes: [
      { name: 'print-object', type: 'yes | no', description: 'Whether the note is drawn or invisible' },
      { name: 'attack', type: 'number', description: 'Sound attack alteration in divisions' },
    ],
    example: `<note>
  <pitch>
    <step>D</step>
    <octave>4</octave>
  </pitch>
  <duration>2</duration>
  <type>quarter</type>
</note>`,
    arabicTip: 'In violin Arabic scores, D4 corresponds to the 3rd open string (Dukah دوكاه).',
  },
  {
    id: 'pitch',
    tag: '<pitch>',
    category: 'Notes & Pitches',
    summary: 'Defines the pitch of a note by step letter (A-G), octave number (0-9), and optional microtonal alter.',
    parent: '<note>',
    childrenOrValue: '<step>, <alter>, <octave>',
    attributes: [],
    example: `<pitch>
  <step>A</step>
  <octave>4</octave>
</pitch>`,
    arabicTip: 'A4 (440 Hz) is the 2nd open violin string (Husayni حسيني).',
  },
  {
    id: 'rest',
    tag: '<rest/>',
    category: 'Notes & Pitches',
    summary: 'Indicates a silent pause for the specified rhythmic duration or entire measure.',
    parent: '<note>',
    childrenOrValue: 'Empty tag (or <display-step> and <display-octave> for vertical staff positioning)',
    attributes: [
      { name: 'measure', type: 'yes | no', description: 'yes if this rest occupies the entire measure' },
    ],
    example: `<note>
  <rest measure="yes"/>
  <duration>8</duration>
  <type>whole</type>
</note>`,
  },
  {
    id: 'duration',
    tag: '<duration>',
    category: 'Notes & Pitches',
    summary: 'Musical duration of the note measured in division ticks (defined by <attributes><divisions>).',
    parent: '<note>, <backup>, <forward>',
    childrenOrValue: 'Integer (e.g. 1, 2, 4)',
    attributes: [],
    example: `<!-- If divisions = 2, then quarter note duration = 2, eighth note = 1 -->
<duration>2</duration>`,
  },
  {
    id: 'type',
    tag: '<type>',
    category: 'Notes & Pitches',
    summary: 'Visual rhythmic notehead shape and beam stem representation.',
    parent: '<note>',
    childrenOrValue: '1024th | 512th | 256th | 128th | 64th | 32nd | 16th | eighth | quarter | half | whole | breve | long | maxima',
    attributes: [],
    example: `<type>eighth</type>`,
  },
  {
    id: 'dot',
    tag: '<dot/>',
    category: 'Notes & Pitches',
    summary: 'Adds a rhythmic augmentation dot extending note duration by 50% (or multiple dots for double-dotted notes).',
    parent: '<note>',
    childrenOrValue: 'Empty element',
    attributes: [],
    example: `<note>
  <pitch><step>G</step><octave>4</octave></pitch>
  <duration>3</duration>
  <type>quarter</type>
  <dot/>
</note>`,
  },
  {
    id: 'chord',
    tag: '<chord/>',
    category: 'Notes & Pitches',
    summary: 'Indicates that this note is played concurrently with the preceding note (double-stops on violin).',
    parent: '<note>',
    childrenOrValue: 'Empty element',
    attributes: [],
    example: `<!-- Double stop on violin: D4 open + A4 open -->
<note>
  <pitch><step>D</step><octave>4</octave></pitch>
  <duration>4</duration>
  <type>half</type>
</note>
<note>
  <chord/>
  <pitch><step>A</step><octave>4</octave></pitch>
  <duration>4</duration>
  <type>half</type>
</note>`,
    arabicTip: 'Commonly used in Arabic violin playing for resonant open string drone harmonies (istikhbar / taqsim).',
  },
  {
    id: 'beam',
    tag: '<beam>',
    category: 'Notes & Pitches',
    summary: 'Defines rhythmic grouping beams connecting eighth, 16th, and smaller notes.',
    parent: '<note>',
    childrenOrValue: 'begin | continue | end | forward hook | backward hook',
    attributes: [
      { name: 'number', type: '1..8', description: '1 for 8th beam, 2 for 16th beam, 3 for 32nd beam' },
    ],
    example: `<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>1</duration>
  <type>eighth</type>
  <beam number="1">begin</beam>
</note>`,
  },

  // 3. Attributes (Setup)
  {
    id: 'attributes',
    tag: '<attributes>',
    category: 'Attributes (Setup)',
    summary: 'Musical context specifications for a measure: time signature, key, clef, divisions, and staff count.',
    parent: '<measure>',
    childrenOrValue: '<divisions>, <key>, <time>, <staves>, <clef>, <transpose>',
    attributes: [],
    example: `<attributes>
  <divisions>2</divisions>
  <key>
    <fifths>0</fifths>
    <mode>major</mode>
  </key>
  <time>
    <beats>4</beats>
    <beat-type>4</beat-type>
  </time>
  <clef>
    <sign>G</sign>
    <line>2</line>
  </clef>
</attributes>`,
  },
  {
    id: 'divisions',
    tag: '<divisions>',
    category: 'Attributes (Setup)',
    summary: 'Specifies how many internal duration ticks equal one quarter note. 2 or 4 divisions are standard.',
    parent: '<attributes>',
    childrenOrValue: 'Positive integer (e.g. 2 means eighth=1, quarter=2, half=4)',
    attributes: [],
    example: `<divisions>2</divisions>`,
  },
  {
    id: 'key',
    tag: '<key>',
    category: 'Attributes (Setup)',
    summary: 'Sets the standard cycle of fifths (-7 flats to +7 sharps) and modal quality (major, minor, or maqam).',
    parent: '<attributes>',
    childrenOrValue: '<fifths>, <mode>, optional <key-step>, <key-alter>, <key-accidental>',
    attributes: [
      { name: 'number', type: 'integer', description: 'Staff number when multiple staves are present' },
    ],
    example: `<key>
  <fifths>-1</fifths>
  <mode>minor</mode>
</key>`,
    arabicTip: '1 flat (B♭) is the standard foundation key for Maqam Bayati, Hijaz, and Kurd on D.',
  },
  {
    id: 'time',
    tag: '<time>',
    category: 'Attributes (Setup)',
    summary: 'Defines the meter and rhythmic cycle (Iqa’ إيقاع) through beat count and beat unit type.',
    parent: '<attributes>',
    childrenOrValue: '<beats>, <beat-type>',
    attributes: [
      { name: 'symbol', type: 'common | cut | single-number | normal', description: 'Visual appearance of time signature' },
    ],
    example: `<!-- 10/8 Sama'i Thaqil (سماعي ثقيل) -->
<time>
  <beats>10</beats>
  <beat-type>8</beat-type>
</time>`,
    arabicTip: 'Popular Arabic meters include 10/8 (Sama\'i), 2/4 (Malfuf/Longa), 4/4 (Masmoudi Saghir/Wahda), and 8/4 (Chiftetelli).',
  },
  {
    id: 'clef',
    tag: '<clef>',
    category: 'Attributes (Setup)',
    summary: 'Assigns the clef symbol and reference staff line. G on line 2 denotes standard Treble Clef for violin.',
    parent: '<attributes>',
    childrenOrValue: '<sign>, <line>, <clef-octave-change>',
    attributes: [],
    example: `<clef>
  <sign>G</sign>
  <line>2</line>
</clef>`,
    arabicTip: 'Violin and Oud (written in treble) use G clef on line 2.',
  },

  // 4. Violin & Ornaments
  {
    id: 'notations',
    tag: '<notations>',
    category: 'Violin & Ornaments',
    summary: 'Container for performance expressions: bow directions, fingerings, slurs, ties, trills, and glissandi.',
    parent: '<note>',
    childrenOrValue: '<tied>, <slur>, <technical>, <ornaments>, <articulations>, <glissando>',
    attributes: [],
    example: `<notations>
  <technical>
    <down-bow/>
    <fingering>1</fingering>
  </technical>
</notations>`,
  },
  {
    id: 'technical-violin',
    tag: '<technical>',
    category: 'Violin & Ornaments',
    summary: 'Instrument-specific technical markings: bow strokes (up-bow, down-bow), string numbers, and fingerings.',
    parent: '<notations>',
    childrenOrValue: '<up-bow/> | <down-bow/> | <open-string/> | <fingering> | <string> | <harmonic/>',
    attributes: [],
    example: `<technical>
  <down-bow/>
  <open-string/>
</technical>`,
    arabicTip: 'Violin open strings: G3 (4th string), D4 (3rd string), A4 (2nd string), E5 (1st string).',
  },
  {
    id: 'fingering',
    tag: '<fingering>',
    category: 'Violin & Ornaments',
    summary: 'Finger number designation for string player positioning.',
    parent: '<technical>',
    childrenOrValue: '0 (open string), 1, 2, 3, 4',
    attributes: [],
    example: `<technical>
  <fingering>1</fingering>
</technical>`,
    arabicTip: 'In Arabic violin playing, half-flats like E𝄳 on the D string are played with 1st finger shifted slightly forward.',
  },
  {
    id: 'slur',
    tag: '<slur>',
    category: 'Violin & Ornaments',
    summary: 'Legato bowing phrase connecting consecutive notes in a single smooth bow stroke.',
    parent: '<notations>',
    childrenOrValue: 'Empty element',
    attributes: [
      { name: 'type', type: 'start | stop', description: 'Begins or terminates the slur arc' },
      { name: 'number', type: 'integer', description: 'Identifies concurrent slur lines (1, 2)' },
      { name: 'placement', type: 'above | below', description: 'Position relative to notehead' },
    ],
    example: `<!-- Note 1 starts slur -->
<notations>
  <slur type="start" number="1" placement="above"/>
</notations>
<!-- Note 2 ends slur -->
<notations>
  <slur type="stop" number="1"/>
</notations>`,
  },
  {
    id: 'glissando',
    tag: '<glissando>',
    category: 'Violin & Ornaments',
    summary: 'Continuous microtonal pitch slide between two notes. Characteristic of soulful Arabic violin taqsims.',
    parent: '<notations>',
    childrenOrValue: 'Empty element or text label',
    attributes: [
      { name: 'type', type: 'start | stop', description: 'Begins or finishes the glissando slide' },
      { name: 'line-type', type: 'wavy | straight', description: 'Visual style of slide line' },
    ],
    example: `<notations>
  <glissando type="start" line-type="wavy"/>
</notations>`,
    arabicTip: 'Essential for expressive portamento slides up to quarter-tone Sikah cadences.',
  },
  {
    id: 'ornaments-trill',
    tag: '<trill-mark> & <mordent>',
    category: 'Violin & Ornaments',
    summary: 'Arabic ornaments such as trills, mordents, and turns decorating melodic motifs.',
    parent: '<ornaments> inside <notations>',
    childrenOrValue: 'Empty element',
    attributes: [
      { name: 'placement', type: 'above | below', description: 'Vertical placement' },
    ],
    example: `<notations>
  <ornaments>
    <trill-mark placement="above"/>
  </ornaments>
</notations>`,
  },

  // 5. Directions & Dynamics
  {
    id: 'direction',
    tag: '<direction>',
    category: 'Directions & Dynamics',
    summary: 'Non-note score events including tempo indications, expressive text, Arabic titles, and dynamic marks.',
    parent: '<measure>',
    childrenOrValue: '<direction-type>, <sound>',
    attributes: [
      { name: 'placement', type: 'above | below', description: 'Staff placement' },
    ],
    example: `<direction placement="above">
  <direction-type>
    <words font-style="italic">Taqsim Maqam Rast (تقسيم راست)</words>
  </direction-type>
</direction>`,
  },
  {
    id: 'sound-tempo',
    tag: '<sound tempo="...">',
    category: 'Directions & Dynamics',
    summary: 'Explicit audio synthesizer playback tempo instruction in Beats Per Minute (BPM).',
    parent: '<direction>',
    childrenOrValue: 'Empty element',
    attributes: [
      { name: 'tempo', type: 'number', description: 'BPM playback speed (e.g. tempo="92")' },
      { name: 'dynamics', type: 'number', description: 'MIDI velocity value (0-127)' },
    ],
    example: `<direction placement="above">
  <direction-type>
    <metronome>
      <beat-unit>quarter</beat-unit>
      <per-minute>92</per-minute>
    </metronome>
  </direction-type>
  <sound tempo="92"/>
</direction>`,
  },
  {
    id: 'words',
    tag: '<words>',
    category: 'Directions & Dynamics',
    summary: 'Text annotation element supporting styling and Arabic RTL titles or poetry lyrics.',
    parent: '<direction-type>',
    childrenOrValue: 'Text string',
    attributes: [
      { name: 'font-weight', type: 'bold | normal', description: 'Font weight' },
      { name: 'font-style', type: 'italic | normal', description: 'Font style' },
      { name: 'font-size', type: 'points or CSS size', description: 'Font scale' },
      { name: 'dir', type: 'rtl | ltr | auto', description: 'Text flow direction' },
    ],
    example: `<direction-type>
  <words font-weight="bold" dir="rtl">دولاب بياتي - كمان</words>
</direction-type>`,
  },
  {
    id: 'dynamics',
    tag: '<dynamics>',
    category: 'Directions & Dynamics',
    summary: 'Acoustic volume intensity levels from soft pianissimo to loud fortissimo.',
    parent: '<direction-type>',
    childrenOrValue: '<p/> | <pp/> | <mp/> | <mf/> | <f/> | <ff/> | <fp/> | <sfz/>',
    attributes: [],
    example: `<direction placement="below">
  <direction-type>
    <dynamics>
      <mf/>
    </dynamics>
  </direction-type>
</direction>`,
  },

  // 6. Barlines & Repeats
  {
    id: 'barline',
    tag: '<barline>',
    category: 'Barlines & Repeats',
    summary: 'Specifies custom barline visual appearance, double barlines, section breaks, and repeat brackets.',
    parent: '<measure>',
    childrenOrValue: '<bar-style>, <repeat>, <ending>',
    attributes: [
      { name: 'location', type: 'right | left | middle', description: 'Where within measure barline is drawn' },
    ],
    example: `<!-- Final piece barline -->
<barline location="right">
  <bar-style>light-heavy</bar-style>
</barline>`,
  },
  {
    id: 'repeat',
    tag: '<repeat>',
    category: 'Barlines & Repeats',
    summary: 'Repeat signs for musical reprise (Taslim تسليم and Khanat خانات in classical Arab suites).',
    parent: '<barline>',
    childrenOrValue: 'Empty element',
    attributes: [
      { name: 'direction', type: 'forward | backward', description: 'forward = start repeat, backward = end repeat' },
      { name: 'times', type: 'integer', description: 'Number of repetitions (default 2)' },
    ],
    example: `<barline location="right">
  <bar-style>light-heavy</bar-style>
  <repeat direction="backward"/>
</barline>`,
  },

  // 7. Structure
  {
    id: 'score-partwise',
    tag: '<score-partwise>',
    category: 'Structure',
    summary: 'Root document element of partwise MusicXML containing work info, parts list, and measure parts.',
    parent: 'Root document element',
    childrenOrValue: '<work>, <identification>, <part-list>, <part>+',
    attributes: [
      { name: 'version', type: 'string', description: 'MusicXML specification version (e.g. "3.1" or "4.0")' },
    ],
    example: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  ...
</score-partwise>`,
  },
  {
    id: 'part-list',
    tag: '<part-list>',
    category: 'Structure',
    summary: 'Header listing of all instrumental and vocal parts in the score with IDs and MIDI instruments.',
    parent: '<score-partwise>',
    childrenOrValue: '<score-part>+',
    attributes: [],
    example: `<part-list>
  <score-part id="P1">
    <part-name>Violin Solo</part-name>
    <part-abbreviation>Vln.</part-abbreviation>
    <score-instrument id="P1-I1">
      <instrument-name>Violin (كمان)</instrument-name>
    </score-instrument>
  </score-part>
</part-list>`,
  },
  {
    id: 'part',
    tag: '<part>',
    category: 'Structure',
    summary: 'Container for all musical measures belonging to a specific instrument part.',
    parent: '<score-partwise>',
    childrenOrValue: '<measure>+',
    attributes: [
      { name: 'id', type: 'IDREF', description: 'Matches an ID declared in <score-part id="..."> e.g. "P1"' },
    ],
    example: `<part id="P1">
  <measure number="1">
    ...
  </measure>
</part>`,
  },
  {
    id: 'measure',
    tag: '<measure>',
    category: 'Structure',
    summary: 'Single metric bar containing musical notes, rests, directions, and barline declarations.',
    parent: '<part>',
    childrenOrValue: '<attributes>?, <direction>*, (<note> | <backup> | <forward>)*, <barline>?',
    attributes: [
      { name: 'number', type: 'string / integer', description: 'Measure label or sequence number e.g. "1"' },
      { name: 'width', type: 'number', description: 'Optional layout width in tenths' },
    ],
    example: `<measure number="1">
  <attributes>
    <divisions>2</divisions>
  </attributes>
  <note>
    <pitch><step>D</step><octave>4</octave></pitch>
    <duration>2</duration>
    <type>quarter</type>
  </note>
</measure>`,
  }
];
