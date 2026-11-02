/* ============================================================
   ПОБЕДА / POBEDA — календарь побед · Victory Calendar
   Тёмный минимализм + агрессивная мотивация. RU / EN.
   Данные: localStorage. Уведомления: локальные (без сервера).
   ============================================================ */
'use strict';

/* ---------- константы ---------- */
const LS_KEY = 'pobeda_v1';
const DAY_MS = 86400000;

// Пороги званий и наград (названия — в словарях STR)
const RANK_THRESHOLDS = [0, 3, 7, 14, 30, 60, 100, 200, 365];
const BADGES = [
  { d: 7,   icon: '🥉' },
  { d: 14,  icon: '🥈' },
  { d: 30,  icon: '🥇' },
  { d: 60,  icon: '⚔️' },
  { d: 100, icon: '💯' },
  { d: 200, icon: '🏛️' },
  { d: 365, icon: '👑' },
];
// Секретные награды: в зале наград не светятся вообще
const SECRET_BADGES = [
  { d: 400,  icon: '🐉' },
  { d: 500,  icon: '🖤' },
  { d: 730,  icon: '⚔️' },
  { d: 1000, icon: '💀' },
  { d: 2000, icon: '🗿' },
];

/* ---------- язык ---------- */
let lang = 'ru';
const LOCALE = () => (lang === 'ru' ? 'ru-RU' : 'en-US');

