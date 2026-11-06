
export function Spinner() { return <span className="spinner" aria-hidden="true" />; }

const WIZARD_STEPS = ["Fill Form", "Verify Email", "Review & Submit"];

function WizardSteps({ current }) {
  return (
    <ol className="wizard" aria-label="Progress">
      {WIZARD_STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={label} className={`wizard-step ${state}`} aria-current={state === "current" ? "step" : undefined}>
            <span className="wizard-dot" aria-hidden="true">{state === "done" ? "✓" : i + 1}</span>
            <span className="wizard-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function FormHeader({ recordWord, step }) {
  return (
    <div className="form-header">
      <div className="form-header-accent" />
      <div className="form-header-accent2" />
      <div className="form-header-inner">
        <div className="header-left"><h2 id="dialog-title" className="header-title">{recordWord}</h2></div>
        <div className="header-badge" aria-hidden="true">{recordWord}</div>
      </div>
      {step !== undefined && <WizardSteps current={step} />}
      <div className="form-header-divider" />
    </div>
  );
}

export function FormActions({ status, onCancel, onSubmit, cancelLabel = "Cancel", submitLabel = "Submit Request" }) {
  const loading = status === "loading";
  return (
    <div className="form-actions">
      <div className="form-status" aria-hidden="true" />
      <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
      <button type="button" className="btn-submit" onClick={onSubmit} disabled={loading} aria-busy={loading}>
        {loading ? <><Spinner />Saving…</> : submitLabel}
      </button>
    </div>
  );
}
