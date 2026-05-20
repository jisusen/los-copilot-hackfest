// Tweaks panel — applies design-system level changes via data attrs.
// Also publishes per-task "live view" state so the Dashboard can react.

function HifiTweaks() {
  const [tweaks, setTweak] = useTweaks(window.__TWEAK_DEFAULTS || { density: "cozy", accent: "navy" });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", tweaks.density);
    document.documentElement.setAttribute("data-accent", tweaks.accent);

    // Publish live-view states + notify subscribers (the dashboard listens)
    const live = {};
    Object.keys(tweaks).forEach(k => { if (k.startsWith("live_")) live[k.slice(5)] = !!tweaks[k]; });
    window.__liveStates = live;
    window.dispatchEvent(new CustomEvent("liveStatesChanged", { detail: live }));
  }, [tweaks]);

  // Build the list of live-view toggles dynamically from any "live_<APP-ID>" keys
  const liveKeys = Object.keys(tweaks).filter(k => k.startsWith("live_"));
  const allOn  = liveKeys.length > 0 && liveKeys.every(k => tweaks[k]);
  const allOff = liveKeys.length > 0 && liveKeys.every(k => !tweaks[k]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Density">
        <TweakRadio
          options={[{value:"cozy", label:"Cozy"}, {value:"compact", label:"Compact"}]}
          value={tweaks.density}
          onChange={(v) => setTweak("density", v)}
        />
      </TweakSection>
      <TweakSection title="Brand accent">
        <TweakRadio
          options={[
            {value:"navy",       label:"Navy"},
            {value:"forest",     label:"Forest"},
            {value:"terracotta", label:"Terra"},
            {value:"burgundy",   label:"Burgundy"},
            {value:"charcoal",   label:"Mono"},
          ]}
          value={tweaks.accent}
          onChange={(v) => setTweak("accent", v)}
        />
      </TweakSection>

      {liveKeys.length > 0 && (
        <TweakSection title="Live agent view">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {liveKeys.map(k => {
              const id = k.slice(5);
              const loan = (window.HIFI_LOANS || []).find(l => l.id === id);
              const label = loan ? `${id} · ${loan.name.split(' ')[0]}` : id;
              return (
                <TweakToggle
                  key={k}
                  label={label}
                  value={!!tweaks[k]}
                  onChange={(v) => setTweak(k, v)}
                />
              );
            })}
            <div style={{display:'flex', gap:6, marginTop:4}}>
              <button
                onClick={() => {
                  const patch = {};
                  liveKeys.forEach(k => patch[k] = true);
                  setTweak(patch);
                }}
                disabled={allOn}
                style={btnStyle(allOn)}
              >All on</button>
              <button
                onClick={() => {
                  const patch = {};
                  liveKeys.forEach(k => patch[k] = false);
                  setTweak(patch);
                }}
                disabled={allOff}
                style={btnStyle(allOff)}
              >All off</button>
            </div>
          </div>
        </TweakSection>
      )}
    </TweaksPanel>
  );
}

function btnStyle(disabled) {
  return {
    flex:1, padding:'6px 10px', fontSize:11, fontFamily:'inherit',
    border:'1px solid #d4d4d0', background: disabled ? '#f3f3ee' : '#fff',
    color: disabled ? '#aaa' : '#222', borderRadius:6, cursor: disabled ? 'default' : 'pointer',
  };
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<HifiTweaks/>);
