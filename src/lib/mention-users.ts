export interface MentionUser {
  avatarUrl: string;
  id: string;
  name: string;
  username: string;
}

const mentionUserSeeds = [
  { name: "佐藤 葵", username: "aoi.sato" },
  { name: "鈴木 蓮", username: "ren.suzuki" },
  { name: "高橋 美咲", username: "misaki.takahashi" },
  { name: "田中 陽翔", username: "haruto.tanaka" },
  { name: "伊藤 結衣", username: "yui.ito" },
  { name: "渡辺 湊", username: "minato.watanabe" },
  { name: "山本 凛", username: "rin.yamamoto" },
  { name: "中村 大和", username: "yamato.nakamura" },
  { name: "小林 紬", username: "tsumugi.kobayashi" },
  { name: "加藤 悠真", username: "yuma.kato" },
  { name: "吉田 莉子", username: "riko.yoshida" },
  { name: "山田 蒼", username: "ao.yamada" },
  { name: "佐々木 芽依", username: "mei.sasaki" },
  { name: "山口 新", username: "arata.yamaguchi" },
  { name: "松本 杏", username: "ann.matsumoto" },
  { name: "井上 陸", username: "riku.inoue" },
  { name: "木村 詩", username: "uta.kimura" },
  { name: "林 碧", username: "midori.hayashi" },
  { name: "清水 颯太", username: "sota.shimizu" },
  { name: "斎藤 花", username: "hana.saito" },
  { name: "山崎 朔", username: "saku.yamazaki" },
  { name: "森 七海", username: "nanami.mori" },
  { name: "池田 結月", username: "yuzuki.ikeda" },
  { name: "橋本 伊織", username: "iori.hashimoto" },
  { name: "阿部 玲奈", username: "reina.abe" },
  { name: "石川 旭", username: "asahi.ishikawa" },
  { name: "山下 ひなた", username: "hinata.yamashita" },
  { name: "中島 奏", username: "kanade.nakajima" },
  { name: "前田 澪", username: "mio.maeda" },
  { name: "藤田 悠", username: "yu.fujita" },
  { name: "岡田 柚希", username: "yuzuki.okada" },
  { name: "後藤 玲", username: "rei.goto" },
  { name: "長谷川 千尋", username: "chihiro.hasegawa" },
  { name: "村上 怜", username: "ryo.murakami" },
  { name: "近藤 咲良", username: "sakura.kondo" },
  { name: "石井 晴", username: "haru.ishii" },
  { name: "坂本 透", username: "toru.sakamoto" },
  { name: "遠藤 心春", username: "koharu.endo" },
  { name: "青木 翔", username: "sho.aoki" },
  { name: "藤井 すみれ", username: "sumire.fujii" },
  { name: "西村 樹", username: "itsuki.nishimura" },
  { name: "福田 彩葉", username: "iroha.fukuda" },
  { name: "太田 陽菜", username: "hina.ota" },
  { name: "三浦 快", username: "kai.miura" },
  { name: "岡本 真央", username: "mao.okamoto" },
  { name: "松田 翠", username: "sui.matsuda" },
  { name: "中川 怜央", username: "reo.nakagawa" },
  { name: "中野 栞", username: "shiori.nakano" },
  { name: "原田 蒼空", username: "sora.harada" },
  { name: "小川 琴音", username: "kotone.ogawa" },
  { name: "竹内 葵", username: "aoi.takeuchi" },
  { name: "和田 蓮", username: "ren.wada" },
  { name: "金子 美咲", username: "misaki.kaneko" },
  { name: "上田 湊", username: "minato.ueda" },
  { name: "工藤 凛", username: "rin.kudo" },
  { name: "横山 大和", username: "yamato.yokoyama" },
  { name: "柴田 紬", username: "tsumugi.shibata" },
  { name: "酒井 悠真", username: "yuma.sakai" },
  { name: "宮崎 莉子", username: "riko.miyazaki" },
  { name: "内田 蒼", username: "ao.uchida" },
] satisfies Array<{ name: string; username: string }>;

function getDummyAvatarUrl(username: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;
}

export const mentionUsers: MentionUser[] = mentionUserSeeds.map(
  (user, index) => {
    return {
      avatarUrl: getDummyAvatarUrl(user.username),
      id: `user_${String(index + 1).padStart(3, "0")}`,
      name: user.name,
      username: user.username,
    };
  },
);

function shuffle<T>(items: T[]): T[] {
  const results = [...items];

  for (let index = results.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = results[index];
    const random = results[randomIndex];

    if (!current || !random) continue;

    results[index] = random;
    results[randomIndex] = current;
  }

  return results;
}

export function getRandomMentionUsers(limit = 50): MentionUser[] {
  return shuffle(mentionUsers).slice(0, limit);
}
