// App: render all wireframes onto a DesignCanvas with Tweaks support.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d97742",
  "showAnnotations": true,
  "density": "cozy"
}/*EDITMODE-END*/;

const FRAME_W = 1280;
const FRAME_H = 800;

function Frame({ children }) {
  return (
    <div style={{ width: FRAME_W, height: FRAME_H, display:'flex' }}>
      {children}
    </div>
  );
}

function Annotation({ children, position }) {
  if (!position) return null;
  return (
    <div style={{
      position: 'absolute',
      ...position,
      fontFamily: 'var(--font-hand)',
      color: 'var(--accent)',
      fontSize: 22,
      lineHeight: 1.15,
      pointerEvents: 'none',
      maxWidth: 220,
    }}>
      {children}
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
  }, [tweaks.accent]);

  const showAnno = tweaks.showAnnotations;

  return (
    <>
      <DesignCanvas>
        <DCSection id="dashboards" title="Dashboard — 5 directions" subtitle="Pipeline-oriented · grayscale + 1 accent · pick what feels right">
          <DCArtboard id="d1" label="01 · Classic Kanban" width={FRAME_W} height={FRAME_H}>
            <Frame><D1ClassicKanban/></Frame>
            {showAnno && <>
              <Annotation position={{top: 100, left: -210, textAlign:'right'}}>4 honest columns.<br/>The pipeline IS the page.</Annotation>
              <Annotation position={{top: 460, right: -200}}>"Run review" lives where<br/>selection happens — left rail.</Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="d2" label="02 · Pipeline + Featured Live Agent" width={FRAME_W} height={FRAME_H}>
            <Frame><D2PipelineFeatured/></Frame>
            {showAnno && <>
              <Annotation position={{top: 80, left: -230, textAlign:'right'}}>Stat strip up top —<br/>5min demo opener.</Annotation>
              <Annotation position={{top: 380, left: -220, textAlign:'right'}}>Big featured agent<br/>= the wow moment.</Annotation>
              <Annotation position={{top: 380, right: -200}}>Pipeline still visible<br/>but compressed →</Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="d3" label="03 · Triage-First" width={FRAME_W} height={FRAME_H}>
            <Frame><D3TriageFirst/></Frame>
            {showAnno && <>
              <Annotation position={{top: 90, left: -230, textAlign:'right'}}>What needs YOU,<br/>now? Top of fold.</Annotation>
              <Annotation position={{top: 470, left: -220, textAlign:'right'}}>Queue & agents<br/>are supporting cast.</Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="d4" label="04 · Command Center" width={FRAME_W} height={FRAME_H}>
            <Frame><D4CommandCenter/></Frame>
            {showAnno && <>
              <Annotation position={{top: 80, left: -220, textAlign:'right'}}>Vertical pipeline rail —<br/>always-on context.</Annotation>
              <Annotation position={{top: 80, right: -210}}>Right panel = active<br/>agent's activity log.</Annotation>
              <Annotation position={{top: 480, left: 320, color:'var(--accent)', background:'rgba(217,119,66,.08)', padding:'4px 8px', borderRadius: 4}}>
                Theater shows ONE focus + thumbnails of others
              </Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="d5" label="05 · Cinema Grid (wild card)" width={FRAME_W} height={FRAME_H}>
            <Frame><D5CinemaGrid/></Frame>
            {showAnno && <>
              <Annotation position={{top: 90, left: -240, textAlign:'right'}}>Dark mode +<br/>4 equal live agents.<br/><span style={{fontSize:14, color:'var(--ink-3)'}}>(Demo crowd-pleaser)</span></Annotation>
              <Annotation position={{top: 80, right: -200}}>Pipeline collapsed<br/>into a status river.</Annotation>
              <Annotation position={{top: 700, left: 480, color:'var(--ink-3)', fontSize: 16}}>
                Best for projector / 5-min wow
              </Annotation>
            </>}
          </DCArtboard>
        </DCSection>

        <DCSection id="detail" title="Detail page — 3 directions" subtitle="What does the analyst do once an agent is ready?">
          <DCArtboard id="x1" label="01 · Refined Memo + Chat" width={FRAME_W} height={FRAME_H}>
            <Frame><Det1MemoChat/></Frame>
            {showAnno && <>
              <Annotation position={{top: 110, left: -220, textAlign:'right'}}>Same shape as today,<br/>just calmer + clearer.</Annotation>
              <Annotation position={{top: 250, right: -210}}>Suggested questions<br/>as dashed chips →</Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="x2" label="02 · Evidence-Linked Memo" width={FRAME_W} height={FRAME_H}>
            <Frame><Det2EvidenceLinked/></Frame>
            {showAnno && <>
              <Annotation position={{top: 250, left: -240, textAlign:'right'}}>Every claim cites<br/>its LOS source.</Annotation>
              <Annotation position={{top: 250, right: -200}}>Click [src-…] →<br/>panel scrolls to data.</Annotation>
              <Annotation position={{top: 110, left: 380, fontSize: 16, color:'var(--ink-3)'}}>
                Builds analyst trust in the AI
              </Annotation>
            </>}
          </DCArtboard>

          <DCArtboard id="x3" label="03 · Verdict-First" width={FRAME_W} height={FRAME_H}>
            <Frame><Det3VerdictFirst/></Frame>
            {showAnno && <>
              <Annotation position={{top: 90, left: -220, textAlign:'right'}}>Recommendation owns<br/>the top of fold.</Annotation>
              <Annotation position={{top: 240, left: -220, textAlign:'right'}}>Decision buttons<br/>up high — no scroll.</Annotation>
              <Annotation position={{top: 400, right: -210}}>Tabs let analyst pick<br/>their own depth.</Annotation>
            </>}
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Wireframe tweaks" defaultOpen={false}>
        <TweakSection title="Display">
          <TweakToggle label="Margin annotations"
            value={tweaks.showAnnotations}
            onChange={v => setTweak('showAnnotations', v)} />
          <TweakColor label="Accent"
            value={tweaks.accent}
            onChange={v => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection title="Notes">
          <div style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-3)', lineHeight: 1.55}}>
            Drag artboards to reorder. Click ⤢ on any frame to view fullscreen.
            Inline-rename labels and section titles by clicking them.
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
