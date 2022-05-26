export type TinFarm = {
  name: string; // 'Pancakebunny',
  shortName: string; // 'pancakebunny',
  description: string; // null,
  url: string; // 'https://pancakebunny.finance/',
  icon: string; //'pancakebunny',
  color: null,
  chainIds: number[],
  tvl: number; //null,
  audit: boolean; // true,
  auditUrl: string; // 'https://github.com/PancakeBunny-finance/Bunny/blob/main/audits/[HAECHI%20AUDIT]%20PancakeBunny%20Smart%20Contract%20Audit%20Report%20ver%202.0.pdf',
  rugpull: null, // ?
  insurance: null // ?
};

export type TinFarmsResponse = {
  statusCode: number; // 200,
  message: string; // 'Done!',
  data: TinFarm[]
}