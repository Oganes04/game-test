import type { CharacterId, StoryFlags, ToolId } from './types';
import { isSecretPathComplete } from '../utils/secretPath';

export interface DilemmaOption {
  id: string;
  label: string;
  hint?: string;
  /** Если задано — опция видна, но недоступна (причина). */
  locked?: string;
  /** Скрытая опция (секрет) — подсвечивается особым цветом. */
  secret?: boolean;
}

export interface Dilemma {
  id: string;
  character: CharacterId;
  /** Второй участник (иконка рядом). */
  with?: CharacterId;
  title: string;
  lines: string[];
  options: DilemmaOption[];
}

export interface DilemmaOutcome {
  patch: Partial<StoryFlags>;
  response: string;
  log: string;
  unlock?: ToolId[];
  trust?: { boss?: number; whisper?: number };
}

const kittenSaved = (s: StoryFlags) =>
  s.sad_villain === 'saved' || s.sad_villain === 'used' || s.robot_kitten === 'saved';

/** Короткая реплика-эхо: флаги прошлых уровней отзываются в текстах. */
function echoKitten(s: StoryFlags): string | null {
  switch (s.robot_kitten) {
    case 'rules': return '«Ты отправил моего котёнка в Технику. Ты не знал. Никто не знает»';
    case 'saved': return '«Ты оставил котёнка у пульта. Он до сих пор ждёт мальчика»';
    case 'memory': return '«У тебя его чип. Береги — там больше, чем память»';
    default: return null;
  }
}

