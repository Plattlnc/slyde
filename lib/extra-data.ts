// 팀원 slydeV3.html에서 가져온 샘플 데이터 (협력사/주유소/차량/맛집/랭킹)

// ── 우리지역 협력사 ──────────────────────────────
export type Partner = {
  name: string;
  sido: string;
  gu: string;
  addr: string;
  riders: number;
  daily: string;
  accept: string;
  feat: boolean;
  hiring: boolean;
  desc: string;
  promos: { i: string; t: string }[];
};

export const PT_REGIONS: Record<string, string[]> = {
  서울: ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
  인천: ["중구","동구","미추홀구","연수구","남동구","부평구","계양구","서구","강화군","옹진군"],
  경기: ["수원시","성남시","고양시","용인시","부천시","안산시","안양시","남양주시","화성시","평택시","의정부시","시흥시","김포시","광명시","군포시","이천시","오산시","하남시","파주시"],
  부산: ["중구","서구","동구","영도구","부산진구","동래구","남구","북구","해운대구","사하구","금정구","강서구","연제구","수영구","사상구","기장군"],
  대구: ["중구","동구","서구","남구","북구","수성구","달서구","달성군"],
  대전: ["동구","중구","서구","유성구","대덕구"],
  광주: ["동구","서구","남구","북구","광산구"],
  울산: ["중구","남구","동구","북구","울주군"],
  세종: ["세종시"],
  강원: ["춘천시","원주시","강릉시","동해시","속초시","삼척시","태백시","홍천군","평창군"],
  충북: ["청주시","충주시","제천시","음성군","진천군","옥천군"],
  충남: ["천안시","아산시","서산시","당진시","논산시","공주시","보령시","홍성군"],
  전북: ["전주시","익산시","군산시","정읍시","남원시","김제시","완주군"],
  전남: ["목포시","여수시","순천시","나주시","광양시","무안군","해남군"],
  경북: ["포항시","경주시","구미시","경산시","안동시","김천시","영주시","칠곡군"],
  경남: ["창원시","김해시","진주시","양산시","거제시","통영시","사천시","밀양시"],
  제주: ["제주시","서귀포시"],
};

export const PARTNERS: Partner[] = [
  { name:"인천서구센터", sido:"인천", gu:"서구", addr:"인천 서구 가정로 (가정동)", riders:227, daily:"2,400", accept:"88%", feat:true, hiring:false, desc:"배민 인천서구 지역 직영 협력사. 일 평균 2,400콜의 안정적인 물량과 체계적인 배차로 라이더 수익을 극대화합니다.", promos:[{i:"💰",t:"신규 라이더 첫 달 수수료 0% · 정착지원금 30만원"},{i:"⛽",t:"주 100건 이상 시 주유비 월 10만원 지원"},{i:"🛡️",t:"단체상해보험 전원 가입"}] },
  { name:"인천검단센터", sido:"인천", gu:"서구", addr:"인천 서구 검단로 (당하동)", riders:84, daily:"950", accept:"86%", feat:false, hiring:true, desc:"검단신도시 전담 협력사. 신도시 배후 수요로 단거리 콜 비중이 높아 효율적인 운행이 가능합니다.", promos:[{i:"🎁",t:"입사 시 배달가방·우비 무상 지급"},{i:"📈",t:"단거리 콜 건당 추가 프로모션 운영"}] },
  { name:"인천부평센터", sido:"인천", gu:"부평구", addr:"인천 부평구 부평대로 (부평동)", riders:156, daily:"1,800", accept:"85%", feat:false, hiring:true, desc:"부평역 상권 중심의 도심형 협력사. 음식점 밀집 지역으로 피크타임 물량이 풍부합니다.", promos:[{i:"🌙",t:"심야 피크 건당 +500원 야간 수당"},{i:"🅿️",t:"센터 무료 주차·휴게실 24시간"}] },
  { name:"서울강서센터", sido:"서울", gu:"강서구", addr:"서울 강서구 화곡로 (화곡동)", riders:198, daily:"2,100", accept:"87%", feat:false, hiring:false, desc:"강서·마곡 지구 전담. 대단지 아파트와 오피스 상권이 공존해 시간대별 물량이 고른 편입니다.", promos:[{i:"💰",t:"전월 대비 콜 상승 시 인센티브 지급"},{i:"🍱",t:"라이더 점심 도시락 제휴 할인"}] },
  { name:"경기부천센터", sido:"경기", gu:"부천시", addr:"경기 부천시 길주로 (중동)", riders:142, daily:"1,650", accept:"84%", feat:false, hiring:true, desc:"부천 중동·상동 상권 전담 협력사. 수도권 서부 핵심 배달 거점입니다.", promos:[{i:"🎁",t:"신규 등록 웰컴 보너스 20만원"},{i:"🔧",t:"제휴 정비소 정비비 20% 할인"}] },
  { name:"부산해운대센터", sido:"부산", gu:"해운대구", addr:"부산 해운대구 중동 일대", riders:171, daily:"1,900", accept:"86%", feat:false, hiring:false, desc:"해운대·센텀시티 전담. 관광·상업 지구 특성상 주말·성수기 물량이 강세입니다.", promos:[{i:"🏖️",t:"성수기 주말 특별 프로모션 운영"},{i:"⛽",t:"제휴 주유소 리터당 할인"}] },
];

