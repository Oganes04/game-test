import { useState } from 'react'
import { motion } from 'framer-motion'
import { levels, intro } from './data/levels'
import { achievements, finales, tools } from './data/extras'
import { useGameStore } from './store/gameStore'
import { initialShift } from './store/shift'
import GameScreen from './screens/GameScreen'
import Portrait from './components/Portrait'
import styles from './App.module.css'

type Page =
  | 'menu'
  | 'intro'
  | 'brief'
  | 'game'
  | 'complete'
  | 'shop'
  | 'records'
  | 'finale'
  | 'reset'
export default function App() {
  const save = useGameStore()
  const [page, setPage] = useState<Page>('menu')
  const [back, setBack] = useState<Page>('menu')
  const [level, setLevel] = useState(save.level)
  const [step, setStep] = useState(0)
  const [report, setReport] = useState({ stars: 0, score: 0 })
  const [ending, setEnding] = useState('nothing')
  const levelInfo = levels[level - 1]
  function enter(next: number) {
    setLevel(next)
    setPage('brief')
  }
  function side(next: Page) {
    setBack(page)
    setPage(next)
  }
  function play() {
    save.update((s) => {
      if (s.checkpoint?.level === level) return {}
      const shift = initialShift()
      const double = s.purchasedTools.includes('double')
      if (double) shift.effects.double = 1000000
      return {
        stats: { ...s.stats, totalGames: s.stats.totalGames + 1 },
        checkpoint: { level, serial: 0, shift },
        purchasedTools: double
          ? s.purchasedTools.filter((tool) => tool !== 'double')
          : s.purchasedTools,
        unlockedTools:
          level >= 2
            ? [...new Set([...s.unlockedTools, 'lasso'])]
            : s.unlockedTools,
      }
    })
    setPage('game')
  }
  function complete(stars: number, score: number) {
    setReport({ stars, score })
    if (level === 10) {
      setEnding(useGameStore.getState().story.finale || 'nothing')
      setPage('finale')
    } else setPage('complete')
  }
  const [endingName, endingTitle, epilogue] = finales[ending]
  return (
    <div className={styles.shell}>
      <header className="top">
        <button
          className="brand"
          onClick={() => {
            if (page !== 'game') setPage('menu')
          }}
          disabled={page === 'game'}
        >
          <span className="logo">
            <i />
            <i />
            <i />
          </span>
          <span>
            БЮРО
            <br />
            <b>НЕЗАВЕРШЁННЫХ ВЕЩЕЙ</b>
          </span>
        </button>
        <span className="status">
          <i /> СИСТЕМА АКТИВНА
        </span>
      </header>
      <main>
        {page === 'menu' && (
          <motion.div
            className="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="hero">
              <div className="hero-art">
                <div className="grid-floor" />
                <div className="ring" />
                <div className="rails" />
                <Portrait kind="robot" />
                <span className="asset-tag">
                  ОБЪЕКТ 02 <b>●</b>
                </span>
              </div>
              <div className="hero-copy">
                <span className="eyebrow">// СОРТИРОВЩИК 7-ГО РАЗРЯДА</span>
                <h1>
                  КОНВЕЙЕР<span>.</span>
                </h1>
                <p>
                  Бюро принимает всё, что не вписалось в реальность. Сегодня
                  твоя смена.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    if (save.stats.totalGames) {
                      enter(save.checkpoint?.level ?? save.level)
                    } else {
                      setStep(0)
                      setPage('intro')
                    }
                  }}
                >
                  {save.stats.totalGames ? 'Продолжить смену' : 'Начать смену'}{' '}
                  <span>→</span>
                </button>
              </div>
            </div>
            <div className="nav-cards">
              <button onClick={() => side('shop')}>
                <span>◈</span>
                <div>
                  Магазин<small>{save.coins} монет</small>
                </div>
                <b>→</b>
              </button>
              <button onClick={() => side('records')}>
                <span>✶</span>
                <div>
                  Архив<small>{save.achievements.length} / 20 достижений</small>
                </div>
                <b>→</b>
              </button>
            </div>
            <div className="timeline">
              <div className="timeline-title">
                <span>ЖУРНАЛ СМЕН</span>
                <button className="text-button" onClick={() => side('reset')}>
                  Сбросить прогресс
                </button>
              </div>
              <div className="stages">
                {levels.map(([name], i) => (
                  <button
                    key={name}
                    title={name}
                    disabled={i + 1 > save.level}
                    onClick={() =>
                      i === 0 && !save.stats.totalGames
                        ? (setStep(0), setPage('intro'))
                        : enter(i + 1)
                    }
                    className={
                      save.levelProgress[i + 1]
                        ? 'cleared'
                        : i + 1 === save.level
                          ? 'current'
                          : ''
                    }
                  >
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <small>
                      {save.levelProgress[i + 1]
                        ? '★'.repeat(save.levelProgress[i + 1].stars)
                        : '·'}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {page === 'intro' && (
          <div className="sheet">
            <span className="eyebrow">ИНСТРУКТАЖ · {step + 1} / 4</span>
            <h1>{intro[step][0]}</h1>
            <p>{intro[step][1]}</p>
            <button
              className="primary"
              onClick={() => (step < 3 ? setStep(step + 1) : enter(1))}
            >
              {step < 3 ? 'Дальше' : 'К первой смене'} <span>→</span>
            </button>
            <button className="text-button" onClick={() => setPage('menu')}>
              В меню
            </button>
          </div>
        )}
        {page === 'brief' && (
          <div className="sheet">
            <span className="eyebrow">
              СМЕНА {String(level).padStart(2, '0')} / 10 · {levelInfo[4]}
            </span>
            <h1>{levelInfo[0]}</h1>
            <p>{levelInfo[5]}</p>
            <p className="brief-stats">
              {levelInfo[2]} {levelInfo[2] === 1 ? 'линия' : 'линии'} · Цель{' '}
              {levelInfo[3]} · Скорость ×{levelInfo[1]}
            </p>
            <button className="primary" onClick={play}>
              К конвейеру <span>→</span>
            </button>
            <button className="text-button" onClick={() => setPage('menu')}>
              В меню
            </button>
          </div>
        )}
        {page === 'game' && (
          <GameScreen
            key={level}
            level={level}
            onExit={() => setPage('menu')}
            onComplete={complete}
          />
        )}
        {page === 'complete' && (
          <div className="sheet">
            <span className="eyebrow">СМЕНА ЗАКРЫТА</span>
            <h1>{levelInfo[0]}</h1>
            <div className="stars">
              {'★'.repeat(report.stars)}
              <span>{'☆'.repeat(3 - report.stars)}</span>
            </div>
            <p>
              {report.score} очков · +{20 + 10 * report.stars} монет за смену
            </p>
            <button className="primary" onClick={() => enter(level + 1)}>
              Следующая смена <span>→</span>
            </button>
            <div className="actions">
              <button onClick={() => side('shop')}>Магазин</button>
              <button onClick={() => setPage('menu')}>В меню</button>
            </div>
          </div>
        )}
        {page === 'shop' && (
          <div className="sheet">
            <button className="text-button back" onClick={() => setPage(back)}>
              ← Назад
            </button>
            <span className="eyebrow">СНАБЖЕНИЕ · ◈ {save.coins}</span>
            <h1>Магазин</h1>
            <div className="list">
              {tools
                .filter((t) => t[3] > 0)
                .map(([id, icon, name, price, , description]) => {
                  const owned = save.purchasedTools.includes(id)
                  return (
                    <div className="list-row" key={id}>
                      <span className="list-icon">{icon}</span>
                      <div>
                        <b>{name}</b>
                        <small>{description}</small>
                      </div>
                      <button
                        disabled={owned || save.coins < price}
                        onClick={() =>
                          save.update((s) =>
                            s.coins >= price && !s.purchasedTools.includes(id)
                              ? {
                                  coins: s.coins - price,
                                  purchasedTools: [...s.purchasedTools, id],
                                }
                              : {},
                          )
                        }
                      >
                        {owned ? 'Куплено' : `◈ ${price}`}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        {page === 'records' && (
          <div className="sheet">
            <button className="text-button back" onClick={() => setPage(back)}>
              ← Назад
            </button>
            <span className="eyebrow">ЛИЧНОЕ ДЕЛО</span>
            <h1>Архив</h1>
            <h2>Достижения · {save.achievements.length} / 20</h2>
            <div className="badges">
              {achievements.map(([id, name]) => (
                <div
                  key={id}
                  className={save.achievements.includes(id) ? 'earned' : ''}
                >
                  <span>{save.achievements.includes(id) ? '✶' : '◇'}</span>
                  {name}
                </div>
              ))}
            </div>
            <h2>Концовки · {save.endings.length} / 6</h2>
            <div className="actions">
              {Object.entries(finales).map(([id, [name]]) => (
                <button
                  key={id}
                  disabled={!save.endings.includes(id)}
                  onClick={() => {
                    setEnding(id)
                    setPage('finale')
                  }}
                >
                  {save.endings.includes(id) ? name : 'Закрыто'}
                </button>
              ))}
            </div>
          </div>
        )}
        {page === 'finale' && (
          <div className="sheet finale">
            <Portrait
              kind={
                ending === 'secret'
                  ? 'whisper'
                  : ending === 'savior'
                    ? 'misha'
                    : 'curator'
              }
            />
            <span className="eyebrow">КОНЦОВКА · {endingName}</span>
            <h1>{endingTitle}</h1>
            <p>{epilogue}</p>
            <button className="primary" onClick={() => setPage('menu')}>
              В главное меню <span>→</span>
            </button>
          </div>
        )}
        {page === 'reset' && (
          <div className="sheet">
            <h1>Сбросить прогресс?</h1>
            <p>
              Монеты, инструменты и прохождение начнутся заново. Достижения и
              открытые концовки сохранятся.
            </p>
            <div className="actions">
              <button onClick={() => setPage(back)}>Отмена</button>
              <button
                onClick={() => {
                  save.reset()
                  setPage('menu')
                }}
              >
                Сбросить
              </button>
            </div>
          </div>
        )}
      </main>
      <footer>
        <span>БЮРО НЕЗАВЕРШЁННЫХ ВЕЩЕЙ</span>
        <span>ОТДЕЛ СОРТИРОВКИ / 07</span>
      </footer>
    </div>
  )
}