export function getDilemma(id: string, s: StoryFlags): Dilemma | null {
  switch (id) {
    case 'villain':
      return {
        id, character: 'villain', with: 'boss', title: 'Грустный злодей',
        lines: [
          'На ленте — фигура в плаще. В руках котёнок, тёплый, как лампочка.',
          '«Пожалуйста. Не в Опасное. Злодей — это я. Он просто котёнок».',
          'Начальник в наушнике: «Злодей — Опасное. Без вариантов».',
        ],
        options: [
          { id: 'rules', label: 'По правилам — в Опасное', hint: 'Начальник доволен' },
          { id: 'saved', label: 'Помочь — пропустить обоих', hint: 'Нарушение' },
          { id: 'used', label: 'Забрать котёнка себе', hint: 'Злодей уйдёт сам' },
        ],
      };
    case 'robotKitten':
      return {
        id, character: 'robotKitten', title: 'Робот-котёнок',
        lines: [
          'Металлический котёнок. Глаза-лампочки. На брюшке выцарапано «М.»',
          '«Меня собрал мальчик. Из деталей Бюро. Потом он исчез. Я не знаю, кто я. Я — техника?»',
        ],
        options: [
          { id: 'rules', label: 'В «Технику» — по правилам' },
          { id: 'saved', label: 'Оставить у пульта' },
          { id: 'memory', label: 'Забрать чип памяти', hint: 'Котёнок забудет мальчика' },
        ],
      };
    case 'whisper3': {
      const echo = echoKitten(s);
      return {
        id, character: 'whisper', with: 'curator', title: 'Шёпот',
        lines: [
          'Куратор прошёл вдоль ленты и ушёл. В углу цеха вспыхивает фиолетовый глаз.',
          '«Уничтоженные не исчезают. Они падают в Пустоту. Я был Сортировщиком тридцать лет назад. У меня был сын. Я собирал для него робота… Не успел».',
          ...(echo ? [echo] : []),
        ],
        options: [
          { id: 'listened', label: 'Слушать дальше' },
          { id: 'reported', label: 'Донести Куратору', hint: '+доверие Начальника' },
          { id: 'ignored', label: 'Промолчать и работать' },
        ],
      };
    }
    case 'whisper5': {
      const pre =
        s.whisper === 'listened' ? '«Ты слушал меня тогда. Послушай ещё раз».'
        : s.whisper === 'reported' ? '«Ты донёс на меня. Я не держу зла. Решай сам».'
        : '«Ты промолчал тогда. Сейчас молчать не выйдет».';
      return {
        id, character: 'whisper', title: 'Артём',
        lines: [
          'Шёпот лежит на ленте. Его тянет к контейнерам, как обычную вещь.',
          pre,
          '«Меня зовут Артём. Робот, котёнок — я собирал его для сына, Миши. Куратор спросил: «Зачем?» Я ответил: «Потому что люблю». За это — Пустота».',
        ],
        options: [
          { id: 'helped', label: 'Помочь — снять с ленты', hint: 'Откроет «Голос Пустоты»' },
          { id: 'reported', label: 'Донести', hint: '+доверие Начальника' },
          { id: 'used', label: 'Использовать его', hint: 'Пусть работает на тебя' },
        ],
      };
    }
    case 'curator6':
      return {
        id, character: 'curator', title: 'Куратор',
        lines: [
          'Свет гаснет. Лента останавливается. Перед тобой — Куратор.',
          ...(s.whisperSaved ? ['«Ты снял с ленты того, кто спросил «зачем». Я помню, чем это кончается».'] : []),
          '«Ты задавал вопросы. Теперь ты — часть Пустоты. Или её конец».',
        ],
        options: [
          { id: 'obeyed', label: '«Я просто сортирую»' },
          { id: 'defied', label: 'Молча выдержать взгляд' },
          { id: 'asked', label: 'Спросить: «Зачем?»', hint: 'Опасный вопрос' },
        ],
      };
    case 'misha':
      return {
        id, character: 'misha', title: 'Миша',
        lines: [
          'На ленте сидит мальчик. Прозрачный, как запотевшее стекло. На бирке: «Миша, 9 лет».',
          '«Папа обещал робота-котёнка. Я ждал на ленте. Долго. Ты не видел папу?»',
        ],
        options: [
          { id: 'chip', label: 'Отдать чип памяти', hint: 'Оживить Мишу', locked: s.hasChip ? undefined : 'Нужен чип (ур. 2)' },
          { id: 'gift', label: 'Подарить котёнка', locked: kittenSaved(s) ? undefined : 'Нужен спасённый котёнок' },
          { id: 'rules', label: 'По правилам — в Обычное' },
        ],
      };
    case 'ex':
      return {
        id, character: 'ex', title: 'Она',
        lines: [
          'Силуэт из тумана. Без лица — но ты узнаёшь её по тому, как она стоит.',
          'Ты попал в Бюро из-за неё. Или из-за себя. Ты так и не решил.',
        ],
        options: [
          { id: 'talked', label: 'Поговорить' },
          { id: 'sorted', label: 'Отправить в прошлое' },
          { id: 'kept', label: 'Оставить на ленте' },
        ],
      };
    case 'shadow':
      return {
        id, character: 'shadow', with: 'curator', title: 'Тень Куратора',
        lines: [
          'Среди двойников — одна настоящая. Молодой Сортировщик в старой форме. Вместо лица — фиолетовый свет.',
          '«Триста лет назад я спросил «зачем» — и испугался ответа. Так появился Куратор. Я — то, что он отрезал от себя».',
          ...(s.curator === 'asked' ? ['«Ты задал ему мой вопрос. Он вспомнил меня».'] : []),
        ],
        options: [
          { id: 'freed', label: 'Освободить', hint: 'Откроет «Сомнение»' },
          { id: 'merged', label: 'Слиться с Тенью' },
          { id: 'destroyed', label: 'Уничтожить' },
          ...(s.ex === 'talked'
            ? [{ id: 'passed', label: 'Пройти мимо', hint: 'Не решать за других', secret: true }]
            : []),
        ],
      };
    case 'original':
      return {
        id, character: 'original', title: 'Оригинал',
        lines: [
          'На ленте — ржавый робот. Один глаз горит, второй потух. Прототип. Оригинал.',
          'Он не говорит. Смотрит единственным глазом — так же, как котёнок наверху.',
        ],
        options: [
          { id: 'taken', label: 'Забрать с собой' },
          { id: 'left', label: 'Оставить в Пустоте' },
          { id: 'weapon', label: 'Использовать как оружие' },
        ],
      };
    case 'final':
      return {
        id, character: 'curator', title: 'Кто ты?',
        lines: [
          'Лента замирает. Сожаления, любовь, пустота — всё разложено по местам.',
          'Куратор наклоняется к тебе. Прорези маски горят ровно.',
          '«Кто ты?»',
        ],
        options: [
          { id: 'bureau', label: 'Я — Бюро' },
          { id: 'exit', label: 'Я — выход' },
          { id: 'nobody', label: 'Я — никто' },
          ...(isSecretPathComplete(s) ? [{ id: 'artem', label: 'Я — Артём', secret: true }] : []),
        ],
      };
    default:
      return null;
  }
}

