import { SampleScore } from '../types';

export const SAMPLE_SCORES: SampleScore[] = [
  {
    id: 'dulab-rast',
    title: 'Dulab Rast (Traditional)',
    arabicTitle: 'دولاب راست تراثي',
    composer: 'Traditional Arab Classical',
    maqam: 'Maqam Rast',
    meter: '4/4',
    tempo: 92,
    description: 'The standard opening instrumental prelude in Maqam Rast. Features iconic quarter-tone half-flats on E (Sikah) and B (Awj).',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Dulab Rast - دولاب راست</work-title>
  </work>
  <identification>
    <creator type="composer">Traditional (تراث)</creator>
    <creator type="arranger">Arr. for Violin (كمان)</creator>
    <rights>Public Domain</rights>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Violin</part-name>
      <part-abbreviation>Vln.</part-abbreviation>
      <score-instrument id="P1-I1">
        <instrument-name>Violin</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>41</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
    <!-- Measure 1 -->
    <measure number="1">
      <attributes>
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
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>92</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="92"/>
      </direction>
      <!-- C4 Rast -->
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- D4 Dukah -->
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- E half-flat (Quarter flat) Sikah -->
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- F4 Jaharkah -->
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 2 -->
    <measure number="2">
      <!-- G4 Nawa -->
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot/>
      </note>
      <!-- A4 Husayni -->
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <!-- B half-flat (Quarter flat) Awj -->
      <note>
        <pitch>
          <step>B</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- C5 Kardan -->
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 3 -->
    <measure number="3">
      <!-- Descending passage: B half-flat -->
      <note>
        <pitch>
          <step>B</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- A4 -->
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- G4 -->
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- F4 -->
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 4 -->
    <measure number="4">
      <!-- E half-flat -->
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- D4 -->
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- C4 Tonic resolution -->
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'samai-bayati',
    title: 'Samai Bayati Al-Aryan',
    arabicTitle: 'سماعي بياتي العريان',
    composer: 'Tatyos Efendi / Ibrahim Al-Aryan',
    maqam: 'Maqam Bayati',
    meter: '10/8 (Samai Thaqil)',
    tempo: 108,
    description: 'Renowned 10/8 classical masterpiece in Maqam Bayati with tonic on D4 and characteristic Sikah quarter-tone on E𝄳4.',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Samai Bayati Al-Aryan - سماعي بياتي</work-title>
  </work>
  <identification>
    <creator type="composer">Ibrahim Al-Aryan (إبراهيم العريان)</creator>
    <creator type="arranger">Violin Solo (كمان منفرد)</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Violin</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Violin</instrument-name>
      </score-instrument>
    </score-part>
  </part-list>
  <part id="P1">
    <!-- Measure 1 -->
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key>
          <fifths>-1</fifths>
        </key>
        <time>
          <beats>10</beats>
          <beat-type>8</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>108</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="108"/>
      </direction>
      <!-- D4 -->
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- E half-flat -->
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- F4 -->
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- G4 -->
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- A4 -->
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot/>
      </note>
    </measure>
    <!-- Measure 2 -->
    <measure number="2">
      <!-- B flat -->
      <note>
        <pitch>
          <step>B</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>flat</accidental>
      </note>
      <!-- A4 -->
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <!-- G4 -->
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- F4 -->
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <!-- E half-flat -->
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <!-- D4 -->
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'violin-open-strings-study',
    title: 'Violin Open Strings & Quarter-Tone Study',
    arabicTitle: 'تمرين أوتار الكمان المطلقة ونصف البيمول',
    composer: 'Pedagogical Violin Study',
    maqam: 'Maqam Rast / Bayati',
    meter: '4/4',
    tempo: 84,
    description: 'Focused pedagogical study highlighting Western tuning open strings (G3, D4, A4, E5) and fingered quarter-tone half-flats (E𝄳 and B𝄳).',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Violin Open Strings &amp; Quarter-Tones - أوتار الكمان</work-title>
  </work>
  <identification>
    <creator type="composer">Studio Study</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Violin</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Violin (G3 D4 A4 E5)</instrument-name>
      </score-instrument>
    </score-part>
  </part-list>
  <part id="P1">
    <!-- Measure 1: The 4 Open Strings -->
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <words font-style="italic">Open strings: G3 - D4 - A4 - E5</words>
        </direction-type>
        <sound tempo="84"/>
      </direction>
      <!-- G3 Open 4th string -->
      <note>
        <pitch>
          <step>G</step>
          <octave>3</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <!-- D4 Open 3rd string -->
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <!-- A4 Open 2nd string -->
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <!-- E5 Open 1st string -->
      <note>
        <pitch>
          <step>E</step>
          <octave>5</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 2: Quarter tones on D string (E half-flat) -->
    <measure number="2">
      <direction placement="above">
        <direction-type>
          <words font-style="italic">Quarter-tone E half-flat (سيكاه)</words>
        </direction-type>
      </direction>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 3: Quarter tones on A string (B half-flat) -->
    <measure number="3">
      <direction placement="above">
        <direction-type>
          <words font-style="italic">Quarter-tone B half-flat (أوج)</words>
        </direction-type>
      </direction>
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>B</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>5</octave>
        </pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'taqsim-saba',
    title: 'Taqsim Violin in Maqam Saba',
    arabicTitle: 'تقسيم كمان صبا',
    composer: 'Classical Arabic Improvisation',
    maqam: 'Maqam Saba',
    meter: 'Free / 4/4',
    tempo: 78,
    description: 'Soulful melody in Maqam Saba with E𝄳4 (quarter-flat) and G♭4, conveying heartfelt emotional depth.',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Taqsim Saba - تقسيم صبا</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>Violin Solo</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>78</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="78"/>
      </direction>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <accidental>flat</accidental>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <accidental>flat</accidental>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <alter>-0.5</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <accidental>slash-flat</accidental>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'longa-nahawand',
    title: 'Longa Nahawand / Hijaz',
    arabicTitle: 'لونجا نهاوند',
    composer: 'Classical Ottoman / Arab Tradition',
    maqam: 'Maqam Nahawand',
    meter: '2/4',
    tempo: 120,
    description: 'Lively, energetic instrumental Longa in 2/4 meter with fast violin runs and rhythmic cadences.',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Longa Nahawand - لونجا نهاوند</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>Violin</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key>
          <fifths>-3</fifths>
        </key>
        <time>
          <beats>2</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <sound tempo="120"/>
      </direction>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`
  }
];