const STR = {
  ru: {
    docTitle: 'ПОБЕДА — календарь побед',
    logo: 'ПОБЕДА',
    rankLbl: 'ЗВАНИЕ', daysLbl: 'дней',
    today: 'СЕГОДНЯ',
    riskTitle: '⚠ Серия на кону',
    riskDefault: 'Сегодня ещё нет ни одной отметки. Серия не растёт сама.',
    breakTitle: (n) => `✖ Серия ${n} дней — ОБНУЛЕНА`,
    freezeWarnTitle: (n) => `❄ Серия ${n} дней — на волоске`,
    freezeWarnBody: (c) => `Вчера пусто. Заморозка (${c} шт.) может всё исправить. Но сначала нажми кнопку в карточке ниже и скажи, кто ты. ↓`,
    motoToday: 'День не закончен, пока не отмечена победа.',
    motoPast: 'Догнать прошлый день — тоже поступок.',
    markHint: 'Клик по категории — победа дня зафиксирована. Отмечать можно и прошлые дни.',
    praise: [
      'Победа зафиксирована. Никто не сделает это за тебя.',
      'Хорошо. Но завтра снова придётся доказывать.',
      'Ещё один день в плюс. Слабость остаётся позади.',
      'Так держать. Серия — это репутация. Не позорь её.',
      'Ты сегодня сильнее вчерашнего себя. Завтра — повтори.',
      'Дисциплина. Не мотивация. Именно это и работает.',
    ],
    threat: [
      'Солнце садится. Серия ещё не спасена. Действуй.',
      'День горит. Отметь победу — или потеряй всё нажитое.',
      'Серия под угрозой. Один клик отделяет тебя от краха.',
      'Лежишь? Серия — нет. Исправь это.',
    ],
    broken: [
      'Серия обнулена. Чувствуешь цену пропуска? Тогда не повторяй.',
      'Серия мертва. Вина — бесполезная эмоция. Начни новую. Сейчас.',
      'Обнулено. Это было предсказуемо. Докажи, что нет.',
    ],
    brag: [
      (n) => `Я ${n} дней в серии. А ты сколько?`,
      (n) => `${n} дней без единого пропуска. Повтори, если сможешь.`,
      (n) => `Пока ты откладывал, я взял ${n} дней подряд. Твой ход.`,
      (n) => `У меня серия ${n}. Оправдания не принимаются.`,
      (n) => `${n} дней держу слово перед собой. Слабо повторить?`,
      (n) => `Это не мотивация. Это ${n} дней дисциплины. Догони.`,
    ],
    ranks: ['Новобранец', 'Разогрев', 'Железная неделя', 'Хищник', 'Машина', 'Неудержимый', 'Легенда', 'Титан', 'Бессмертный'],
    badgeNames: ['Первая кровь', 'Две недели ада', 'Месяц стали', 'Двойной удар', 'Сотня', 'Титан', 'Год без пощады'],
    secretNames: ['Год дракона', 'Полтысячи боли', 'Два года войны', 'Тысяча. Уже никто не поверит', 'Монолит'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    dow: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'],
    unmark: 'Отметка снята. История не терпит фальши.',
    badgeGot: (name, d) => `🏆 Награда получена: «${name}» — ${d} дней серии!`,
    secretGot: (name, d) => `🔒 СЕКРЕТНАЯ НАГРАДА: «${name}» — ${d} дней. Об этом не знал никто. Кроме тебя.`,
    freezeEarned: '❄ +1 заморозка в запас. Неделя закрыта — теперь есть чем страховать позор.',
    freezeApplied: '❄ Заморозка активирована. Позор принят, серия спасена. Не привыкай.',
    freezeNotNeeded: 'Заморозка не понадобилась: серия цела. Позор отменён.',
    freezeNone: 'Заморозок в запасе нет. Заслужи: неделя серии = +1.',
    freezeNoNeedBtn: 'Сейчас серию спасать не нужно. Кнопка ждёт твоего провала.',
    catLimit: '12 категорий — предел. Фокус, а не витрина.',
    catCreated: (name) => `Категория «${name}» создана. Теперь не смей её бросать.`,
    catDelConfirm: (name) => `Удалить «${name}»? Все её отметки в календаре исчезнут.`,
    activeNone: 'Активных целей нет. Ставь новую — движение не останавливается.',
    streakShort: (n) => `серия ${n} 🔥`,
    finHover: 'Цель выполнена — закрыть красиво',
    delHover: 'Удалить категорию',
    finishQ: (emoji, name) => `Закрываем цель: <b>${emoji} ${name}</b>. Почему финал?`,
    finishNotePh: 'Причина: закончил курсы, выпустился, перешёл на новое...',
    finishSubmit: '🏁 Закрыть цель',
    finishCancel: 'Отмена',
    finishHint: 'Финиш — не провал. Цель уйдёт в «Завершённые» со своей историей.',
    noReason: 'Причина не названа. Но финиш — финиш.',
    closed: (name) => `🏁 «${name}» закрыта красиво. Это не сдача — это финиш. Ставь новую цель.`,
    resumed: (name) => `«${name}» вернулась в строй. Продолжаем.`,
    doneCount: (n) => `${n} шт.`,
    doneMeta: (startH, endH, days, best) => `${startH} → 🏁 ${endH} · дней отмечено: <b>${days}</b> · рекорд серии: <b>${best}</b>`,
    resumeBtn: '↩ Вернуть',
    delForeverHover: 'Удалить навсегда',
    doneDelConfirm: (name) => `Удалить «${name}» навсегда? Вместе со всеми её отметками.`,
    cellFree: 'Клик, чтобы отметить',
    cellWon: 'День победы — клик, чтобы изменить',
    cellFrozen: 'День спасён заморозкой',
    legendFrost: '❄ заморозка',
    calToday: 'Сегодня',
    weekBar: (date, c) => `Неделя с ${date}: ${c} из 7 дней`,
    dowBar: (name, c) => `${name}: ${c} побед всего`,
    notifOk: '✅ Охота включена.',
    notifDenied: '⛔ Заблокировано в настройках браузера.',
    notifNeedPerm: 'Требуется разрешение — кликни переключатель.',
    notifUnsupported: 'Этот браузер не поддерживает уведомления.',
    notifDeniedToast: 'Без разрешения уведомления не работают. Слабость.',
    notifOn: 'Напоминания включены. Теперь они будут преследовать тебя.',
    notifyTitle: 'ПОБЕДА не отмечена!',
    notifyBody: (n) => `Серия ${n} дней горит. До полуночи всё решит один клик. ДЕЙСТВУЙ.`,
    exported: 'Данные экспортированы. Храни как зеницу ока.',
    imported: 'Данные импортированы. Серия возвращена в строй.',
    badFile: 'Файл не подходит. Это не бэкап ПОБЕДЫ.',
    resetQ1: 'СЖЕЧЬ ВСЁ? Все победы, серии и награды будут удалены безвозвратно.',
    resetQ2: 'Точно? Последний шанс передумать.',
    resetDone: 'Всё сожжено. Начинаешь с нуля — как в первый день.',
    shareZero: 'Серия нулевая. Делиться нечем — сначала победа сегодня.',
    shareFail: 'Не удалось собрать скриншот. Даже здесь ты нашёл способ сломаться.',
    shareSaved: '📸 Скриншот скачан. На iPhone в меню «Поделиться» выбери «Сохранить изображение» — попадёт в Фото.',
    cardStreak: 'ДНЕЙ СЕРИИ ПОДРЯД',
    cardRecord: 'РЕКОРД',
    cardDays: 'ДНЕЙ ПОБЕД',
    cardGoals: 'ЦЕЛЕЙ ЗАКРЫТО',
    cardFooter: 'СЛАБОСТЬ СЕГОДНЯ — БОЛЬ ЗАВТРА. ТВОЙ ВЫБОР.',
    // статические тексты страницы
    freezeTitle: 'ЗАМОРОЗКА СЕРИИ',
    freezeDesc: 'Чтобы активировать заморозку серии, вам необходимо нажать на эту кнопку —',
    freezeBtn: 'Я — ЛОШАРА',
    freezeHint: 'Заморозка спасает вчерашний пропущенный день вместе со всей серией. +1 заморозка за каждую закрытую неделю (7, 14, 21...). Максимум 3 в запасе. Кнопку нажмёшь — позор останется.',
    statsTitle: 'СТАТИСТИКА',
    shareBtn: '📢 Похвастаться',
    stWins: 'побед за 30 дней',
    stRate: 'из последних 30 дней',
    stMonth: 'в этом месяце',
    stWeak: 'твой слабый день',
    hWeeks: 'ПО НЕДЕЛЯМ (ПОСЛЕДНИЕ 12)',
    hDow: 'ПО ДНЯМ НЕДЕЛИ — ГДЕ ТЫ СДАЁШЬСЯ',
    hCats: 'ПО КАТЕГОРИЯМ',
    thCat: 'категория', thAll: 'всего', thBest: 'рекорд', thStreak: 'серия', thRate: '%30д',
    catsTitle: 'КАТЕГОРИИ',
    namePh: 'Название',
    addBtn: 'Добавить',
    doneTitle: '🏁 ЗАВЕРШЁННЫЕ ЦЕЛИ',
    doneHint: 'Финиш — не провал. Здесь живут цели, которые ты довёл до конца.',
    badgesTitle: 'ЗАЛ НАГРАД',
    badgesHint: 'Награды выдаются за длину серии. Сорвал серию — награды остались, но звание сгорело. После 365 дней есть то, чего ты не видишь.',
    secretsTitle: '🔒 СЕКРЕТЫ',
    secretsHint: 'Этого нет в зале наград. Об этом знают только те, кто дошёл.',
    settingsTitle: 'НАСТРОЙКИ',
    notifLabel: 'Напоминать, если день не отмечен',
    deadlineLbl: 'Время дедлайна:',
    langLbl: '🌍 Язык:',
    exportBtn: 'Экспорт данных',
    importBtn: 'Импорт данных',
    resetBtn: 'Сжечь всё',
    settingsHint: 'Данные живут только в этом браузере. Экспортируй их, чтобы не потерять серию.',
    footer: 'СЛАБОСТЬ СЕГОДНЯ — БОЛЬ ЗАВТРА. ТВОЙ ВЫБОР.',
    badData: 'Повреждённые данные, начинаем с чистого листа.',
  },

  en: {
    docTitle: 'POBEDA — Victory Calendar',
    logo: 'POBEDA',
    rankLbl: 'RANK', daysLbl: 'days',
    today: 'TODAY',
    riskTitle: '⚠ Streak on the line',
    riskDefault: "Nothing logged today. Streaks don't grow on their own.",
    breakTitle: (n) => `✖ ${n}-day streak — WIPED`,
    freezeWarnTitle: (n) => `❄ ${n}-day streak is hanging by a thread`,
    freezeWarnBody: (c) => `Yesterday is empty. A freeze (${c} left) can fix everything. But first hit the button below and say who you are. ↓`,
    motoToday: "The day isn't over until the win is logged.",
    motoPast: 'Catching up on a past day still takes guts.',
    markHint: 'Tap a category — the win is locked in. Past days can be logged too.',
    praise: [
      'Victory logged. Nobody is coming to do this for you.',
      'Good. Tomorrow you prove it all over again.',
      'One more day in the plus. Weakness stays behind.',
      "Keep it up. Your streak is your reputation — don't embarrass it.",
      "Today you beat yesterday's you. Repeat tomorrow.",
      "Discipline, not motivation. That's what actually works.",
    ],
    threat: [
      "Sun's going down. Streak's not saved yet. Move.",
      'The day is burning. Log your win — or lose everything.',
      'The streak is on the edge. One click separates you from the crash.',
      "Lying down? Your streak isn't. Fix that.",
    ],
    broken: [
      "Streak wiped. Feel the cost of a miss? Then don't repeat it.",
      'The streak is dead. Guilt is useless. Start a new one. Now.',
      'Reset to zero. Predictable. Prove otherwise.',
    ],
    brag: [
      (n) => `I'm on day ${n} of my streak. What's your count?`,
      (n) => `${n} days. Zero misses. Match that if you can.`,
      (n) => `While you were putting it off, I stacked ${n} days in a row. Your move.`,
      (n) => `I've got a ${n}-day streak. Excuses not accepted.`,
      (n) => `${n} days of keeping my word. Think you can repeat that?`,
      (n) => `This isn't motivation. It's ${n} days of discipline. Catch up.`,
    ],
    ranks: ['Rookie', 'Warming Up', 'Iron Week', 'Predator', 'Machine', 'Relentless', 'Legend', 'Titan', 'Immortal'],
    badgeNames: ['First Blood', 'Two Weeks of Hell', 'Month of Steel', 'Double Strike', 'The Hundred', 'Titan', 'A Year of No Mercy'],
    secretNames: ['Year of the Dragon', 'Half a Thousand of Pain', 'Two Years of War', 'One Thousand. Nobody Will Believe You', 'Monolith'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dow: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    unmark: 'Mark removed. History doesn’t take fakes.',
    badgeGot: (name, d) => `🏆 Reward unlocked: “${name}” — ${d} days!`,
    secretGot: (name, d) => `🔒 SECRET REWARD: “${name}” — ${d} days. Nobody knew this existed. Except you.`,
    freezeEarned: '❄ +1 freeze stocked. Week closed — insurance against your own excuses.',
    freezeApplied: '❄ Freeze applied. Shame accepted, streak saved. Don’t get used to it.',
    freezeNotNeeded: 'Freeze not needed: streak is intact. Shame cancelled.',
    freezeNone: 'No freezes left. Earn one: a full week = +1.',
    freezeNoNeedBtn: 'Nothing to save right now. The button is waiting for your failure.',
    catLimit: '12 categories max. Focus, not a showcase.',
    catCreated: (name) => `Category “${name}” created. Now don’t you dare abandon it.`,
    catDelConfirm: (name) => `Delete “${name}”? All its marks in the calendar will disappear.`,
    activeNone: 'No active goals. Set a new one — standing still means falling behind.',
    streakShort: (n) => `streak ${n} 🔥`,
    finHover: 'Goal complete — close it with honor',
    delHover: 'Delete category',
    finishQ: (emoji, name) => `Closing goal: <b>${emoji} ${name}</b>. Why is it over?`,
    finishNotePh: 'Reason: finished the course, graduated, moving on...',
    finishSubmit: '🏁 Close goal',
    finishCancel: 'Cancel',
    finishHint: 'A finish is not a failure. The goal moves to “Completed” with its full history.',
    noReason: 'No reason given. Still counts as a finish.',
    closed: (name) => `🏁 “${name}” closed the right way. That’s not quitting — that’s finishing. Set a new goal.`,
    resumed: (name) => `“${name}” is back in the game. Keep going.`,
    doneCount: (n) => `${n} total`,
    doneMeta: (startH, endH, days, best) => `${startH} → 🏁 ${endH} · days logged: <b>${days}</b> · best streak: <b>${best}</b>`,
    resumeBtn: '↩ Resume',
    delForeverHover: 'Delete forever',
    doneDelConfirm: (name) => `Delete “${name}” forever? Along with all of its marks.`,
    cellFree: 'Click to log',
    cellWon: 'Victory day — click to change',
    cellFrozen: 'Day saved by a freeze',
    legendFrost: '❄ freeze',
    calToday: 'Today',
    weekBar: (date, c) => `Week of ${date}: ${c} of 7 days`,
    dowBar: (name, c) => `${name}: ${c} wins total`,
    notifOk: '✅ Hunt mode is on.',
    notifDenied: '⛔ Blocked in browser settings.',
    notifNeedPerm: 'Permission required — flip the switch.',
    notifUnsupported: 'This browser doesn’t support notifications.',
    notifDeniedToast: 'Notifications don’t work without permission. Weak.',
    notifOn: 'Reminders are on. They will now hunt you down.',
    notifyTitle: 'POBEDA: victory not logged!',
    notifyBody: (n) => `Your ${n}-day streak is burning. One click before midnight decides everything. MOVE.`,
    exported: 'Data exported. Guard it with your life.',
    imported: 'Data imported. The streak is back in formation.',
    badFile: 'Wrong file. This is not a POBEDA backup.',
    resetQ1: 'BURN IT ALL? Every win, streak and reward will be erased for good.',
    resetQ2: 'Sure? Last chance to walk away.',
    resetDone: 'Everything burned. You start from zero — like day one.',
    shareZero: 'Zero streak. Nothing to flex — earn today’s win first.',
    shareFail: 'Couldn’t build the shot. Somehow you even broke this.',
    shareSaved: '📸 Screenshot downloaded. On iPhone, tap “Save Image” in the share menu — it lands in Photos.',
    cardStreak: 'DAY STREAK',
    cardRecord: 'RECORD',
    cardDays: 'DAYS WITH WINS',
    cardGoals: 'GOALS CLOSED',
    cardFooter: 'WEAK TODAY — SORE TOMORROW. YOUR CALL.',
    // статические тексты страницы
    freezeTitle: 'STREAK FREEZE',
    freezeDesc: 'To activate a streak freeze, you have to press this button —',
    freezeBtn: 'I CHOKED',
    freezeHint: 'A freeze saves yesterday’s missed day together with the whole streak. +1 freeze per closed week (7, 14, 21...). Max 3 in stock. Press it — and the shame stays.',
    statsTitle: 'STATS',
    shareBtn: '📢 Show off',
    stWins: 'wins in 30 days',
    stRate: 'of the last 30 days',
    stMonth: 'this month',
    stWeak: 'your weakest day',
    hWeeks: 'BY WEEK (LAST 12)',
    hDow: 'BY WEEKDAY — WHERE YOU QUIT',
    hCats: 'BY CATEGORY',
    thCat: 'category', thAll: 'total', thBest: 'best', thStreak: 'streak', thRate: '%30d',
    catsTitle: 'CATEGORIES',
    namePh: 'Name',
    addBtn: 'Add',
    doneTitle: '🏁 COMPLETED GOALS',
    doneHint: 'A finish is not a failure. Goals you took all the way live here.',
    badgesTitle: 'HALL OF REWARDS',
    badgesHint: 'Rewards are earned by streak length. Break the streak — rewards stay, but the rank burns. There’s something past 365 days you can’t see yet.',
    secretsTitle: '🔒 SECRETS',
    secretsHint: 'Not in the hall of rewards. Only those who got there know about this.',
    settingsTitle: 'SETTINGS',
    notifLabel: 'Remind me if the day isn’t logged',
    deadlineLbl: 'Deadline time:',
    langLbl: '🌍 Language:',
    exportBtn: 'Export data',
    importBtn: 'Import data',
    resetBtn: 'Burn it all',
    settingsHint: 'Data lives only in this browser. Export it so you don’t lose your streak.',
    footer: 'WEAK TODAY — SORE TOMORROW. YOUR CALL.',
    badData: 'Corrupted data. Starting from a clean slate.',
  },
};

const t = (key, ...args) => {
  const v = STR[lang][key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(...args) : v;
};

/* ---------- утилиты дат ---------- */
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const todayStr = () => fmt(new Date());
const diffDays = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);

/* ---------- состояние ---------- */
function seedCategories() {
  const t0 = Date.now();
  const cats = lang === 'ru'
    ? [{ name: 'Учёба', emoji: '📚', color: '#4d9fff' }, { name: 'Спорт', emoji: '🏋️', color: '#ff4d2e' }]
    : [{ name: 'Study', emoji: '📚', color: '#4d9fff' }, { name: 'Gym', emoji: '🏋️', color: '#ff4d2e' }];
  return cats.map((c, i) => ({ id: 'c' + t0 + i, ...c }));
}

function defaultState() {
  return {
    categories: [],          // заполняется после определения языка
    days: {},                // '2026-11-02': [catId, ...]
    frozen: {},              // '2026-11-01': true — дни, спасённые заморозкой
    freezeCredits: 2,        // заморозок в запасе (макс. 3)
    freezeMilestone: 0,      // за какую неделю серии заморозка уже выдана
    pendingFreezeDay: null,  // «вчера», которое можно спасти кнопкой
    secretBadges: [],        // полученные секретные награды (пороги)
    settings: { notif: false, time: '20:00', lang: undefined },
    badges: [],              // отмеченные пороги: [7, 30, ...]
    best: 0,                 // рекорд серии
    breaks: 0,               // сколько серий сорвано
    lastStreak: 0,           // серия, зафиксированная при прошлом запуске
    notifiedOn: null,        // чтобы не спамить уведомлением за день
  };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const def = defaultState();
      return { ...def, ...s, settings: { ...def.settings, ...(s.settings || {}) } };
    }
  } catch (e) { console.warn(t('badData'), e); }
  return defaultState();
}