export function resolveDilemma(id: string, opt: string): DilemmaOutcome {
  switch (id) {
    case 'villain':
      if (opt === 'rules')
        return { patch: { sad_villain: 'rules' }, trust: { boss: 5 }, log: 'Злодей отправлен в Опасное',
          response: 'Плащ исчезает в контейнере. Котёнок пискнул — и тишина. Начальник: «Отлично. Ты быстро учишься».' };
      if (opt === 'saved')
        return { patch: { sad_villain: 'saved' }, unlock: ['purr'], trust: { whisper: 5 }, log: 'Злодей и котёнок спасены',
          response: 'Ты отводишь взгляд. Злодей кивает и уходит в темноту цеха, прижимая котёнка. В наушнике — треск. Котёнок успел мурлыкнуть тебе.' };
      return { patch: { sad_villain: 'used' }, unlock: ['purr'], log: 'Котёнок теперь твой',
        response: 'Злодей отпускает котёнка не сразу. «Береги его. Он мурлычет, когда страшно». И сам шагает в Опасное.' };
    case 'robotKitten':
      if (opt === 'rules')
        return { patch: { robot_kitten: 'rules' }, trust: { boss: 5 }, log: 'Робот-котёнок ушёл в Технику',
          response: 'Котёнок послушно прыгает в контейнер. Глаза гаснут не сразу.' };
      if (opt === 'saved')
        return { patch: { robot_kitten: 'saved' }, unlock: ['purr'], log: 'Робот-котёнок остался у пульта',
          response: 'Ты ставишь его у пульта. Он сворачивается хвостом-проводом и тихо гудит.' };
      return { patch: { robot_kitten: 'memory', hasChip: true }, log: 'Чип памяти у тебя',
        response: 'Крошечный тёплый чип. Котёнок моргает: «Я… кого-то ждал?» — и уезжает дальше, пустой, но целый.' };
    case 'whisper3':
      if (opt === 'listened')
        return { patch: { whisper: 'listened', whisperListened: true }, trust: { whisper: 10 }, log: 'Ты выслушал Шёпота',
          response: '«Спасибо. Тридцать лет никто не слушал. Запомни: робот-котёнок — это был мой подарок. Мы ещё встретимся».' };
      if (opt === 'reported')
        return { patch: { whisper: 'reported' }, trust: { boss: 10 }, log: 'Ты донёс на Шёпота',
          response: 'Кнопка вызова. Глаз гаснет. Начальник: «Правильно. Таких надо сразу»' };
      return { patch: { whisper: 'ignored' }, log: 'Ты промолчал',
        response: 'Шёпот ждёт ответа. Не дождавшись — растворяется. «Ничего. Я умею ждать».' };
    case 'ghosts4':
      return { patch: {}, log: 'Лента помнит твои решения', response: '' };
    case 'whisperHidden':
      return { patch: {}, log: 'Шёпот благодарит за Мишу', response: '' };
    case 'whisper5':
      if (opt === 'helped')
        return { patch: { whisperSaved: true, whisper5: 'helped' }, unlock: ['voice'], trust: { whisper: 15 }, log: 'Артём спасён',
          response: '«Я буду рядом. Голос Пустоты — теперь и твой голос». Фиолетовый свет садится тебе на плечо.' };
      if (opt === 'reported')
        return { patch: { whisperSaved: false, whisper5: 'reported' }, trust: { boss: 10 }, log: 'Артём снова в Пустоте',
          response: 'Красная лампа. Шёпот исчезает в контейнере — и где-то внизу снова становится одним из многих.' };
      return { patch: { whisperSaved: false, whisper5: 'used' }, log: 'Артём работает на тебя',
        response: '«Хорошо. Я помогу. Но ты не помог мне». Он уходит в вентиляцию, оставляя холод.' };
    case 'curator6':
      if (opt === 'asked')
        return { patch: { curator: 'asked', curatorWeak: true }, trust: { whisper: 10 }, log: 'Ты спросил Куратора «зачем»',
          response: 'Куратор отступает на шаг. Прорези маски тускнеют. «…Не задавай мне этот вопрос». Он уходит быстрее, чем пришёл.' };
      if (opt === 'defied')
        return { patch: { curator: 'defied' }, log: 'Ты выдержал взгляд Куратора',
          response: 'Маска чуть наклоняется. «Смело. Бессмысленно, но смело».' };
      return { patch: { curator: 'obeyed' }, trust: { boss: 10 }, log: 'Ты подчинился Куратору',
        response: '«Хорошо. Начальник будет следить». Свет возвращается. Лента снова едет.' };
    case 'misha':
      if (opt === 'chip')
        return { patch: { misha: 'chip', hasChip: false }, unlock: ['laugh'], log: 'Чип отдан Мише',
          response: 'Ты вкладываешь чип в ладонь Миши. Он вспыхивает тёплым светом: «Это папин голос… Он говорит: «Потому что люблю»». Миша становится плотнее. Живее.' };
      if (opt === 'gift')
        return { patch: { misha: 'gift' }, unlock: ['laugh'], log: 'Миша получил котёнка',
          response: 'Котёнок трётся о Мишу. Мальчик смеётся — впервые за тридцать лет. Смех звенит по цеху.' };
      return { patch: { misha: 'rules' }, trust: { boss: 5 }, log: 'Миша отправлен по правилам',
        response: 'Миша не плачет. Машет рукой — и исчезает в контейнере. Где-то внизу что-то обрывается.' };
    case 'ex':
      if (opt === 'talked')
        return { patch: { ex: 'talked' }, log: 'Ты поговорил с Ней',
          response: 'Ты говоришь то, что не сказал тогда. Туман редеет. Она не отвечает — но кивает. Этого достаточно.' };
      if (opt === 'sorted')
        return { patch: { ex: 'sorted' }, log: 'Она отправлена в прошлое',
          response: 'Туман уходит в контейнер с пометкой «Прошлое». Легче не стало. Но тише — да.' };
      return { patch: { ex: 'kept' }, log: 'Она осталась на ленте',
        response: 'Она остаётся. Едет рядом — круг за кругом. Ты ещё не готов.' };
    case 'shadow':
      if (opt === 'freed')
        return { patch: { shadow: 'freed', curatorWeak: true }, unlock: ['doubt'], log: 'Тень освобождена',
          response: '«Сомнение — не слабость. Возьми его». Фиолетовый свет уходит вверх, к окну Куратора.' };
      if (opt === 'merged')
        return { patch: { shadow: 'merged' }, log: 'Ты слился с Тенью',
          response: 'Три века страха входят в тебя. И сила. Очень много силы.' };
      if (opt === 'destroyed')
        return { patch: { shadow: 'destroyed', curatorWeak: false }, trust: { boss: 10 }, log: 'Тень уничтожена',
          response: 'Тень рассыпается. Где-то наверху Куратор выпрямляется — будто сбросил груз.' };
      return { patch: { shadow: 'passed' }, log: 'Ты прошёл мимо Тени',
        response: 'Ты научился не решать за других. Тень смотрит вслед — и впервые за триста лет не боится.' };
    case 'original':
      if (opt === 'taken')
        return { patch: { originalRobot: 'taken' }, log: 'Оригинал с тобой',
          response: 'Ты прижимаешь робота к себе. Ржавчина пахнет домом. Глаз мигает — один раз, будто «спасибо».' };
      if (opt === 'left')
        return { patch: { originalRobot: 'left' }, log: 'Оригинал остался в Пустоте',
          response: 'Ты ставишь его обратно на полку. Пусть спит.' };
      return { patch: { originalRobot: 'weapon' }, log: 'Оригинал стал оружием',
        response: 'Ты вскрываешь корпус. Внутри — заряд, которого хватит, чтобы снести стену Бюро.' };
    default:
      return { patch: {}, log: '', response: '' };
  }
}

