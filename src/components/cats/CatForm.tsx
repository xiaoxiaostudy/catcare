import { useState } from 'preact/hooks';
import { newId, today, type Cat, type Sex } from '../../lib/store';
import { Segmented } from './Segmented';

interface Props {
  cat?: Cat;
  onSave: (cat: Cat) => void;
  onCancel?: () => void;
}

export function CatForm({ cat, onSave, onCancel }: Props) {
  const [name, setName] = useState(cat?.name ?? '');
  const [sex, setSex] = useState<Sex | undefined>(cat?.sex);
  const [neutered, setNeutered] = useState<boolean | undefined>(cat?.neutered);
  const [birth, setBirth] = useState(cat?.birth ?? '');
  const [breed, setBreed] = useState(cat?.breed ?? '');

  const ready = name.trim() && sex && neutered !== undefined;

  const submit = (e: Event) => {
    e.preventDefault();
    if (!ready) return;
    onSave({
      id: cat?.id ?? newId(),
      createdAt: cat?.createdAt ?? today(),
      name: name.trim(),
      sex: sex!,
      neutered: neutered!,
      birth,
      breed: breed.trim(),
    });
  };

  return (
    <form class="cat-form card" onSubmit={submit}>
      <label class="field">
        <span class="field-label">名字</span>
        <input value={name} onInput={(e) => setName(e.currentTarget.value)} placeholder="比如 绵绵" required />
      </label>
      <div class="field">
        <span class="field-label">性别</span>
        <Segmented
          value={sex}
          onChange={(v) => setSex(v as Sex | undefined)}
          options={[
            ['公', '公猫'],
            ['母', '母猫'],
          ]}
        />
      </div>
      <div class="field">
        <span class="field-label">绝育了吗</span>
        <Segmented
          value={neutered === undefined ? undefined : neutered ? 'y' : 'n'}
          onChange={(v) => setNeutered(v === undefined ? undefined : v === 'y')}
          options={[
            ['n', '还没绝育'],
            ['y', '已绝育'],
          ]}
        />
      </div>
      <div class="field-row">
        <label class="field">
          <span class="field-label">生日（大概也行）</span>
          <input type="date" value={birth} max={today()} onInput={(e) => setBirth(e.currentTarget.value)} />
        </label>
        <label class="field">
          <span class="field-label">品种</span>
          <input value={breed} onInput={(e) => setBreed(e.currentTarget.value)} placeholder="比如 狸花猫" />
        </label>
      </div>
      <div class="actions">
        <button class="btn primary" type="submit" disabled={!ready}>
          {cat ? '保存' : '添加'}
        </button>
        {onCancel && (
          <button class="btn" type="button" onClick={onCancel}>
            取消
          </button>
        )}
      </div>
    </form>
  );
}