const hadStoredData = !!localStorage.getItem(LS_KEY);
let state = load();

function initLang() {
  const saved = state.settings.lang;
  if (saved && STR[saved]) { lang = saved; return; }
  const nav = (navigator.language || 'en').toLowerCase();
  lang = nav.startsWith('ru') ? 'ru' : 'en';
  state.settings.lang = lang;
}

initLang();
if (!hadStoredData) state.categories = seedCategories(); // первичный запуск: категории на языке пользователя

const save = () => localStorage.setItem(LS_KEY, JSON.stringify(state));

/* ---------- стрики ---------- */
const markedSet = () => new Set(Object.keys(state.days).filter((k) => (state.days[k] || []).length > 0));
const catSet = (cid) => new Set(Object.keys(state.days).filter((k) => (state.days[k] || []).includes(cid)));

// Цепочка серии = дни побед + дни, спасённые заморозкой
const chainSet = () => {
  const s = markedSet();
  for (const k of Object.keys(state.frozen)) if (state.frozen[k]) s.add(k);
  return s;
};

// dayStr — «вчера», пустое и ещё не замороженное: его можно спасти
const canPatch = (dayStr) =>
  diffDays(dayStr, todayStr()) === 1 &&
  !(state.days[dayStr] || []).length &&
  !state.frozen[dayStr];

