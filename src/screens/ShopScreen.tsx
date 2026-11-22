import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, checkAchievements } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import { BASE_TOOLS, SHOP_TOOLS, TOOLS } from '../data/tools';
import { Icon } from '../components/svg/Icons';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './ShopScreen.module.css';

export function ShopScreen() {
  const go = useUiStore((st) => st.go);
  const backTo = useUiStore((st) => st.backTo);
  const coins = useGameStore((st) => st.coins);
  const purchased = useGameStore((st) => st.purchasedTools);
  const unlocked = useGameStore((st) => st.unlockedTools);
  const buy = useGameStore((st) => st.buyTool);
  const owned = new Set(unlocked);

  const onBuy = (id: (typeof SHOP_TOOLS)[number]) => {
    if (buy(id)) {
      navigator.vibrate?.(20);
      useUiStore.getState().pushToast({ kind: 'info', title: `Куплено: ${TOOLS[id].name}`, icon: TOOLS[id].icon });
      checkAchievements();
    }
  };

  return (
    <div className={ui.screen}>
      <div className={sc.topbar}>
        <button className={sc.iconBtn} onClick={() => go(backTo)} aria-label="Назад">
          <Icon name="back" size={20} />
        </button>
        <h1>Снабжение Бюро</h1>
        <span className={sc.coins}>
          <Icon name="coin" size={16} /> {coins}
        </span>
      </div>

      <div className={`${ui.scroll} ${sc.stack}`}>
        <div className={sc.kicker}>Покупные инструменты</div>
        {SHOP_TOOLS.map((id, i) => {
          const t = TOOLS[id];
          const have = purchased[id] ?? 0;
          const permanentOwned = !t.consumable && have > 0;
          const canBuy = !permanentOwned && coins >= (t.price ?? 0);
          return (
            <motion.div
              key={id}
              className={`${sc.card} ${s.item}`}
              style={{ '--c': t.color } as CSSProperties}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className={s.icon}>
                <Icon name={t.icon} size={26} />
              </span>
              <div className={s.info}>
                <b>{t.name}</b>
                <p>{t.desc}</p>
                <small>
                  {t.consumable ? `Одноразовый · в запасе: ${have}` : permanentOwned ? 'Куплено навсегда' : `Многоразовый · КД ${t.cd}с`}
                </small>
              </div>
              <button className={`${ui.btn} ${s.buy} ${canBuy ? ui.gold : ''}`} disabled={!canBuy} onClick={() => onBuy(id)}>
                {permanentOwned ? (
                  <Icon name="check" size={18} />
                ) : (
                  <>
                    <Icon name="coin" size={16} />
                    {t.price}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}

        <div className={sc.kicker} style={{ marginTop: 12 }}>
          Сюжетные инструменты
        </div>
        {BASE_TOOLS.map((id) => {
          const t = TOOLS[id];
          const has = owned.has(id);
          return (
            <div key={id} className={`${sc.card} ${s.item} ${has ? '' : s.lockedItem}`} style={{ '--c': t.color } as CSSProperties}>
              <span className={s.icon}>
                <Icon name={has ? t.icon : 'lock'} size={24} />
              </span>
              <div className={s.info}>
                <b>{t.name}</b>
                <p>{t.desc}</p>
                <small>{has ? `Открыт · КД ${t.cd}с` : `Как открыть: ${t.unlockHint}`}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
