export interface Cashback {
    accountId: string;
    transactionId: string;
    amount: number;
}
export interface Refund {
    accountId: string;
    transactionId: string;
    refundAmount: number;
}