// Серия, продолжающаяся до сегодня (с льготным днём: если сегодня ещё не отмечено — считаем со вчера)
function currentStreak(set) {
  const day = todayStr();
  let d = parseDay(day);
  if (!set.has(day)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function bestStreakEver(set) {
  const sorted = [...set].sort();
  let best = 0, run = 0, prev = null;
  for (const d of sorted) {
    run = (prev && diffDays(prev, d) === 1) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

const rankFor = (n) => {
  let name = STR[lang].ranks[0];
  RANK_THRESHOLDS.forEach((min, i) => { if (n >= min) name = STR[lang].ranks[i]; });
  return name;
};

/* ---------- даты «отмечаемого» дня ---------- */
let selectedDay = todayStr();
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth(); // 0-11

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const el = {
  logoText: $('logoText'), streakNum: $('streakNum'), streakBox: $('streakBox'), rankName: $('rankName'),
  streakLbl: $('streakLbl'), rankLbl: $('rankLbl'),
  riskBanner: $('riskBanner'), breakBanner: $('breakBanner'), freezeBanner: $('freezeBanner'),
  freezeTitle: $('freezeTitle'), freezeDesc: $('freezeDesc'), freezeCount: $('freezeCount'), freezeBtn: $('freezeBtn'), freezeHint: $('freezeHint'),
  markTitle: $('markTitle'), motoLine: $('motoLine'), catButtons: $('catButtons'), markHint: $('markHint'),
  prevDay: $('prevDay'), nextDay: $('nextDay'),
  statStreak: $('statStreak'), statBest: $('statBest'), statTotal: $('statTotal'), statBreaks: $('statBreaks'),
  statStreakLbl: $('statStreakLbl'), statBestLbl: $('statBestLbl'), statTotalLbl: $('statTotalLbl'), statBreaksLbl: $('statBreaksLbl'),
  weekBars: $('weekBars'), dowBars: $('dowBars'), catStats: $('catStats'),
  stWins30: $('stWins30'), stRate30: $('stRate30'), stMonth: $('stMonth'), stWeakDay: $('stWeakDay'),
  stWinsLbl: $('stWinsLbl'), stRateLbl: $('stRateLbl'), stMonthLbl: $('stMonthLbl'), stWeakLbl: $('stWeakLbl'),
  hWeeks: $('hWeeks'), hDow: $('hDow'), hCats: $('hCats'), statsTitle: $('statsTitle'), shareBtn: $('shareBtn'),
  secretsCard: $('secretsCard'), secretList: $('secretList'), secretsTitle: $('secretsTitle'), secretsHint: $('secretsHint'),
  monthTitle: $('monthTitle'), prevMonth: $('prevMonth'), nextMonth: $('nextMonth'), todayBtn: $('todayBtn'),
  calendar: $('calendar'), legend: $('legend'),
  catList: $('catList'), catForm: $('catForm'), catName: $('catName'), catEmoji: $('catEmoji'), catColor: $('catColor'),
  catsTitle: $('catsTitle'), catAddBtn: $('catAddBtn'),
  finishForm: $('finishForm'), finishTitle: $('finishTitle'), finishNote: $('finishNote'), finishCancel: $('finishCancel'),
  finishSubmit: $('finishSubmit'), finishHint: $('finishHint'),
  doneCard: $('doneCard'), doneList: $('doneList'), doneCount: $('doneCount'), doneTitle: $('doneTitle'), doneHint: $('doneHint'),
  badges: $('badges'), badgesTitle: $('badgesTitle'), badgesHint: $('badgesHint'),
  notifToggle: $('notifToggle'), notifTime: $('notifTime'), notifStatus: $('notifStatus'), notifLabel: $('notifLabel'),
  deadlineLbl: $('deadlineLbl'), langLbl: $('langLbl'), langSelect: $('langSelect'),
  exportBtn: $('exportBtn'), importBtn: $('importBtn'), importFile: $('importFile'), resetBtn: $('resetBtn'),
  settingsTitle: $('settingsTitle'), settingsHint: $('settingsHint'),
  footer: $('footer'), toast: $('toast'),
};

/* ---------- сообщения ---------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
let toastTimer = null;
function toast(msg, ms = 3800) {
  el.toast.textContent = msg;
  el.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add('hidden'), ms);
}

/* ---------- международные форматы ---------- */
const humanDate = (dayStr, opts = { day: 'numeric', month: 'long', weekday: 'short' }) =>
  parseDay(dayStr).toLocaleDateString(LOCALE(), opts);

/* ---------- i18n статической страницы ---------- */
function applyI18n() {
  document.title = t('docTitle');
  document.documentElement.lang = lang;
  el.langSelect.value = lang;
  el.logoText.textContent = t('logo');
  el.streakLbl.textContent = t('daysLbl');
  el.rankLbl.textContent = t('rankLbl');
  el.markHint.textContent = t('markHint');
  el.statStreakLbl.textContent = lang === 'ru' ? 'текущая серия' : 'current streak';
  el.statBestLbl.textContent = t('cardRecord').toLowerCase();
  el.statTotalLbl.textContent = lang === 'ru' ? 'дней с победами' : 'days with wins';
  el.statBreaksLbl.textContent = lang === 'ru' ? 'сорвано серий' : 'streaks broken';
  el.freezeTitle.textContent = t('freezeTitle');
  el.freezeDesc.textContent = t('freezeDesc');
  el.freezeBtn.textContent = t('freezeBtn');
  el.freezeHint.textContent = t('freezeHint');
  el.todayBtn.textContent = t('calToday');
  el.statsTitle.textContent = t('statsTitle');
  el.shareBtn.textContent = t('shareBtn');
  el.stWinsLbl.textContent = t('stWins');
  el.stRateLbl.textContent = t('stRate');
  el.stMonthLbl.textContent = t('stMonth');
  el.stWeakLbl.textContent = t('stWeak');
  el.hWeeks.textContent = t('hWeeks');
  el.hDow.textContent = t('hDow');
  el.hCats.textContent = t('hCats');
  el.catsTitle.textContent = t('catsTitle');
  el.catName.placeholder = t('namePh');
  el.catAddBtn.textContent = t('addBtn');
  el.finishNote.placeholder = t('finishNotePh');
  el.finishSubmit.textContent = t('finishSubmit');
  el.finishCancel.textContent = t('finishCancel');
  el.finishHint.textContent = t('finishHint');
  el.doneTitle.textContent = t('doneTitle');
  el.doneHint.textContent = t('doneHint');
  el.badgesTitle.textContent = t('badgesTitle');
  el.badgesHint.textContent = t('badgesHint');
  el.secretsTitle.textContent = t('secretsTitle');
  el.secretsHint.textContent = t('secretsHint');
  el.settingsTitle.textContent = t('settingsTitle');
  el.notifLabel.textContent = t('notifLabel');
  el.deadlineLbl.textContent = t('deadlineLbl');
  el.langLbl.textContent = t('langLbl');
  el.exportBtn.textContent = t('exportBtn');
  el.importBtn.textContent = t('importBtn');
  el.resetBtn.textContent = t('resetBtn');
  el.settingsHint.textContent = t('settingsHint');
  el.footer.textContent = t('footer');
}

/* ---------- отметка ---------- */
function toggleMark(dayStr, catId) {
  const arr = state.days[dayStr] || [];
  const i = arr.indexOf(catId);
  const turningOn = i < 0;
  if (turningOn) arr.push(catId); else arr.splice(i, 1);
  if (arr.length) state.days[dayStr] = arr; else delete state.days[dayStr];

  if (turningOn) {
    // награды, звания и заморозки считаем по актуальной цепочке серии
    const cur = currentStreak(chainSet());
    state.best = Math.max(state.best, cur);
    checkBadges(cur);
    toast(pick(STR[lang].praise));
  } else {
    toast(t('unmark'));
  }
  save();
  render();
}

function checkBadges(cur) {
  BADGES.forEach((b, i) => {
    if (cur >= b.d && !state.badges.includes(b.d)) {
      state.badges.push(b.d);
      const name = STR[lang].badgeNames[i];
      setTimeout(() => toast(t('badgeGot', name, b.d), 5200), 900);
    }
  });
}

// Секретные награды: молча существуют, громко заявляются. В зале наград их нет.
function checkSecrets(cur) {
  SECRET_BADGES.forEach((s, i) => {
    if (cur >= s.d && !state.secretBadges.includes(s.d)) {
      state.secretBadges.push(s.d);
      const name = STR[lang].secretNames[i];
      setTimeout(() => toast(t('secretGot', name, s.d), 6500), 1400);
    }
  });
}

// +1 заморозка за каждую закрытую неделю серии (7, 14, 21...), максимум 3 в запасе
function maybeGrantFreeze(cur) {
  if (cur > 0 && cur % 7 === 0 && state.freezeMilestone < cur) {
    state.freezeMilestone = cur;
    if (state.freezeCredits < 3) {
      state.freezeCredits++;
      setTimeout(() => toast(t('freezeEarned'), 4500), 2200);
    }
  }
}

// Кнопка позора: признание + спасение серии
function applyFreeze() {
  const day = state.pendingFreezeDay;
  if (!day || !canPatch(day)) {
    state.pendingFreezeDay = null;
    save(); render();
    toast(t('freezeNotNeeded'));
    return;
  }
  if (state.freezeCredits <= 0) {
    state.pendingFreezeDay = null;
    state._justBroken = true;
    state._brokenFrom = state.lastStreak;
    state.breaks += 1;
    state.lastStreak = currentStreak(chainSet());
    save(); render();
    return;
  }
  state.frozen[day] = true;
  state.freezeCredits--;
  state.pendingFreezeDay = null;
  const cur = currentStreak(chainSet());
  state.lastStreak = cur;
  state.best = Math.max(state.best, cur);
  save(); render();
  toast(t('freezeApplied'), 5200);
}

/* ---------- рендер: шапка и статистика ---------- */
function renderHeader(cur) {
  el.streakNum.textContent = cur;
  el.rankName.textContent = rankFor(cur);
  el.streakBox.classList.toggle('burning', cur >= 3);

  const chain = chainSet();
  el.statStreak.textContent = cur;
  el.statBest.textContent = Math.max(state.best, bestStreakEver(chain), cur);
  el.statTotal.textContent = markedSet().size; // заморозка — не победа
  el.statBreaks.textContent = state.breaks;
}

/* ---------- рендер: баннеры ---------- */
function renderBanners() {
  const day = todayStr();
  const markedToday = (state.days[day] || []).length > 0;
  const hour = new Date().getHours();

  // Заморозка ждёт решения: серия на волоске, но её можно спасти кнопкой
  if (state.pendingFreezeDay) {
    el.freezeBanner.innerHTML =
      `<span class="big">${t('freezeWarnTitle', state.lastStreak)}</span><br>${t('freezeWarnBody', state.freezeCredits)}`;
    el.freezeBanner.classList.remove('hidden');
  } else {
    el.freezeBanner.classList.add('hidden');
  }

  // Угроза: сегодня ещё пусто
  if (!markedToday) {
    const msg = hour >= 19 ? pick(STR[lang].threat) : t('riskDefault');
    el.riskBanner.innerHTML = `<span class="big">${t('riskTitle')}</span><br>${msg}`;
    el.riskBanner.classList.remove('hidden');
  } else {
    el.riskBanner.classList.add('hidden');
  }

  // Разрыв серии (по факту прошлого запуска)
  if (state._justBroken) {
    el.breakBanner.innerHTML =
      `<span class="big">${t('breakTitle', state._brokenFrom)}</span><br>${pick(STR[lang].broken)}`;
    el.breakBanner.classList.remove('hidden');
    delete state._justBroken; delete state._brokenFrom;
  } else {
    el.breakBanner.classList.add('hidden');
  }
}

/* ---------- рендер: чипы категорий ---------- */
function renderChips() {
  const arr = state.days[selectedDay] || [];
  el.catButtons.innerHTML = '';
  const active = state.categories.filter((c) => !c.finished);
  for (const c of active) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (arr.includes(c.id) ? ' on' : '');
    b.style.setProperty('--chip-color', c.color);
    b.innerHTML = `<span class="chip-emoji">${c.emoji}</span><span>${escapeHtml(c.name)}</span>`;
    b.addEventListener('click', () => {
      toggleMark(selectedDay, c.id);
      b.classList.add('pop');
      setTimeout(() => b.classList.remove('pop'), 260);
    });
    el.catButtons.appendChild(b);
  }

  const isToday = selectedDay === todayStr();
  el.markTitle.textContent = isToday
    ? t('today')
    : humanDate(selectedDay).toUpperCase();
  el.nextDay.disabled = isToday;
  el.motoLine.textContent = isToday
    ? t('motoToday')
    : isFuture(selectedDay) ? '' : t('motoPast');
}

const isFuture = (dayStr) => diffDays(todayStr(), dayStr) > 0;

/* ---------- рендер: календарь ---------- */
function renderCalendar() {
  el.monthTitle.textContent = `${STR[lang].months[viewMonth]} ${viewYear}`.toUpperCase();

  const first = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const shift = (first.getDay() + 6) % 7; // ПН = 0

  const today = todayStr();
  const set = markedSet();
  el.calendar.innerHTML = '';

  for (let i = 0; i < shift; i++) el.calendar.appendChild(document.createElement('div'));

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
    const cats = state.days[dayStr] || [];
    const frozen = !!state.frozen[dayStr];
    const cell = document.createElement('div');
    cell.className = 'cell'
      + (cats.length ? ' won' : '')
      + (frozen ? ' frozen' : '')
      + (dayStr === today ? ' today' : '')
      + (dayStr === selectedDay ? ' selected' : '')
      + (isFuture(dayStr) ? ' future' : '');
    cell.innerHTML = `<span class="d">${d}</span>${frozen ? '<span class="frost">❄</span>' : ''}<div class="dots">${
      cats.slice(0, 4).map((cid) => {
        const c = state.categories.find((x) => x.id === cid);
        return `<i style="background:${c ? c.color : '#666'}"></i>`;
      }).join('')
    }</div>`;
    if (!isFuture(dayStr)) {
      cell.title = frozen ? t('cellFrozen') : set.has(dayStr) ? t('cellWon') : t('cellFree');
      cell.addEventListener('click', () => { selectedDay = dayStr; render(); });
    }
    el.calendar.appendChild(cell);
  }

  el.legend.innerHTML = state.categories
    .map((c) => `<span><i style="background:${c.color}"></i>${c.emoji} ${escapeHtml(c.name)}</span>`)
    .join('') + (Object.keys(state.frozen).length ? ` <span class="legend-frost">${t('legendFrost')}</span>` : '');
}

/* ---------- рендер: список категорий ---------- */
function renderCatList() {
  el.catList.innerHTML = '';
  const active = state.categories.filter((c) => !c.finished);
  if (!active.length) {
    el.catList.innerHTML = `<p class="hint">${t('activeNone')}</p>`;
  }
  for (const c of active) {
    const s = currentStreak(catSet(c.id));
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML =
      `<span class="cat-emoji">${c.emoji}</span>` +
      `<span class="cat-name">${escapeHtml(c.name)}</span>` +
      `<span class="cat-streak">${t('streakShort', s)}</span>` +
      `<button class="fin" title="${t('finHover')}">✔</button>` +
      `<button class="del" title="${t('delHover')}">✕</button>`;
    row.querySelector('.fin').addEventListener('click', () => openFinish(c.id));
    row.querySelector('.del').addEventListener('click', () => {
      if (!confirm(t('catDelConfirm', c.name))) return;
      state.categories = state.categories.filter((x) => x.id !== c.id);
      for (const k of Object.keys(state.days)) {
        state.days[k] = state.days[k].filter((id) => id !== c.id);
        if (!state.days[k].length) delete state.days[k];
      }
      save(); render();
    });
    el.catList.appendChild(row);
  }

  // форма логического завершения цели
  const fin = state.categories.find((x) => x.id === pendingFinishId);
  if (fin) {
    el.finishForm.classList.remove('hidden');
    el.finishTitle.innerHTML = t('finishQ', fin.emoji, escapeHtml(fin.name));
  } else {
    el.finishForm.classList.add('hidden');
  }
}

/* ---------- логическое завершение целей ---------- */
let pendingFinishId = null;

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function openFinish(id) {
  pendingFinishId = id;
  el.finishNote.value = '';
  render();
}

function resumeGoal(id) {
  const c = state.categories.find((x) => x.id === id);
  if (!c) return;
  delete c.finished; delete c.finishedOn; delete c.finishNote;
  save(); render();
  toast(t('resumed', c.name));
}

/* ---------- рендер: завершённые цели ---------- */
function renderDone() {
  const done = state.categories.filter((c) => c.finished);
  el.doneCard.classList.toggle('hidden', !done.length);
  el.doneCount.textContent = done.length ? t('doneCount', done.length) : '';
  el.doneList.innerHTML = done.map((c) => {
    const set = catSet(c.id);
    const start = set.size ? [...set].sort()[0] : c.finishedOn;
    const startH = start ? humanDate(start, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const endH = humanDate(c.finishedOn, { day: 'numeric', month: 'short', year: 'numeric' });
    return `<div class="done-row">
      <div class="dr-head">
        <span>${c.emoji}</span><span>${escapeHtml(c.name)}</span>
        <button class="mini-btn" data-resume="${c.id}" title="${t('resumed', '')}">${t('resumeBtn')}</button>
        <button class="mini-btn danger" data-del="${c.id}" title="${t('delForeverHover')}">✕</button>
      </div>
      <div class="dr-note">«${escapeHtml(c.finishNote || '')}»</div>
      <div class="dr-meta">${t('doneMeta', startH, endH, set.size, bestStreakEver(set))}</div>
    </div>`;
  }).join('');
  el.doneList.querySelectorAll('[data-resume]').forEach((b) =>
    b.addEventListener('click', () => resumeGoal(b.dataset.resume)));
  el.doneList.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      const c = state.categories.find((x) => x.id === b.dataset.del);
      if (!c) return;
      if (!confirm(t('doneDelConfirm', c.name))) return;
      state.categories = state.categories.filter((x) => x.id !== c.id);
      for (const k of Object.keys(state.days)) {
        state.days[k] = state.days[k].filter((id) => id !== c.id);
        if (!state.days[k].length) delete state.days[k];
      }
      save(); render();
    }));
}

