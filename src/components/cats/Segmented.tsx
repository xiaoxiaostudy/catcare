interface Props {
  value: string | undefined;
  options: [string, string][];
  onChange: (value: string | undefined) => void;
  label?: string;
}

/** 一排按钮单选；再点一下已选中的按钮就取消，表示「今天没记这项」。 */
export function Segmented({ value, options, onChange, label }: Props) {
  return (
    <div class="seg-group" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === v}
          class={value === v ? 'seg-btn on' : 'seg-btn'}
          onClick={() => onChange(value === v ? undefined : v)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

interface StepperProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label: string;
  max?: number;
}

/** 计数用的加减器；没点过时显示「—」，表示没记。 */
export function Stepper({ value, onChange, label, max = 20 }: StepperProps) {
  return (
    <div class="stepper" aria-label={label}>
      <button type="button" aria-label={`${label}减一`} disabled={value === undefined} onClick={() => onChange(value ? value - 1 : undefined)}>
        −
      </button>
      <output aria-live="polite">{value ?? '—'}</output>
      <button type="button" aria-label={`${label}加一`} disabled={value !== undefined && value >= max} onClick={() => onChange((value ?? -1) + 1)}>
        +
      </button>
    </div>
  );
}