// ── 주유소 ──────────────────────────────
export type GasStation = {
  name: string; brand: string; ico: string;
  gasoline: number; diesel: number; dist: number;
};
export const GAS_STATIONS: GasStation[] = [
  { name:"청라셀프주유소", brand:"알뜰", ico:"🟡", gasoline:1612, diesel:1498, dist:0.5 },
  { name:"가정현대오일뱅크", brand:"현대오일뱅크", ico:"🔵", gasoline:1648, diesel:1532, dist:0.8 },
  { name:"GS칼텍스 서구점", brand:"GS칼텍스", ico:"🟢", gasoline:1659, diesel:1545, dist:1.1 },
  { name:"S-OIL 가정주유소", brand:"S-OIL", ico:"🟠", gasoline:1635, diesel:1521, dist:1.4 },
  { name:"SK에너지 청라점", brand:"SK에너지", ico:"🔴", gasoline:1671, diesel:1559, dist:1.9 },
  { name:"경인고속주유소", brand:"알뜰", ico:"🟡", gasoline:1599, diesel:1485, dist:2.6 },
];

// ── 신차/중고차 ──────────────────────────────
export type Car = {
  cond: "new" | "used"; name: string; year: number; km: number;
  price: number; monthly: number; tags: string; deal: string; ico: string;
};
export const CARS: Car[] = [
  { cond:"new", name:"혼다 PCX 125", year:2026, km:0, price:438, monthly:18, tags:"배달 인기 1위", deal:"즉시출고", ico:"🛵" },
  { cond:"new", name:"야마하 NMAX 125", year:2026, km:0, price:472, monthly:20, tags:"고속 안정성", deal:"", ico:"🛵" },
  { cond:"new", name:"혼다 비전 110", year:2026, km:0, price:298, monthly:13, tags:"가성비 배달용", deal:"특가", ico:"🛵" },
  { cond:"new", name:"대림 Q2 125 (전동)", year:2026, km:0, price:359, monthly:15, tags:"전동·보조금 가능", deal:"", ico:"⚡" },
  { cond:"used", name:"혼다 PCX 125", year:2023, km:18400, price:268, monthly:0, tags:"무사고", deal:"", ico:"🛵" },
  { cond:"used", name:"혼다 비전 110", year:2022, km:31200, price:152, monthly:0, tags:"정비이력 완비", deal:"급매", ico:"🛵" },
  { cond:"used", name:"야마하 NMAX 125", year:2024, km:9800, price:355, monthly:0, tags:"실주행 1만 미만", deal:"", ico:"🛵" },
  { cond:"used", name:"대림 시티 100", year:2021, km:42600, price:88, monthly:0, tags:"입문용", deal:"급매", ico:"🛵" },
];

