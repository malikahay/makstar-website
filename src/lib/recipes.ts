import type { Lang } from "@/i18n/config";
import type { Method, PastaKind } from "./products";

export type Recipe = {
  slug: string;
  title: string;
  lead: string;
  method: Method;
  product: string;
  kind: PastaKind;
  time: number;
  servings: number;
  level: "easy" | "medium" | "chef";
  ingredients: string[];
  steps: string[];
};

const recipesRu: Recipe[] = [
  {
    slug: "fried-spaghetti-egg",
    title: "Жареные спагетти с яйцом",
    lead: "Вчерашние спагетти, сковорода и 7 минут — лучший завтрак в мире.",
    method: "fry",
    product: "spaghetti",
    kind: "spaghetti",
    time: 15,
    servings: 2,
    level: "easy",
    ingredients: [
      "300 г отварных спагетти Makstar",
      "3 яйца",
      "1 луковица",
      "2 ст. л. сливочного масла",
      "Соль, чёрный перец",
      "Зелёный лук",
    ],
    steps: [
      "Растопите масло на сильном огне и обжарьте лук до золотистого цвета.",
      "Добавьте спагетти и не мешайте 2–3 минуты, чтобы появилась хрустящая корочка.",
      "Переверните, влейте взбитые яйца и перемешайте, пока яйцо не схватится.",
      "Посолите, поперчите, посыпьте зелёным луком. Подавайте сразу.",
    ],
  },
  {
    slug: "navy-style",
    title: "Макароны по-флотски",
    lead: "Рожки, фарш, лук. Легенда, которая не нуждается в представлении.",
    method: "fry",
    product: "elbow",
    kind: "elbow",
    time: 25,
    servings: 4,
    level: "easy",
    ingredients: [
      "400 г рожков Makstar",
      "400 г говяжьего фарша",
      "2 луковицы",
      "1 морковь",
      "2 ст. л. масла",
      "Соль, перец, зира",
    ],
    steps: [
      "Отварите рожки в подсоленной воде 7 минут — на минуту меньше, чем на пачке.",
      "Обжарьте лук и морковь, добавьте фарш и жарьте до румяности.",
      "Всыпьте рожки к фаршу и жарьте всё вместе ещё 3–4 минуты на сильном огне.",
      "Приправьте зирой, солью и перцем. Готово.",
    ],
  },
  {
    slug: "penne-bake",
    title: "Запечённые перья с сыром",
    lead: "Тянущийся сыр, румяная корочка и соус внутри каждой трубочки.",
    method: "bake",
    product: "penne",
    kind: "penne",
    time: 40,
    servings: 4,
    level: "medium",
    ingredients: [
      "400 г перьев Makstar",
      "500 мл томатного соуса",
      "250 г моцареллы",
      "80 г твёрдого сыра",
      "Базилик, чеснок",
    ],
    steps: [
      "Отварите перья 8 минут — они дойдут в духовке.",
      "Смешайте с томатным соусом, чесноком и половиной моцареллы.",
      "Выложите в форму, накройте оставшимся сыром.",
      "Запекайте 20 минут при 200 °C до румяной корочки.",
    ],
  },
  {
    slug: "vermicelli-soup",
    title: "Куриный суп с паутинкой",
    lead: "Тот самый суп, который лечит простуду, грусть и понедельники.",
    method: "boil",
    product: "vermicelli",
    kind: "vermicelli",
    time: 50,
    servings: 6,
    level: "easy",
    ingredients: [
      "100 г вермишели Makstar",
      "500 г курицы",
      "2 картофелины",
      "1 морковь, 1 луковица",
      "Лавровый лист, укроп",
    ],
    steps: [
      "Сварите бульон из курицы 35 минут, снимая пену.",
      "Добавьте картофель, морковь и лук, варите 10 минут.",
      "Всыпьте вермишель и варите 3 минуты.",
      "Выключите огонь, добавьте укроп и дайте постоять 5 минут.",
    ],
  },
  {
    slug: "fusilli-salad",
    title: "Салат со спиралями и тунцом",
    lead: "Холодная паста для обеда с собой. Вкуснее на второй день.",
    method: "boil",
    product: "fusilli",
    kind: "fusilli",
    time: 20,
    servings: 3,
    level: "easy",
    ingredients: [
      "250 г спиралей Makstar",
      "1 банка тунца",
      "Черри, огурец, красный лук",
      "Оливковое масло, лимон",
      "Орегано",
    ],
    steps: [
      "Отварите спирали 10 минут и промойте холодной водой.",
      "Нарежьте овощи, смешайте с тунцом.",
      "Заправьте маслом, лимонным соком и орегано.",
      "Перемешайте со спиралями и охладите 10 минут.",
    ],
  },
  {
    slug: "lagman",
    title: "Жареный лагман",
    lead: "Лапша, говядина, овощи и вок, раскалённый до предела.",
    method: "fry",
    product: "noodles",
    kind: "noodles",
    time: 45,
    servings: 4,
    level: "chef",
    ingredients: [
      "400 г лапши Makstar",
      "400 г говядины",
      "Болгарский перец, редька, стручковая фасоль",
      "2 помидора, чеснок",
      "Соевый соус, зира, перец чили",
    ],
    steps: [
      "Отварите лапшу 5 минут, промойте и сбрызните маслом.",
      "Обжарьте говядину соломкой на очень сильном огне.",
      "Добавьте овощи, чеснок и помидоры — жарьте 5 минут.",
      "Вмешайте лапшу, соевый соус и специи. Жарьте ещё 3 минуты, постоянно подбрасывая.",
    ],
  },
  {
    slug: "creamy-farfalle",
    title: "Бантики в сливочном соусе с курицей",
    lead: "Нежно, быстро, по-ресторанному. Дети просят добавки.",
    method: "boil",
    product: "farfalle",
    kind: "farfalle",
    time: 25,
    servings: 3,
    level: "medium",
    ingredients: [
      "300 г бантиков Makstar",
      "300 г куриного филе",
      "200 мл сливок 20%",
      "50 г пармезана",
      "Зелёный горошек, чеснок",
    ],
    steps: [
      "Отварите бантики 11 минут.",
      "Обжарьте курицу кусочками с чесноком.",
      "Влейте сливки, добавьте горошек и тёртый сыр, уварите 3 минуты.",
      "Смешайте с бантиками и подавайте с перцем.",
    ],
  },
  {
    slug: "stuffed-shells",
    title: "Фаршированные ракушки",
    lead: "Каждая ракушка — сюрприз с фаршем и сыром.",
    method: "bake",
    product: "conchiglie",
    kind: "conchiglie",
    time: 55,
    servings: 4,
    level: "chef",
    ingredients: [
      "250 г ракушек Makstar",
      "300 г фарша",
      "400 мл томатного соуса",
      "200 г сыра",
      "Сметана, зелень",
    ],
    steps: [
      "Отварите ракушки 8 минут.",
      "Обжарьте фарш с луком, остудите.",
      "Нафаршируйте ракушки и уложите в форму на слой соуса.",
      "Полейте соусом, посыпьте сыром, запекайте 25 минут при 190 °C.",
    ],
  },
];

