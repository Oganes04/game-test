import { Icon } from './svg/Icons';
import s from './RotateDeviceOverlay.module.css';

export function RotateDeviceOverlay() {
  return (
    <div className={s.overlay} role="alert">
      <div className={s.phone}>
        <Icon name="rotate" size={72} strokeWidth={1.4} />
      </div>
      <p className={s.title}>Поверни телефон обратно</p>
      <p className={s.sub}>Конвейер работает только в портретной ориентации</p>
    </div>
  );
}