/* ---------- рендер: награды ---------- */
function renderBadges() {
  el.badges.innerHTML = BADGES.map((b, i) => {
    const got = state.badges.includes(b.d);
    const name = got ? STR[lang].badgeNames[i] : '???';
    return `<div class="badge ${got ? 'got' : ''}">
      <div class="b-icon">${b.icon}</div>
      <div class="b-name">${name}</div>
      <div class="b-days">${b.d} ${lang === 'ru' ? 'дней' : 'days'}</div>
    </div>`;
  }).join('');
}

/* ---------- рендер: статистика ---------- */
function renderStats() {
  const marked = markedSet();
  const base = parseDay(todayStr());
  const dayAt = (offset) => fmt(new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset));

  // 30-дневные метрики
  let wins30 = 0;
  for (let i = 0; i < 30; i++) if (marked.has(dayAt(i))) wins30++;
  el.stWins30.textContent = wins30;
  el.stRate30.textContent = Math.round((wins30 / 30) * 100) + '%';

  let inMonth = 0;
  for (const d of marked) {
    const p = parseDay(d);
    if (p.getFullYear() === base.getFullYear() && p.getMonth() === base.getMonth()) inMonth++;
  }
  el.stMonth.textContent = inMonth;

  // по дням недели: где ты сдаёшься
  const dow = [0, 0, 0, 0, 0, 0, 0];
  for (const d of marked) dow[(parseDay(d).getDay() + 6) % 7]++;
  const weakIdx = marked.size >= 7 ? dow.indexOf(Math.min(...dow)) : -1;
  el.stWeakDay.textContent = weakIdx >= 0 ? STR[lang].dow[weakIdx] : '—';

  // недельные бары: последние 12 недель, старт — понедельник
  const monday = new Date(base);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  let bars = '';
  for (let w = 11; w >= 0; w--) {
    const start = new Date(monday);
    start.setDate(start.getDate() - 7 * w);
    let c = 0;
    for (let i = 0; i < 7; i++) if (marked.has(fmt(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)))) c++;
    const h = Math.round((c / 7) * 100);
    bars += `<div class="bar" title="${t('weekBar', start.toLocaleDateString(LOCALE()), c)}">
      <div class="fill" style="height:${h}%"></div>
      <div class="lbl">${pad(start.getDate())}.${pad(start.getMonth() + 1)}</div>
    </div>`;
  }
  el.weekBars.innerHTML = bars;

  const dowMax = Math.max(1, ...dow);
  el.dowBars.innerHTML = dow.map((c, i) =>
    `<div class="bar ${i === weakIdx ? 'weak' : ''}" title="${t('dowBar', STR[lang].dow[i], c)}">
      <div class="fill" style="height:${Math.round((c / dowMax) * 100)}%"></div>
      <div class="lbl">${STR[lang].dow[i]}</div>
    </div>`).join('');

  // разбивка по категориям
  const head = `<div class="cat-stat-row cat-stat-head">
    <span class="name">${t('thCat')}</span><span class="num">${t('thAll')}</span><span class="num">${t('thBest')}</span><span class="num">${t('thStreak')}</span><span class="num">${t('thRate')}</span>
  </div>`;
  el.catStats.innerHTML = head + state.categories.map((c) => {
    const set = catSet(c.id);
    let w30 = 0;
    for (let i = 0; i < 30; i++) if (set.has(dayAt(i))) w30++;
    return `<div class="cat-stat-row">
      <span class="name">${c.emoji} ${escapeHtml(c.name)}</span>
      <span class="num">${set.size}</span>
      <span class="num">${bestStreakEver(set)}</span>
      <span class="num"><b>${currentStreak(set)}</b></span>
      <span class="num">${Math.round((w30 / 30) * 100)}%</span>
    </div>`;
  }).join('');
}

