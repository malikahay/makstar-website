import { SITE } from "@/lib/site";
import type { Lang } from "./config";

// Public offer and privacy policy. Company details come from SITE.company; edit the texts here.
// Drafts written for an LLC in Uzbekistan — have a lawyer review them before launch.

export type LegalDoc = "offer" | "privacy";

type Section = { h: string; p: string[] };
type Doc = { title: string; updated: string; intro: string; sections: Section[] };

const UPDATED = "16.10.2026";

function company(lang: Lang) {
  const c = SITE.company;
  const blank = lang === "uz" ? "[to‘ldirilmagan]" : "[не заполнено]";
  return {
    name: c.name ? (lang === "uz" ? `«${c.name}» MChJ` : `ООО «${c.name}»`) : blank,
    inn: c.inn || blank,
    address: c.address || blank,
    phone: SITE.phone,
    email: SITE.email,
    site: c.site || blank,
  };
}

const ru = (): Record<LegalDoc, Doc> => {
  const c = company("ru");
  return {
    offer: {
      title: "Публичная оферта",
      updated: `Редакция от ${UPDATED}`,
      intro: `${c.name} (ИНН ${c.inn}, далее — «Продавец») предлагает любому лицу (далее — «Покупатель») заключить договор купли-продажи товаров на условиях ниже. Оферта является публичной в соответствии со статьёй 369 Гражданского кодекса Республики Узбекистан.`,
      sections: [
        {
          h: "1. Предмет договора",
          p: [
            "Продавец передаёт в собственность Покупателя товары (макаронные изделия), представленные на сайте " + c.site + ", а Покупатель принимает и оплачивает их.",
            "Описание, состав, фасовка и цена товара указаны на странице товара. Изображения товара носят иллюстративный характер.",
          ],
        },
        {
          h: "2. Акцепт оферты",
          p: [
            "Акцептом оферты (согласием с её условиями) является оформление заказа на сайте. С момента оформления заказа договор считается заключённым.",
            "Оформляя заказ, Покупатель подтверждает, что ознакомился с офертой и Политикой конфиденциальности и согласен с ними.",
          ],
        },
        {
          h: "3. Цены и оформление заказа",
          p: [
            "Цены указаны в сумах. Цена товара в заказе фиксируется в момент его оформления и после этого не меняется.",
            "После оформления заказа Продавец связывается с Покупателем по указанному телефону для подтверждения. Продавец вправе отказать в заказе, если товара нет в наличии, сообщив об этом Покупателю.",
          ],
        },
        {
          h: "4. Доставка и самовывоз",
          p: [
            "Способы, сроки и стоимость доставки указаны на странице «Доставка и оплата» и при оформлении заказа. Итоговая стоимость доставки показывается до подтверждения заказа.",
            "Самовывоз возможен из пункта выдачи по адресу, указанному на сайте, после подтверждения готовности заказа.",
            "Риск случайной гибели или повреждения товара переходит к Покупателю в момент передачи товара.",
          ],
        },
        {
          h: "5. Оплата",
          p: [
            "Оплата производится при получении заказа наличными или банковской картой (Humo, Uzcard).",
            "Онлайн-оплата на сайте не принимается. Продавец не запрашивает данные банковских карт по телефону или в мессенджерах.",
          ],
        },
        {
          h: "6. Приёмка, качество и возврат",
          p: [
            "При получении Покупатель проверяет количество, целостность упаковки и срок годности товара.",
            "Если товар оказался ненадлежащего качества, с повреждённой упаковкой или не соответствует заказу, Покупатель вправе потребовать замены товара или возврата уплаченной суммы. Для этого достаточно связаться с Продавцом по телефону или email, указанным ниже.",
            "Пищевые продукты надлежащего качества возврату и обмену не подлежат, если иное не предусмотрено законодательством Республики Узбекистан о защите прав потребителей.",
          ],
        },
        {
          h: "7. Ответственность и споры",
          p: [
            "Стороны несут ответственность в соответствии с законодательством Республики Узбекистан.",
            "Споры решаются путём переговоров, а при недостижении согласия — в суде по законодательству Республики Узбекистан.",
          ],
        },
        {
          h: "8. Реквизиты Продавца",
          p: [`${c.name}`, `ИНН: ${c.inn}`, `Адрес: ${c.address}`, `Телефон: ${c.phone}`, `Email: ${c.email}`],
        },
      ],
    },
    privacy: {
      title: "Политика конфиденциальности",
      updated: `Редакция от ${UPDATED}`,
      intro: `Политика описывает, какие персональные данные собирает ${c.name} (далее — «Оператор») на сайте ${c.site}, зачем и как они обрабатываются. Обработка ведётся в соответствии с Законом Республики Узбекистан «О персональных данных».`,
      sections: [
        {
          h: "1. Какие данные мы собираем",
          p: [
            "При оформлении заказа: имя, телефон, email (по желанию), адрес и время доставки, комментарий к заказу, состав заказа.",
            "При регистрации: имя, телефон, email и пароль (хранится только в зашифрованном виде, Оператор его не видит).",
            "При обращении через форму на сайте: имя, телефон, email (по желанию) и текст сообщения.",
            "Технические данные: IP-адрес и сведения о запросах к сайту, необходимые для его работы и защиты.",
          ],
        },
        {
          h: "2. Зачем мы их используем",
          p: [
            "Чтобы принять, подтвердить и доставить заказ, а также связаться с вами по нему.",
            "Чтобы вести личный кабинет и историю заказов.",
            "Чтобы ответить на ваше обращение.",
            "Чтобы защищать сайт от злоупотреблений.",
            "Мы не используем ваши данные для рекламных рассылок без отдельного согласия и не продаём их.",
          ],
        },
        {
          h: "3. Согласие",
          p: [
            "Оформляя заказ, регистрируясь или отправляя форму на сайте, вы даёте согласие на обработку указанных персональных данных для перечисленных целей.",
            "Вы можете отозвать согласие, написав нам. Если данные нужны для исполнения уже оформленного заказа или по закону, мы удалим их после того, как эти основания отпадут.",
          ],
        },
        {
          h: "4. Хранение и передача",
          p: [
            "Персональные данные граждан Республики Узбекистан хранятся и обрабатываются на серверах, расположенных на территории Республики Узбекистан.",
            "Данные заказа передаются только сотрудникам и курьерам, которые его собирают и доставляют, и только в объёме, необходимом для доставки.",
            "Данные хранятся, пока у вас есть аккаунт или пока это нужно для целей обработки и требований законодательства (в том числе бухгалтерского учёта).",
          ],
        },
        {
          h: "5. Cookie и данные в браузере",
          p: [
            "Сайт использует cookie для входа в личный кабинет и запоминания выбранного языка. Корзина хранится в вашем браузере.",
            "Мы не используем рекламные и сторонние отслеживающие cookie.",
          ],
        },
        {
          h: "6. Ваши права",
          p: [
            "Вы вправе узнать, какие ваши данные мы храним, потребовать их исправления или удаления и отозвать согласие на обработку.",
            `Для этого напишите на ${c.email} или позвоните по номеру ${c.phone}.`,
          ],
        },
        {
          h: "7. Защита данных",
          p: [
            "Мы принимаем организационные и технические меры для защиты данных: шифрованное соединение (HTTPS), хранение паролей в виде хеша, ограничение доступа к данным.",
          ],
        },
        {
          h: "8. Оператор",
          p: [`${c.name}`, `ИНН: ${c.inn}`, `Адрес: ${c.address}`, `Телефон: ${c.phone}`, `Email: ${c.email}`],
        },
      ],
    },
  };
};

