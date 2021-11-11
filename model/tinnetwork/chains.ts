export type TinChain = {
  "id": string; // "aabeea9c-5390-4868-98ac-5e4ad5eb36ea",
  "isActive": boolean; // true,
  "createdAt": string; // "2021-05-25T16:29:36.354Z",
  "typeId": string; // "evm",
  "chainId": number; // 1,
  "name": string; // "Ethereum",
  "icon": string; // "1",
  "color": string; // "#607eea",
  "explorerUrl": string; // "http://etherscan.io/"
};

export type TinChainsResponse = {
  statusCode: number; // 200,
  message: string; // 'Done!',
  data: TinChain[]
}