// ── 맛집 ──────────────────────────────
export type Food = {
  name: string; cat: string; ico: string;
  rate: number; review: number; dist: number; open: boolean; menu: string;
};
export const FOOD_CATS = ["전체", "한식", "중식", "일식", "양식", "카페"];
export const FOODS: Food[] = [
  { name:"가정동밥집", cat:"한식", ico:"🍚", rate:4.8, review:1240, dist:0.3, open:true, menu:"제육볶음·김치찌개" },
  { name:"청라손칼국수", cat:"한식", ico:"🍜", rate:4.6, review:870, dist:0.7, open:true, menu:"바지락칼국수" },
  { name:"북경반점", cat:"중식", ico:"🥡", rate:4.7, review:1532, dist:0.5, open:true, menu:"짜장면·탕수육" },
  { name:"홍콩반점0410", cat:"중식", ico:"🍜", rate:4.4, review:642, dist:1.2, open:false, menu:"짬뽕" },
  { name:"스시혼", cat:"일식", ico:"🍣", rate:4.9, review:980, dist:0.9, open:true, menu:"초밥 모둠" },
  { name:"분식왕떡볶이", cat:"일식", ico:"🍢", rate:4.5, review:2104, dist:0.4, open:true, menu:"로제떡볶이·튀김" },
  { name:"화덕피자가정점", cat:"양식", ico:"🍕", rate:4.6, review:733, dist:1.6, open:true, menu:"마르게리타" },
  { name:"버거인더하우스", cat:"양식", ico:"🍔", rate:4.3, review:418, dist:2.1, open:true, menu:"수제버거 세트" },
  { name:"카페모카타임", cat:"카페", ico:"☕", rate:4.7, review:560, dist:0.6, open:true, menu:"아메리카노·라떼" },
  { name:"디저트하우스", cat:"카페", ico:"🍰", rate:4.5, review:392, dist:1.0, open:false, menu:"수제 케이크" },
];

// ── 랭킹 ──────────────────────────────
export type Ranker = {
  name: string; center: string; ico: string; cnt: number; move: number; me?: boolean;
};
export const RANK_DATA: Record<"week" | "month" | "total", Ranker[]> = {
  week: [
    { name:"질주왕", center:"인천부평센터", ico:"🏍️", cnt:412, move:0 },
    { name:"번개라이더", center:"인천서구센터", ico:"⚡", cnt:398, move:1 },
    { name:"무사고킹", center:"서울강서센터", ico:"🛡️", cnt:375, move:-1 },
    { name:"폭주기관차", center:"경기부천센터", ico:"🚀", cnt:341, move:2 },
    { name:"바람돌이", center:"인천서구센터", ico:"🌪️", cnt:327, move:0 },
    { name:"환타", center:"인천서구센터", ico:"🛵", cnt:289, move:3, me:true },
    { name:"안전제일", center:"부산해운대센터", ico:"🦺", cnt:271, move:-2 },
    { name:"달리는짜장", center:"인천검단센터", ico:"🥡", cnt:255, move:1 },
    { name:"심야의제왕", center:"인천부평센터", ico:"🌙", cnt:240, move:0 },
    { name:"라이더정석", center:"서울강서센터", ico:"📘", cnt:228, move:-1 },
  ],
  month: [
    { name:"번개라이더", center:"인천서구센터", ico:"⚡", cnt:1685, move:1 },
    { name:"질주왕", center:"인천부평센터", ico:"🏍️", cnt:1640, move:-1 },
    { name:"폭주기관차", center:"경기부천센터", ico:"🚀", cnt:1521, move:2 },
    { name:"무사고킹", center:"서울강서센터", ico:"🛡️", cnt:1498, move:0 },
    { name:"환타", center:"인천서구센터", ico:"🛵", cnt:1342, move:2, me:true },
    { name:"바람돌이", center:"인천서구센터", ico:"🌪️", cnt:1310, move:-1 },
    { name:"심야의제왕", center:"인천부평센터", ico:"🌙", cnt:1188, move:1 },
    { name:"안전제일", center:"부산해운대센터", ico:"🦺", cnt:1102, move:-2 },
    { name:"달리는짜장", center:"인천검단센터", ico:"🥡", cnt:1024, move:0 },
    { name:"라이더정석", center:"서울강서센터", ico:"📘", cnt:998, move:1 },
  ],
  total: [
    { name:"무사고킹", center:"서울강서센터", ico:"🛡️", cnt:18420, move:0 },
    { name:"번개라이더", center:"인천서구센터", ico:"⚡", cnt:17985, move:0 },
    { name:"질주왕", center:"인천부평센터", ico:"🏍️", cnt:16740, move:1 },
    { name:"바람돌이", center:"인천서구센터", ico:"🌪️", cnt:15210, move:-1 },
    { name:"폭주기관차", center:"경기부천센터", ico:"🚀", cnt:14880, move:0 },
    { name:"안전제일", center:"부산해운대센터", ico:"🦺", cnt:13150, move:0 },
    { name:"환타", center:"인천서구센터", ico:"🛵", cnt:12420, move:1, me:true },
    { name:"심야의제왕", center:"인천부평센터", ico:"🌙", cnt:11880, move:-1 },
    { name:"라이더정석", center:"서울강서센터", ico:"📘", cnt:10240, move:0 },
    { name:"달리는짜장", center:"인천검단센터", ico:"🥡", cnt:9860, move:0 },
  ],
};