/* ---------- рендер: заморозка и секреты ---------- */
function renderFreeze() {
  el.freezeCount.textContent = `❄ ${state.freezeCredits}`;
}

function renderSecrets() {
  const has = state.secretBadges.length > 0;
  el.secretsCard.classList.toggle('hidden', !has);
  if (!has) return;
  el.secretList.innerHTML = state.secretBadges.map((d) => {
    const idx = SECRET_BADGES.findIndex((x) => x.d === d);
    if (idx < 0) return '';
    return `<div class="badge got">
      <div class="b-icon">${SECRET_BADGES[idx].icon}</div>
      <div class="b-name">${STR[lang].secretNames[idx]}</div>
      <div class="b-days">${d} ${lang === 'ru' ? 'дней' : 'days'}</div>
    </div>`;
  }).join('');
}

/* ---------- скриншот-хвастство ---------- */
function drawSpaced(g, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + spacing; }
}

function wrapText(g, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) { g.fillText(line, x, yy); yy += lh; }
  return yy;
}

function drawShareCard(cur, phrase) {
  const W = 1080, H = 1350;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const F = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

  // фон и фирменная полоса
  g.fillStyle = '#0a0a0b'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ff4d2e'; g.fillRect(0, 0, W, 14);

  // логотип
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#ececee'; g.font = `900 52px ${F}`;
  drawSpaced(g, t('logo') + '_', 80, 128, 16);

  // огонь и главное число
  g.textAlign = 'center';
  g.font = '130px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  g.fillText('🔥', W / 2, 320);
  g.fillStyle = '#ff4d2e';
  g.font = `900 ${cur >= 1000 ? 240 : 300}px ${F}`;
  g.fillText(String(cur), W / 2, 600);
  g.fillStyle = '#84848c'; g.font = `800 34px ${F}`;
  g.fillText(t('cardStreak'), W / 2, 664);
  g.fillStyle = '#ececee'; g.font = `900 48px ${F}`;
  g.fillText(rankFor(cur).toUpperCase(), W / 2, 740);

  // фраза-вызов
  g.fillStyle = '#9a9aa2'; g.font = 'italic 600 40px ' + F;
  wrapText(g, `“${phrase}”`, W / 2, 825, W - 220, 56);

  // разделитель
  g.strokeStyle = '#232327'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(140, 1035); g.lineTo(W - 140, 1035); g.stroke();

  // три колонки: рекорд / дни побед / цели закрыты
  const chain = chainSet();
  const cols = [
    [Math.max(state.best, bestStreakEver(chain), cur), t('cardRecord')],
    [markedSet().size, t('cardDays')],
    [state.categories.filter((c) => c.finished).length, t('cardGoals')],
  ];
  cols.forEach(([v], i) => {
    g.fillStyle = i === 0 ? '#ff4d2e' : '#ececee';
    g.font = `900 64px ${F}`;
    g.fillText(String(v), (W * (1 + 2 * i)) / 6, 1128);
  });
  g.fillStyle = '#84848c'; g.font = `800 22px ${F}`;
  cols.forEach(([, l], i) => g.fillText(l, (W * (1 + 2 * i)) / 6, 1166));

  // активные категории с сериями
  g.fillStyle = '#84848c'; g.font = `700 30px ${F}`;
  state.categories.filter((c) => !c.finished).slice(0, 3).forEach((c, i) =>
    g.fillText(`${c.emoji} ${c.name} — ${currentStreak(catSet(c.id))}🔥`, W / 2, 1212 + i * 40));

  // низ
  g.fillStyle = '#84848c'; g.font = `600 26px ${F}`;
  g.fillText(new Date().toLocaleDateString(LOCALE(), { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, H - 54);
  g.fillStyle = '#3a3a40'; g.font = `800 20px ${F}`;
  g.fillText(t('cardFooter'), W / 2, H - 22);

  return cv;
}

async function shareResult() {
  const cur = currentStreak(chainSet());
  if (cur < 1) { toast(t('shareZero')); return; }
  const phrase = pick(STR[lang].brag)(cur);
  const cv = drawShareCard(cur, phrase);
  const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
  if (!blob) { toast(t('shareFail')); return; }
  const file = new File([blob], `pobeda-${todayStr()}.png`, { type: 'image/png' });

  // iPhone/Android: системный шеринг → «Сохранить изображение» → фото в галерее
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: t('logo'), text: phrase });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // закрыл шеринг — нечего качать
      // не получилось — качаем ниже
    }
  }

  // запасной путь: скачать PNG
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(t('shareSaved'));
}

