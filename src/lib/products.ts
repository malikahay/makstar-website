export type PastaKind =
  | "spaghetti"
  | "penne"
  | "fusilli"
  | "farfalle"
  | "conchiglie"
  | "elbow"
  | "rigatoni"
  | "nest"
  | "vermicelli"
  | "noodles";

export type Method = "boil" | "fry" | "bake";

export type Category = "long" | "short" | "shaped" | "soup";

export type Product = {
  slug: string;
  kind: PastaKind;
  name: string;
  latin: string;
  number: string;
  category: Category;
  methods: Method[];
  tagline: string;
  description: string;
  cookTime: number;
  weights: { grams: number; price: number }[];
  nutrition: { kcal: number; protein: number; fat: number; carbs: number };
  bestWith: string[];
  badge?: string;
};

export const categoryLabels: Record<Category, string> = {
  long: "Длинные",
  short: "Короткие",
  shaped: "Фигурные",
  soup: "Для супа",
};

export const methodLabels: Record<Method, string> = {
  boil: "Варить",
  fry: "Жарить",
  bake: "Запекать",
};

const baseNutrition = { kcal: 344, protein: 12.5, fat: 1.4, carbs: 70.2 };

// Built-in copy of the catalog. The live catalog comes from the Go API (see lib/catalog.ts);
// this is only used when the API is unreachable, e.g. during a build without the backend.
export const fallbackProducts: Product[] = [
  {
    slug: "spaghetti",
    kind: "spaghetti",
    name: "Спагетти",
    latin: "Spaghetti",
    number: "№01",
    category: "long",
    methods: ["boil", "fry"],
    tagline: "Классика, которая держит соус и не слипается.",
    description:
      "Длинные, ровные и упругие. Из твёрдой пшеницы, прессуются через бронзовые матрицы — поверхность получается шероховатой, и соус буквально цепляется за каждую нить. Идеальны отварными, а на следующий день — обжаренными с яйцом.",
    cookTime: 9,
    weights: [
      { grams: 400, price: 12900 },
      { grams: 800, price: 23900 },
    ],
    nutrition: baseNutrition,
    bestWith: ["Томатный соус", "Сливочные соусы", "Жарка с яйцом"],
    badge: "Хит",
  },
  {
    slug: "penne",
    kind: "penne",
    name: "Перья",
    latin: "Penne Rigate",
    number: "№02",
    category: "short",
    methods: ["boil", "fry", "bake"],
    tagline: "Рифлёные трубочки, внутри которых прячется соус.",
    description:
      "Косой срез, глубокие рифления и толстая стенка. Перья не разваливаются ни в кастрюле, ни на сковороде, ни в духовке под сыром. Универсальный солдат любой кухни.",
    cookTime: 11,
    weights: [
      { grams: 400, price: 13500 },
      { grams: 800, price: 24900 },
    ],
    nutrition: baseNutrition,
    bestWith: ["Запеканки", "Мясной соус", "Жарка с овощами"],
    badge: "Хит",
  },
  {
    slug: "fusilli",
    kind: "fusilli",
    name: "Спирали",
    latin: "Fusilli",
    number: "№03",
    category: "shaped",
    methods: ["boil", "fry", "bake"],
    tagline: "Три витка — три раза больше соуса.",
    description:
      "Тугие спирали, которые закручивают в себя любой соус, сыр или обжаренный лук. Отлично держат форму в салатах и на сковороде — не превращаются в кашу даже на сильном огне.",
    cookTime: 10,
    weights: [
      { grams: 400, price: 13500 },
      { grams: 800, price: 24900 },
    ],
    nutrition: baseNutrition,
    bestWith: ["Салаты", "Песто", "Сырные соусы"],
  },
  {
    slug: "farfalle",
    kind: "farfalle",
    name: "Бантики",
    latin: "Farfalle",
    number: "№04",
    category: "shaped",
    methods: ["boil", "bake"],
    tagline: "Любимые у детей. Тайно — у взрослых тоже.",
    description:
      "Плотная серединка и тонкие гофрированные крылышки: одна порция — две текстуры. Бантики красиво смотрятся на тарелке и прекрасно работают в лёгких сливочных соусах.",
    cookTime: 11,
    weights: [{ grams: 400, price: 14500 }],
    nutrition: baseNutrition,
    bestWith: ["Сливки и курица", "Горошек", "Детское меню"],
    badge: "Новинка",
  },
  {
    slug: "conchiglie",
    kind: "conchiglie",
    name: "Ракушки",
    latin: "Conchiglie",
    number: "№05",
    category: "shaped",
    methods: ["boil", "bake"],
    tagline: "Каждая ракушка — маленькая чаша для соуса.",
    description:
      "Глубокие ракушки с рифлёной спинкой. Внутри остаётся соус, фарш или расплавленный сыр — каждая ложка получается полной. Отличны для запекания.",
    cookTime: 12,
    weights: [{ grams: 400, price: 14500 }],
    nutrition: baseNutrition,
    bestWith: ["Фарш", "Сыр", "Запекание"],
  },
  {
    slug: "elbow",
    kind: "elbow",
    name: "Рожки",
    latin: "Chifferi",
    number: "№06",
    category: "short",
    methods: ["boil", "fry", "bake"],
    tagline: "Вкус детства. Макароны по-флотски одобряют.",
    description:
      "Те самые рожки. Быстро варятся, идеально жарятся с фаршем и луком и становятся основой для самой уютной запеканки. Одна пачка — ужин на всю семью.",
    cookTime: 8,
    weights: [
      { grams: 400, price: 11900 },
      { grams: 900, price: 22900 },
    ],
    nutrition: baseNutrition,
    bestWith: ["По-флотски", "Запеканка", "С сыром"],
    badge: "Хит",
  },
  {
    slug: "rigatoni",
    kind: "rigatoni",
    name: "Ригатони",
    latin: "Rigatoni",
    number: "№07",
    category: "short",
    methods: ["boil", "bake"],
    tagline: "Большие трубки для больших аппетитов.",
    description:
      "Крупные рифлёные трубки с толстой стенкой. Держат густые мясные соусы и выдерживают долгое запекание, оставаясь упругими.",
    cookTime: 13,
    weights: [{ grams: 400, price: 14900 }],
    nutrition: baseNutrition,
    bestWith: ["Болоньезе", "Запекание", "Густые соусы"],
  },
  {
    slug: "nest",
    kind: "nest",
    name: "Гнёзда",
    latin: "Tagliatelle Nidi",
    number: "№08",
    category: "long",
    methods: ["boil", "fry"],
    tagline: "Широкие ленты, свёрнутые в идеальную порцию.",
    description:
      "Тальятелле, аккуратно уложенные в гнёзда. Одно гнездо — одна порция, никаких весов. Широкие ленты великолепны со сливочными соусами и грибами.",
    cookTime: 7,
    weights: [{ grams: 450, price: 17900 }],
    nutrition: baseNutrition,
    bestWith: ["Грибы", "Сливки", "Жарка"],
    badge: "Премиум",
  },
  {
    slug: "vermicelli",
    kind: "vermicelli",
    name: "Вермишель",
    latin: "Capellini",
    number: "№09",
    category: "soup",
    methods: ["boil", "fry"],
    tagline: "Паутинка для супа, который лечит всё.",
    description:
      "Тонкая, быстрая, нежная. Готовится за 3 минуты прямо в бульоне. А если обжарить её до золотистого цвета перед варкой — получится совсем другой вкус.",
    cookTime: 3,
    weights: [
      { grams: 400, price: 10900 },
      { grams: 900, price: 19900 },
    ],
    nutrition: baseNutrition,
    bestWith: ["Куриный суп", "Молочный суп", "Обжарка"],
  },
  {
    slug: "noodles",
    kind: "noodles",
    name: "Лапша",
    latin: "Lapsha Domashnaya",
    number: "№10",
    category: "long",
    methods: ["boil", "fry"],
    tagline: "Как у бабушки, только без муки на полу.",
    description:
      "Широкая яичная лапша по домашнему рецепту. Для лагмана, куриного супа и жарки в воке — держит форму и впитывает вкус.",
    cookTime: 6,
    weights: [{ grams: 400, price: 15900 }],
    nutrition: { kcal: 356, protein: 13.2, fat: 2.3, carbs: 69.4 },
    bestWith: ["Лагман", "Суп", "Вок"],
  },
];

export function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n).replace(/ /g, " ") + " сум";
}

export const FREE_SHIPPING_FROM = 150000;
export const SHIPPING_PRICE = 15000;