const uz = (): Record<LegalDoc, Doc> => {
  const c = company("uz");
  return {
    offer: {
      title: "Ommaviy oferta",
      updated: `${UPDATED} tahriri`,
      intro: `${c.name} (STIR ${c.inn}, keyingi o‘rinlarda — «Sotuvchi») har qanday shaxsga (keyingi o‘rinlarda — «Xaridor») quyidagi shartlar asosida tovarlarni oldi-sotdi shartnomasini tuzishni taklif qiladi. Oferta O‘zbekiston Respublikasi Fuqarolik kodeksining 369-moddasiga muvofiq ommaviy hisoblanadi.`,
      sections: [
        {
          h: "1. Shartnoma predmeti",
          p: [
            "Sotuvchi " + c.site + " saytida taqdim etilgan tovarlarni (makaron mahsulotlarini) Xaridorning mulkiga topshiradi, Xaridor esa ularni qabul qilib, haqini to‘laydi.",
            "Tovarning tavsifi, tarkibi, qadoqlanishi va narxi tovar sahifasida ko‘rsatilgan. Tovar tasvirlari tanishtirish uchun berilgan.",
          ],
        },
        {
          h: "2. Ofertani qabul qilish",
          p: [
            "Saytda buyurtma rasmiylashtirilishi ofertani qabul qilish (aksept) hisoblanadi. Buyurtma rasmiylashtirilgan paytdan boshlab shartnoma tuzilgan hisoblanadi.",
            "Buyurtma berish orqali Xaridor oferta va Maxfiylik siyosati bilan tanishganini va ularga roziligini tasdiqlaydi.",
          ],
        },
        {
          h: "3. Narxlar va buyurtma",
          p: [
            "Narxlar so‘mda ko‘rsatilgan. Buyurtmadagi tovar narxi rasmiylashtirilgan paytda qayd etiladi va keyin o‘zgarmaydi.",
            "Buyurtmadan so‘ng Sotuvchi tasdiqlash uchun Xaridorga ko‘rsatilgan telefon orqali bog‘lanadi. Tovar mavjud bo‘lmasa, Sotuvchi Xaridorni xabardor qilib, buyurtmani rad etishi mumkin.",
          ],
        },
        {
          h: "4. Yetkazib berish va olib ketish",
          p: [
            "Yetkazib berish usullari, muddatlari va narxi «Yetkazib berish va to‘lov» sahifasida hamda buyurtma berishda ko‘rsatiladi. Yakuniy yetkazib berish narxi buyurtma tasdiqlanishidan oldin ko‘rsatiladi.",
            "Olib ketish saytda ko‘rsatilgan manzildagi topshirish punktidan, buyurtma tayyorligi tasdiqlangandan so‘ng amalga oshiriladi.",
            "Tovarning tasodifan nobud bo‘lishi yoki shikastlanishi xavfi tovar topshirilgan paytdan Xaridorga o‘tadi.",
          ],
        },
        {
          h: "5. To‘lov",
          p: [
            "To‘lov buyurtmani qabul qilishda naqd pul yoki bank kartasi (Humo, Uzcard) orqali amalga oshiriladi.",
            "Saytda onlayn to‘lov qabul qilinmaydi. Sotuvchi bank kartasi ma’lumotlarini telefon yoki messenjerlar orqali so‘ramaydi.",
          ],
        },
        {
          h: "6. Qabul qilish, sifat va qaytarish",
          p: [
            "Qabul qilishda Xaridor tovar miqdori, qadoq butunligi va yaroqlilik muddatini tekshiradi.",
            "Agar tovar sifatsiz, qadog‘i shikastlangan yoki buyurtmaga mos kelmasa, Xaridor tovarni almashtirishni yoki to‘langan summani qaytarishni talab qilishga haqli. Buning uchun quyida ko‘rsatilgan telefon yoki email orqali Sotuvchiga murojaat qilish kifoya.",
            "Sifatli oziq-ovqat mahsulotlari, agar O‘zbekiston Respublikasining iste’molchilar huquqlarini himoya qilish to‘g‘risidagi qonunchiligida boshqacha tartib nazarda tutilmagan bo‘lsa, qaytarilmaydi va almashtirilmaydi.",
          ],
        },
        {
          h: "7. Javobgarlik va nizolar",
          p: [
            "Tomonlar O‘zbekiston Respublikasi qonunchiligiga muvofiq javobgar bo‘ladi.",
            "Nizolar muzokaralar yo‘li bilan, kelishuvga erishilmasa — O‘zbekiston Respublikasi qonunchiligiga muvofiq sudda hal qilinadi.",
          ],
        },
        {
          h: "8. Sotuvchi rekvizitlari",
          p: [`${c.name}`, `STIR: ${c.inn}`, `Manzil: ${c.address}`, `Telefon: ${c.phone}`, `Email: ${c.email}`],
        },
      ],
    },
    privacy: {
      title: "Maxfiylik siyosati",
      updated: `${UPDATED} tahriri`,
      intro: `Ushbu siyosat ${c.name} (keyingi o‘rinlarda — «Operator») ${c.site} saytida qanday shaxsiy ma’lumotlarni yig‘ishi, nima uchun va qanday qayta ishlashini tavsiflaydi. Qayta ishlash O‘zbekiston Respublikasining «Shaxsga doir ma’lumotlar to‘g‘risida»gi Qonuniga muvofiq amalga oshiriladi.`,
      sections: [
        {
          h: "1. Qanday ma’lumotlarni yig‘amiz",
          p: [
            "Buyurtma berishda: ism, telefon, email (ixtiyoriy), yetkazib berish manzili va vaqti, izoh, buyurtma tarkibi.",
            "Ro‘yxatdan o‘tishda: ism, telefon, email va parol (faqat shifrlangan holda saqlanadi, Operator uni ko‘rmaydi).",
            "Saytdagi shakl orqali murojaat qilishda: ism, telefon, email (ixtiyoriy) va xabar matni.",
            "Texnik ma’lumotlar: IP-manzil va saytning ishlashi hamda himoyasi uchun zarur bo‘lgan so‘rovlar haqidagi ma’lumotlar.",
          ],
        },
        {
          h: "2. Ulardan nima uchun foydalanamiz",
          p: [
            "Buyurtmani qabul qilish, tasdiqlash va yetkazib berish, shuningdek u bo‘yicha siz bilan bog‘lanish uchun.",
            "Shaxsiy kabinet va buyurtmalar tarixini yuritish uchun.",
            "Murojaatingizga javob berish uchun.",
            "Saytni suiiste’mollardan himoya qilish uchun.",
            "Alohida roziligingizsiz ma’lumotlaringizdan reklama tarqatmalari uchun foydalanmaymiz va ularni sotmaymiz.",
          ],
        },
        {
          h: "3. Rozilik",
          p: [
            "Buyurtma berish, ro‘yxatdan o‘tish yoki saytdagi shaklni yuborish orqali siz ko‘rsatilgan shaxsiy ma’lumotlarni sanab o‘tilgan maqsadlarda qayta ishlashga rozilik berasiz.",
            "Bizga yozib, roziligingizni qaytarib olishingiz mumkin. Agar ma’lumotlar rasmiylashtirilgan buyurtmani bajarish uchun yoki qonun bo‘yicha zarur bo‘lsa, bu asoslar bekor bo‘lgach ularni o‘chiramiz.",
          ],
        },
        {
          h: "4. Saqlash va uzatish",
          p: [
            "O‘zbekiston Respublikasi fuqarolarining shaxsiy ma’lumotlari O‘zbekiston Respublikasi hududida joylashgan serverlarda saqlanadi va qayta ishlanadi.",
            "Buyurtma ma’lumotlari faqat uni yig‘adigan va yetkazib beradigan xodimlar va kuryerlarga, faqat yetkazib berish uchun zarur hajmda uzatiladi.",
            "Ma’lumotlar akkauntingiz mavjud bo‘lgan davrda yoki qayta ishlash maqsadlari va qonunchilik talablari (jumladan, buxgalteriya hisobi) uchun zarur bo‘lgan muddatda saqlanadi.",
          ],
        },
        {
          h: "5. Cookie va brauzerdagi ma’lumotlar",
          p: [
            "Sayt shaxsiy kabinetga kirish va tanlangan tilni eslab qolish uchun cookie fayllardan foydalanadi. Savat brauzeringizda saqlanadi.",
            "Biz reklama va uchinchi tomon kuzatuv cookie fayllaridan foydalanmaymiz.",
          ],
        },
        {
          h: "6. Huquqlaringiz",
          p: [
            "Siz qaysi ma’lumotlaringiz saqlanayotganini bilish, ularni tuzatish yoki o‘chirishni talab qilish hamda qayta ishlashga roziligingizni qaytarib olish huquqiga egasiz.",
            `Buning uchun ${c.email} manziliga yozing yoki ${c.phone} raqamiga qo‘ng‘iroq qiling.`,
          ],
        },
        {
          h: "7. Ma’lumotlarni himoya qilish",
          p: [
            "Ma’lumotlarni himoya qilish uchun tashkiliy va texnik choralar ko‘ramiz: shifrlangan ulanish (HTTPS), parollarni xesh ko‘rinishida saqlash, ma’lumotlarga kirishni cheklash.",
          ],
        },
        {
          h: "8. Operator",
          p: [`${c.name}`, `STIR: ${c.inn}`, `Manzil: ${c.address}`, `Telefon: ${c.phone}`, `Email: ${c.email}`],
        },
      ],
    },
  };
};

export function legalDoc(lang: Lang, doc: LegalDoc): Doc {
  return (lang === "uz" ? uz() : ru())[doc];
}
