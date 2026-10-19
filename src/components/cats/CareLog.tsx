import { useState } from 'preact/hooks';
import { careOf, careStatus, newId, removeCare, today, upsertCare, type CareEvent, type CareKind, type Data, type DewormScope } from '../../lib/store';
import { Segmented } from './Segmented';
import { BASE } from './useData';

interface Props {
  catId: string;
  data: Data;
  update: (d: Data) => void;
}

const SCOPE: Record<DewormScope, string> = { internal: '体内', external: '体外', both: '体内外' };

const ymd = (iso: string) => `${Number(iso.slice(0, 4))}年${Number(iso.slice(5, 7))}月${Number(iso.slice(8, 10))}日`;

function dueText(days: number) {
  if (days > 0) return `还有 ${days} 天`;
  if (days === 0) return '就是今天';
  return `已经过了 ${-days} 天`;
}

const kindText = (e: CareEvent) => (e.kind === 'vaccine' ? '疫苗' : `${SCOPE[e.scope ?? 'both']}驱虫`);

/** 「疫苗驱虫」页：到期提醒、记一次、历史记录 */
export function CareLog({ catId, data, update }: Props) {
  const events = careOf(data, catId);
  const status = careStatus(events);
  const [editing, setEditing] = useState<CareEvent | 'new' | null>(null);

  const save = (ev: CareEvent) => {
    update(upsertCare(data, ev));
    setEditing(null);
  };

  const remove = (ev: CareEvent) => {
    if (!confirm(`删除 ${ymd(ev.date)} 这条${kindText(ev)}记录？`)) return;
    update(removeCare(data, ev.id));
    setEditing(null);
  };

  return (
    <div class="care">
      <ul class="care-status">
        {status.map((s) => {
          const level = s.daysLeft === undefined ? '' : s.daysLeft < 0 ? 'over' : s.daysLeft <= 7 ? 'soon' : '';
          return (
            <li class={`care-track card ${level}`}>
              <span class="care-track-label">{s.label}</span>
              {s.last ? (
                <span class="care-track-body">
                  <span>上次 {ymd(s.last.date)}</span>
                  {s.next ? (
                    <b>下次 {ymd(s.next)}，{dueText(s.daysLeft!)}</b>
                  ) : (
                    <span class="muted">没写下次时间</span>
                  )}
                </span>
              ) : (
                <span class="care-track-body muted">还没有记录</span>
              )}
            </li>
          );
        })}
      </ul>

      {editing ? (
        <CareForm
          catId={catId}
          event={editing === 'new' ? undefined : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
          onDelete={editing === 'new' ? undefined : () => remove(editing)}
        />
      ) : (
        <button class="btn primary add-btn" onClick={() => setEditing('new')}>记一次疫苗或驱虫</button>
      )}

      {events.length > 0 && (
        <section>
          <h2 class="section-title">全部记录</h2>
          <ul class="care-list">
            {events.map((e) => (
              <li>
                <button class="care-item" onClick={() => { setEditing(e); scrollTo(0, 0); }}>
                  <span class={`care-kind ${e.kind}`}>{kindText(e)}</span>
                  <span class="care-item-main">
                    <b>{ymd(e.date)}</b>
                    <span>{[e.product, e.place].filter(Boolean).join('，') || '没写名称和地点'}</span>
                    {e.note && <span class="muted">{e.note}</span>}
                  </span>
                  {e.next && <span class="care-next">下次 {ymd(e.next)}</span>}
                </button>
              </li>
            ))}
          </ul>
          <p class="fine">点一条可以修改或删除。</p>
        </section>
      )}

      <p class="fine">
        多久打一次疫苗、多久驱一次虫，要看猫的年龄和生活方式，问兽医。「下次」填兽医或说明书说的日期，这里只负责提醒，不替你算。参见
        <a href={`${BASE}notes/vaccines/`}>疫苗原理、程序与加强免疫</a>和<a href={`${BASE}notes/parasites/`}>体内外驱虫</a>。
      </p>
    </div>
  );
}

interface FormProps {
  catId: string;
  event?: CareEvent;
  onSave: (e: CareEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function CareForm({ catId, event, onSave, onCancel, onDelete }: FormProps) {
  const [kind, setKind] = useState<CareKind | undefined>(event?.kind);
  const [scope, setScope] = useState<DewormScope | undefined>(event?.scope);
  const [date, setDate] = useState(event?.date ?? today());
  const [product, setProduct] = useState(event?.product ?? '');
  const [place, setPlace] = useState(event?.place ?? '');
  const [next, setNext] = useState(event?.next ?? '');
  const [note, setNote] = useState(event?.note ?? '');

  const ready = kind && date && (kind === 'vaccine' || scope) && (!next || next > date);

  const submit = (e: Event) => {
    e.preventDefault();
    if (!ready) return;
    const out: CareEvent = { id: event?.id ?? newId(), catId, kind: kind!, date, product: product.trim(), place: place.trim() };
    if (kind === 'deworm') out.scope = scope;
    if (next) out.next = next;
    if (note.trim()) out.note = note.trim();
    onSave(out);
  };

  return (
    <form class="cat-form card" onSubmit={submit}>
      <div class="field">
        <span class="field-label">做了什么</span>
        <Segmented
          value={kind}
          onChange={(v) => setKind(v as CareKind | undefined)}
          options={[
            ['vaccine', '打疫苗'],
            ['deworm', '驱虫'],
          ]}
        />
      </div>
      {kind === 'deworm' && (
        <div class="field">
          <span class="field-label">体内还是体外</span>
          <Segmented
            value={scope}
            onChange={(v) => setScope(v as DewormScope | undefined)}
            options={[
              ['internal', '体内'],
              ['external', '体外'],
              ['both', '体内外一起'],
            ]}
          />
        </div>
      )}
      <div class="field-row">
        <label class="field">
          <span class="field-label">日期</span>
          <input type="date" value={date} max={today()} onInput={(e) => setDate(e.currentTarget.value)} required />
        </label>
        <label class="field">
          <span class="field-label">{kind === 'deworm' ? '药名' : '疫苗名称'}</span>
          <input value={product} onInput={(e) => setProduct(e.currentTarget.value)} placeholder={kind === 'deworm' ? '照包装写' : '照疫苗本上写'} />
        </label>
      </div>
      <div class="field-row">
        <label class="field">
          <span class="field-label">在哪里</span>
          <input value={place} onInput={(e) => setPlace(e.currentTarget.value)} placeholder="医院名字，或在家" />
        </label>
        <label class="field">
          <span class="field-label">下次（选填）</span>
          <input type="date" value={next} min={date} onInput={(e) => setNext(e.currentTarget.value)} />
        </label>
      </div>
      <p class="fine">「下次」填兽医或说明书说的日期，到期前 7 天开始提醒。</p>
      <label class="field">
        <span class="field-label">备注（选填）</span>
        <textarea rows={2} value={note} onInput={(e) => setNote(e.currentTarget.value)} placeholder="比如 第几针、打完有没有不舒服" />
      </label>
      <div class="actions">
        <button class="btn primary" type="submit" disabled={!ready}>保存</button>
        <button class="btn" type="button" onClick={onCancel}>取消</button>
        {onDelete && (
          <button class="btn danger-link" type="button" onClick={onDelete}>删除这条</button>
        )}
      </div>
    </form>
  );
}
