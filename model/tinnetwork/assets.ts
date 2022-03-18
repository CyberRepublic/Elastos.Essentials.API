export type TinAsset = {
  id: string; // '20ce04ee-441a-469d-aaae-d66b93772c20',
  name: string; //'Glide',
  shortName: string; //'glide',
  url: string; //'https://glidefinance.io/',
  icon: string; //'glide',
  chainIds: number[],
  twitter: string; // 'GlideFinance',
  rugdoc: null, // ?
  rugpull: null, // ?
  insurance: null, // ?
  feature: boolean, // ?
  pools: [],  // ?
  amountPrice: number; // 6493.844381977916,
  pendingPrice: number; // 0, // ?
  borrowPrice: number; // 0, // ?
  wallet: string;
};

export type TinAssetsResponse = {
  statusCode: 200;
  message: 'Done!';
  data: TinAsset | TinAsset[];
};

/**
 * Data returned by our stake api with less information than we get from TIN.
 */
export type SummarizedStakedAssets = {
  farmName: string;
  farmShortName: string;
  amountUSD: number;
  lastUpdated: number; // Timestamp
  farmUrl: string;
  farmIconUrl: string;
}