type RecipeText = Pick<Recipe, "title" | "lead" | "ingredients" | "steps">;

const uzText: Record<string, RecipeText> = {
  "fried-spaghetti-egg": {
    title: "Tuxumli qovurilgan spagetti",
    lead: "Kechagi spagetti, tova va 7 daqiqa — dunyodagi eng yaxshi nonushta.",
    ingredients: [
      "300 g qaynatilgan Makstar spagettisi",
      "3 ta tuxum",
      "1 ta piyoz",
      "2 osh qoshiq sariyog‘",
      "Tuz, qora murch",
      "Ko‘k piyoz",
    ],
    steps: [
      "Sariyog‘ni baland olovda eritib, piyozni oltin rangga kirguncha qovuring.",
      "Spagettini soling va qarsildoq qobiq hosil bo‘lishi uchun 2–3 daqiqa aralashtirmang.",
      "Ag‘daring, ko‘pirtirilgan tuxumni quying va tuxum qotguncha aralashtiring.",
      "Tuz, murch soling, ko‘k piyoz sepib, darhol dasturxonga torting.",
    ],
  },
  "navy-style": {
    title: "Flotcha makaron",
    lead: "Shoxcha, qiyma, piyoz. Tanishtirishga hojat yo‘q afsona.",
    ingredients: [
      "400 g Makstar shoxchasi",
      "400 g mol go‘shti qiymasi",
      "2 ta piyoz",
      "1 ta sabzi",
      "2 osh qoshiq yog‘",
      "Tuz, murch, zira",
    ],
    steps: [
      "Shoxchani tuzli suvda 7 daqiqa qaynating — qadoqdagidan bir daqiqa kam.",
      "Piyoz va sabzini qovurib, qiymani qo‘shing va qizarguncha qovuring.",
      "Shoxchani qiymaga qo‘shib, hammasini baland olovda yana 3–4 daqiqa qovuring.",
      "Zira, tuz va murch bilan ziravorlang. Tayyor.",
    ],
  },
  "penne-bake": {
    title: "Pishloqli pishirilgan penne",
    lead: "Cho‘ziluvchi pishloq, qizarib pishgan qobiq va har bir naycha ichida sous.",
    ingredients: [
      "400 g Makstar pennesi",
      "500 ml pomidor sousi",
      "250 g motsarella",
      "80 g qattiq pishloq",
      "Rayhon, sarimsoq",
    ],
    steps: [
      "Penneni 8 daqiqa qaynating — duxovkada pishib yetadi.",
      "Pomidor sousi, sarimsoq va motsarellaning yarmi bilan aralashtiring.",
      "Qolipga solib, ustini qolgan pishloq bilan yoping.",
      "200 °C da qizarguncha 20 daqiqa pishiring.",
    ],
  },
  "vermicelli-soup": {
    title: "Vermishelli tovuq sho‘rva",
    lead: "Shamollash, g‘am va dushanbalarni davolaydigan o‘sha sho‘rva.",
    ingredients: [
      "100 g Makstar vermisheli",
      "500 g tovuq",
      "2 ta kartoshka",
      "1 ta sabzi, 1 ta piyoz",
      "Dafna bargi, shivit",
    ],
    steps: [
      "Tovuqdan 35 daqiqa ko‘pigini olib turib sho‘rva qaynating.",
      "Kartoshka, sabzi va piyozni qo‘shib, 10 daqiqa qaynating.",
      "Vermishelni solib, 3 daqiqa qaynating.",
      "Olovni o‘chiring, shivit qo‘shing va 5 daqiqa damlab qo‘ying.",
    ],
  },
  "fusilli-salad": {
    title: "Spiral va tunetsli salat",
    lead: "Tushlikka olib ketish uchun sovuq pasta. Ikkinchi kuni yanada mazali.",
    ingredients: [
      "250 g Makstar spirali",
      "1 banka tunets",
      "Cherri, bodring, qizil piyoz",
      "Zaytun moyi, limon",
      "Oregano",
    ],
    steps: [
      "Spiralni 10 daqiqa qaynatib, sovuq suvda yuving.",
      "Sabzavotlarni to‘g‘rab, tunets bilan aralashtiring.",
      "Moy, limon sharbati va oregano bilan ziravorlang.",
      "Spiral bilan aralashtirib, 10 daqiqa sovuting.",
    ],
  },
  lagman: {
    title: "Qovurma lag‘mon",
    lead: "Ugra, mol go‘shti, sabzavotlar va juda qizdirilgan vok.",
    ingredients: [
      "400 g Makstar ugrasi",
      "400 g mol go‘shti",
      "Bolgar qalampiri, turp, loviya",
      "2 ta pomidor, sarimsoq",
      "Soya sousi, zira, achchiq qalampir",
    ],
    steps: [
      "Ugrani 5 daqiqa qaynatib, yuving va ozgina yog‘ seping.",
      "Mol go‘shtini somoncha qilib juda baland olovda qovuring.",
      "Sabzavot, sarimsoq va pomidorni qo‘shib, 5 daqiqa qovuring.",
      "Ugra, soya sousi va ziravorlarni qo‘shing. Doimo silkitib, yana 3 daqiqa qovuring.",
    ],
  },
  "creamy-farfalle": {
    title: "Tovuqli qaymoqli sousda kapalaklar",
    lead: "Nozik, tez va restorandagidek. Bolalar yana so‘rashadi.",
    ingredients: [
      "300 g Makstar kapalaklari",
      "300 g tovuq filesi",
      "200 ml 20% li qaymoq",
      "50 g parmezan",
      "Ko‘k no‘xat, sarimsoq",
    ],
    steps: [
      "Kapalaklarni 11 daqiqa qaynating.",
      "Tovuqni bo‘laklab sarimsoq bilan qovuring.",
      "Qaymoq quyib, no‘xat va qirg‘ichdan o‘tkazilgan pishloqni qo‘shing, 3 daqiqa qaynating.",
      "Kapalaklar bilan aralashtirib, murch bilan torting.",
    ],
  },
  "stuffed-shells": {
    title: "To‘ldirilgan chig‘anoqlar",
    lead: "Har bir chig‘anoq — qiyma va pishloqli syurpriz.",
    ingredients: [
      "250 g Makstar chig‘anoqlari",
      "300 g qiyma",
      "400 ml pomidor sousi",
      "200 g pishloq",
      "Qaymoq, ko‘katlar",
    ],
    steps: [
      "Chig‘anoqlarni 8 daqiqa qaynating.",
      "Qiymani piyoz bilan qovurib, sovuting.",
      "Chig‘anoqlarni to‘ldirib, sous qatlami ustiga qolipga tering.",
      "Sous quyib, pishloq seping va 190 °C da 25 daqiqa pishiring.",
    ],
  },
};

const recipesUz: Recipe[] = recipesRu.map((r) => ({ ...r, ...uzText[r.slug] }));

export function getRecipes(lang: Lang): Recipe[] {
  return lang === "uz" ? recipesUz : recipesRu;
}
