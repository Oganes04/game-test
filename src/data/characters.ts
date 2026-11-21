import type { Story } from '../store/gameStore'
import { endingFor, secretPath } from '../utils/secretPath'

export type Choice = [label: string, value: string]
type Scene = {
  id: string
  name: string
  text: string
  choices: Choice[]
  art: string
}
export function scenes(level: number, s: Story): Scene[] {
  switch (level) {
    case 1:
      return [
        {
          id: 'sad_villain',
          name: 'Грустный злодей',
          art: 'villain',
          text: 'В моей книге я должен был сжечь город. На последней странице я подобрал котёнка. Пожалуйста, не отправляй нас в «Опасное».',
          choices: [
            ['Отправить в «Опасное»', 'rules'],
            ['Помочь обоим', 'saved'],
            ['Забрать котёнка', 'used'],
          ],
        },
      ]
    case 2:
      return [
        {
          id: 'robot_kitten',
          name: 'Робот-котёнок',
          art: 'robot',
          text:
            (s.sad_villain === 'used'
              ? 'Тот котёнок у твоего стола тоже ждёт, чтобы его забрали домой? '
              : '') +
            'Мальчик собрал меня из того, что Бюро выбросило. Потом он исчез. Я техника, животное или игрушка?',
          choices: [
            ['Отправить в «Технику»', 'rules'],
            ['Оставить котёнка в покое', 'saved'],
            ['Спасти котёнка и взять чип', 'memory'],
          ],
        },
      ]
    case 3:
      return [
        {
          id: 'whisper',
          name: 'Шёпот',
          art: 'whisper',
          text: 'Уничтоженные не исчезают. Они падают в Пустоту. Тридцать лет назад я стоял на твоём месте. Дома меня ждал сын. Я собирал для него котёнка. Не успел.',
          choices: [
            ['Выслушать', 'listened'],
            ['Донести', 'reported'],
            ['Промолчать', 'ignored'],
          ],
        },
      ]
    case 5:
      return [
        {
          id: 'whisperSaved',
          name: 'Шёпот / Артём',
          art: 'whisper',
          text:
            (s.whisper === 'reported'
              ? 'Твой донос дошёл до Куратора. И всё же послушай. '
              : s.whisper === 'listened'
                ? 'Я обещал вернуться. '
                : '') +
            'Меня зовут Артём. Мой сын — Миша. Я начал собирать того котёнка для него, а он потом сам закончил. Куратор сбросил меня вниз, когда я спросил: «Зачем ты это делаешь?» Он ответил: «Потому что люблю».',
          choices: [
            ['Помочь Артёму', 'saved'],
            ['Донести Куратору', 'reported'],
            ['Использовать его силу', 'used'],
          ],
        },
      ]
    case 6:
      return [
        {
          id: 'curatorIntro',
          name: 'Куратор',
          art: 'curator',
          text:
            (s.whisperSaved === 'saved'
              ? 'Я вижу, кого ты укрыл. '
              : s.whisperSaved === 'reported'
                ? 'В твоём рапорте было имя Артёма. '
                : s.whisperSaved === 'used'
                  ? 'Ты нашёл применение его голосу. Я бы сделал то же. '
                  : '') +
            'Ты задавал вопросы. Теперь ты — часть Пустоты. Или её конец. Посмотри, что я строю из того, что вы считали мусором.',
          choices: [['Вернуться к ленте', 'heard']],
        },
      ]
    case 7:
      return [
        {
          id: 'misha',
          name: 'Миша',
          art: 'misha',
          text: 'Папа сказал, что доделает подарок к утру. Я жду. Ты его видел?',
          choices: [
            ...(s.robot_kitten === 'saved' || s.robot_kitten === 'memory'
              ? [['Позвать котёнка', 'gift'] as Choice]
              : []),
            ...(s.hasChip === 'yes'
              ? [['Отдать чип памяти', 'chip'] as Choice]
              : []),
            ['Продолжить смену', 'rules'],
          ],
        },
        {
          id: 'ex',
          name: 'Она',
          art: 'her',
          text: 'Ты оставил дверь открытой и решил, что это прощание. Бюро запомнило тот вечер. Ты хочешь закончить разговор?',
          choices: [
            ['Поговорить', 'talked'],
            ['Отправить в прошлое', 'sorted'],
            ['Оставить рядом', 'kept'],
          ],
        },
      ]
    case 8:
      return [
        {
          id: 'shadow',
          name: 'Тень Куратора',
          art: 'shadow',
          text: 'Триста лет назад я спросил «зачем». Мне показалось, что без работы от меня ничего не останется. Так я стал Бюро. Ты можешь отпустить ту часть меня, которая всё ещё сомневается.',
          choices: [
            ['Освободить', 'freed'],
            ['Слиться', 'merged'],
            ['Уничтожить', 'destroyed'],
            ...(s.ex === 'talked' ? [['Пройти мимо', 'passed'] as Choice] : []),
          ],
        },
      ]
    case 9:
      return [
        {
          id: 'originalRobot',
          name: 'Оригинал',
          art: 'robot',
          text:
            (s.misha === 'chip'
              ? '«Он вспомнил мой голос», — говорит Артём. «Я думал, память о нас исчезла». '
              : s.misha === 'gift'
                ? 'Сверху слышится звон лап по металлу. Миша зовёт Артёма посмотреть. '
                : '') +
            (s.ex === 'kept'
              ? 'Она ждёт у лестницы. '
              : s.ex === 'sorted'
                ? 'У лестницы осталась открытая дверь в прошлое. '
                : '') +
            'На полке лежит первый прототип котёнка. Под его крышкой сохранилась запись Артёма для Миши. Куратор проложил от полки кабель к оружию Бюро.',
          choices: [
            ['Забрать Оригинала', 'taken'],
            ['Оставить', 'left'],
            ['Использовать как оружие', 'weapon'],
          ],
        },
      ]
    case 10:
      return [
        {
          id: 'curator',
          name: 'Куратор',
          art: 'curator',
          text:
            (s.shadow === 'merged'
              ? 'Ты узнаёшь его жест ещё до того, как он поднимает руку. '
              : s.shadow === 'destroyed'
                ? 'На стене за ним больше нет тени. '
                : s.shadow === 'freed'
                  ? 'Молодой Сортировщик стоит у открытой двери. '
                  : s.shadow === 'passed'
                    ? 'Тень остаётся у ленты, наблюдая за вами. '
                    : '') +
            (s.originalRobot === 'weapon'
              ? 'Кабель к Пустоте натянут. '
              : s.originalRobot === 'taken'
                ? 'Прототип тихо гудит у тебя в руках. '
                : '') +
            'Он снимает маску. Под ней — лицо того, кто первым встал у ленты. «Кто ты?»',
          choices: [
            ['Я — Бюро', 'power'],
            ['Я — выход', 'free'],
            ['Я — никто', 'nothing'],
            ...(secretPath(s) ? [['Я — Артём', 'secret'] as Choice] : []),
          ],
        },
      ]
    default:
      return []
  }
}
export function applyChoice(story: Story, id: string, value: string): Story {
  const next = { ...story, [id]: value }
  if (id === 'robot_kitten') next.hasChip = value === 'memory' ? 'yes' : 'no'
  if (id === 'whisper') next.whisperListened = String(value === 'listened')
  if (id === 'misha' && value === 'chip') next.hasChip = 'no'
  if (id === 'shadow') next.curatorWeak = String(value === 'freed')
  if (id === 'curator') next.finale = endingFor(next)
  return next
}