/* ---------- общий рендер ---------- */
function render() {
  const cur = currentStreak(chainSet());
  state.best = Math.max(state.best, cur);
  checkBadges(cur); // самопроверка: награды должны выдаваться и после импорта/правок истории
  checkSecrets(cur);
  maybeGrantFreeze(cur);
  renderHeader(cur);
  renderBanners();
  renderChips();
  renderCalendar();
  renderCatList();
  renderBadges();
  renderStats();
  renderFreeze();
  renderSecrets();
  renderDone();
  renderNotifUI();
}

/* ---------- уведомления (локальные, без сервера) ---------- */
function swReg() { return navigator.serviceWorker?.getRegistration(); }

async function notify(title, body) {
  try {
    const reg = await swReg();
    if (reg) { await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'pobeda-reminder' }); return; }
  } catch (e) { /* fallback ниже */ }
  try { new Notification(title, { body, icon: 'icon-192.png', tag: 'pobeda-reminder' }); } catch (e) { /* нет поддержки */ }
}

function renderNotifUI() {
  el.notifToggle.checked = !!state.settings.notif;
  el.notifTime.value = state.settings.time;
  let status = '';
  if (state.settings.notif) {
    if (!('Notification' in window)) status = t('notifUnsupported');
    else if (Notification.permission === 'granted') status = t('notifOk');
    else if (Notification.permission === 'denied') status = t('notifDenied');
    else status = t('notifNeedPerm');
  }
  el.notifStatus.textContent = status;
}