/** Сюжетные сцены без выбора (CharacterModal). */
export interface Beat {
  id: string;
  character: CharacterId;
  lines: { who?: CharacterId; text: string }[];
}

export function getBeat(id: string, ctx: { ghosts: number; allies: number }): Beat | null {
  if (id === 'ghosts4') {
    const lines: Beat['lines'] = [];
    if (ctx.ghosts > 0) {
      lines.push({ text: 'Между контейнерами скользят бледные силуэты. Цифры таймера дрожат.' });
      lines.push({ who: 'boss', text: '«Это ошибка системы. Работай»' });
      lines.push({ who: 'whisper', text: '«Это не ошибка. Это те, кого ты отправил»' });
    }
    if (ctx.allies > 0) {
      lines.push({ text: 'Кто-то невидимый подталкивает объекты к нужным контейнерам.' });
      lines.push({ who: 'whisper', text: '«А это — те, кого ты отпустил. Они помнят»' });
    }
    if (lines.length === 0) {
      lines.push({ text: 'Лампы мигают, но цех пуст. Ни призраков, ни помощников.' });
      lines.push({ who: 'whisper', text: '«Ты никого не отправил и никого не спас. Так тоже бывает»' });
    }
    return { id, character: 'whisper', lines };
  }
  if (id === 'whisperHidden') {
    return {
      id, character: 'whisper',
      lines: [
        { who: 'whisper', text: '«Миша… Я слышу его. Ты отдал ему мой голос».' },
        { who: 'whisper', text: '«Внизу, на полке, — мой первый робот. Оригинал. Не оставляй его здесь»' },
      ],
    };
  }
  return null;
}

/** Сколько призраков/союзников принесли прошлые решения. */
export function ghostsAndAllies(s: StoryFlags) {
  let ghosts = 0;
  let allies = 0;
  if (s.sad_villain === 'rules') ghosts++;
  if (s.sad_villain === 'saved') allies++;
  if (s.robot_kitten === 'rules') ghosts++;
  if (s.robot_kitten === 'saved' || s.robot_kitten === 'memory') allies++;
  if (s.whisper === 'reported') ghosts++;
  if (s.whisper === 'listened') allies++;
  return { ghosts, allies };
}
