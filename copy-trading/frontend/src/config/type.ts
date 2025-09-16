export type CardDetails = {
    asset: string;
    QHead: string;
    QBody: string;
    winProb: number;
    lossProb: number;
    category: string;
    expireTime: string;
    totalBets: number;
    yesPrice: number;
    noPrice: number;
    maxQuantity: number;
  };

  export type Market = {
    marketId: number;
    questionId: string;
    question: string;
    endTime: string;
    yesVotes: number;
    noVotes: number;
    totalPool: number;
    yesPrice: number;
    noPrice: number;
    imageUrl: string;
    category: string;
  }
  

  export type BuyOptionType = {
    marketId: number,
    optionId: number,
    amountPex: number
  }

  export type DepositConfig = {
    amountStable : number,
    userAddress: string
  }

  export type WithdrawConfig ={
    stableAddress: string,
    amountPex: string
  }

  