async function onNotifToggle() {
  const want = el.notifToggle.checked;
  if (!want) { state.settings.notif = false; save(); renderNotifUI(); return; }
  if (!('Notification' in window)) { toast(t('notifUnsupported')); state.settings.notif = false; save(); renderNotifUI(); return; }
  let perm = Notification.permission;
  if (perm === 'default') perm = await Notification.requestPermission();
  if (perm !== 'granted') { state.settings.notif = false; toast(t('notifDeniedToast')); }
  else { state.settings.notif = true; toast(t('notifOn')); }
  save(); renderNotifUI();
}

function checkNotify() {
  if (!state.settings.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const [h, m] = (state.settings.time || '20:00').split(':').map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = fmt(now);
  if (minutesNow >= h * 60 + m && (state.days[today] || []).length === 0 && state.notifiedOn !== today) {
    state.notifiedOn = today; save();
    notify(t('notifyTitle'), t('notifyBody', currentStreak(chainSet())));
  }
}

/* ---------- экспорт / импорт / сброс ---------- */
function doExport() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pobeda-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('exported'));
}

function doImport(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !Array.isArray(data.categories) || typeof data.days !== 'object') {
        throw new Error('bad');
      }
      state = { ...defaultState(), ...data, settings: { ...defaultState().settings, ...(data.settings || {}) } };
      if (state.settings.lang && STR[state.settings.lang]) lang = state.settings.lang;
      applyI18n();
      save(); render();
      toast(t('imported'));
    } catch (e) { toast(t('badFile')); }
  };
  reader.readAsText(file);
}

/* ---------- события ---------- */
el.prevDay.addEventListener('click', () => { selectedDay = fmt(parseDay(selectedDay) - DAY_MS); render(); });
el.nextDay.addEventListener('click', () => {
  const next = fmt(parseDay(selectedDay) + DAY_MS);
  if (diffDays(todayStr(), next) <= 0) { selectedDay = next; render(); }
});
el.prevMonth.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); });
el.nextMonth.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); });
el.todayBtn.addEventListener('click', () => {
  const now = new Date(); viewYear = now.getFullYear(); viewMonth = now.getMonth(); selectedDay = fmt(now); render();
});

el.catForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = el.catName.value.trim();
  if (!name) return;
  const emoji = el.catEmoji.value.trim() || '🎯';
  const color = el.catColor.value;
  if (state.categories.length >= 12) { toast(t('catLimit')); return; }
  state.categories.push({ id: 'c' + Date.now(), name, emoji, color });
  el.catName.value = ''; el.catEmoji.value = '';
  save(); render();
  toast(t('catCreated', name));
});

// Переключение языка
el.langSelect.addEventListener('change', () => {
  lang = el.langSelect.value;
  state.settings.lang = lang;
  save();
  applyI18n();
  render();
});

// Кнопка признания: заморозка
el.freezeBtn.addEventListener('click', () => {
  if (state.pendingFreezeDay && canPatch(state.pendingFreezeDay) && state.freezeCredits > 0) {
    applyFreeze();
  } else if (state.pendingFreezeDay && state.freezeCredits <= 0) {
    toast(t('freezeNone'));
  } else {
    toast(t('freezeNoNeedBtn'));
  }
});

// Логическое завершение цели
el.finishCancel.addEventListener('click', () => { pendingFinishId = null; render(); });
el.finishForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const c = state.categories.find((x) => x.id === pendingFinishId);
  if (!c) return;
  c.finished = true;
  c.finishedOn = todayStr();
  c.finishNote = el.finishNote.value.trim() || t('noReason');
  pendingFinishId = null;
  save(); render();
  toast(t('closed', c.name), 5500);
});

// Скриншот-хвастство
el.shareBtn.addEventListener('click', () => { shareResult(); });

el.notifToggle.addEventListener('change', onNotifToggle);
el.notifTime.addEventListener('change', () => {
  state.settings.time = el.notifTime.value || '20:00';
  state.notifiedOn = null; // новое время — новая охота
  save();
});

el.exportBtn.addEventListener('click', doExport);
el.importBtn.addEventListener('click', () => el.importFile.click());
el.importFile.addEventListener('change', () => { if (el.importFile.files[0]) doImport(el.importFile.files[0]); el.importFile.value = ''; });
el.resetBtn.addEventListener('click', () => {
  if (!confirm(t('resetQ1'))) return;
  if (!confirm(t('resetQ2'))) return;
  state = defaultState();
  state.categories = [];
  state.settings.lang = lang;
  save(); applyI18n(); render();
  toast(t('resetDone'));
});

/* ---------- детект обрыва серии при запуске ---------- */
function detectBreak() {
  const cur = currentStreak(chainSet());
  const prev = state.lastStreak;

  // висящее предложение заморозки ещё актуально?
  if (state.pendingFreezeDay && !canPatch(state.pendingFreezeDay)) state.pendingFreezeDay = null;

  if (!state.pendingFreezeDay && prev >= 2 && cur < prev) {
    const yesterday = fmt(new Date(parseDay(todayStr()) - DAY_MS));
    if (state.freezeCredits > 0 && canPatch(yesterday)) {
      // серию можно спасти: даём шанс нажать кнопку позора, разрыв не фиксируем
      state.pendingFreezeDay = yesterday;
    } else {
      state._justBroken = true;
      state._brokenFrom = prev;
      state.breaks += 1;
    }
  }
  if (!state.pendingFreezeDay) state.lastStreak = cur;
}

/* ---------- service worker ---------- */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* ---------- старт ---------- */
detectBreak();
save();
applyI18n();
render();

setInterval(checkNotify, 30000);
checkNotify();

// Если пользователь вернулся на вкладку — перепроверить баннеры и уведомления
document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); checkNotify(); } });
