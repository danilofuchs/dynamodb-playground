import { DataMapper } from "@aws/dynamodb-data-mapper";
import {
    table,
    rangeKey,
    hashKey,
    attribute,
} from "@aws/dynamodb-data-mapper-annotations";
import { Cashback, Refund } from "./domain";
import { DynamoDB } from "aws-sdk";

export class DynamoDBRepository {
    constructor(private mapper: DataMapper) {}

    async saveCashback(cashback: Cashback): Promise<Cashback> {
        const entity = Object.assign(
            new CashbackEntity(),
            this.cashbackToEntity(cashback)
        );
        const savedEntity = await this.mapper.put(entity);
        return this.cashbackToDomain(savedEntity);
    }

    async saveRefund(refund: Refund): Promise<Refund> {
        const entity = Object.assign(
            new RefundEntity(),
            this.refundToEntity(refund)
        );
        const savedEntity = await this.mapper.put(entity);
        return this.refundToDomain(savedEntity);
    }

    async save(): Promise<void> {
        const dynamo = new DynamoDB.DocumentClient({
            endpoint: "http://localhost:8000",
        });
        await dynamo
            .transactWrite({
                TransactItems: [
                    {
                        Put: {
                            TableName: "dynamodb-playground-dev-test",
                            Item: {
                                pk1: "asdasdasd",
                                sk1: "kjvghdfsjhvgdf",
                            },
                        },
                    },
                    {
                        Put: {
                            TableName: "dynamodb-playground-dev-test",
                            Item: {
                                pk1: "213i7esufi",
                                sk1: "kjvghdfsjhasgdsvjhgasdvvgdf",
                            },
                        },
                    },
                ],
            })
            .promise();
    }

    async queryByTransactionId(
        accountId: string,
        transactionId: string
    ): Promise<readonly [Cashback[], Refund[]]> {
        const dynamo = new DynamoDB.DocumentClient({
            endpoint: "http://localhost:8000",
        });
        const results = await dynamo
            .query({
                TableName: "dynamodb-playground-dev-test",
                KeyConditionExpression: "pk1 = :pk and begins_with(sk1, :sk)",
                ExpressionAttributeValues: {
                    ":pk": accountId,
                    ":sk": transactionId,
                },
            })
            .promise();

        const refunds: Refund[] = [];
        const cashbacks: Cashback[] = [];
        results.Items?.forEach((item) => {
            if (item.sk1.includes("refund")) {
                refunds.push(this.refundToDomain(item as RefundEntity));
            } else {
                cashbacks.push(this.cashbackToDomain(item as CashbackEntity));
            }
        });
        return [cashbacks, refunds] as const;
    }

    private cashbackToDomain(entity: CashbackEntity): Cashback {
        return entity;
    }

    private cashbackToEntity(domain: Cashback): CashbackEntity {
        return { ...domain, pk1: domain.accountId, sk1: domain.transactionId };
    }

    private refundToDomain(entity: RefundEntity): Refund {
        return entity;
    }

    private refundToEntity(domain: Refund): RefundEntity {
        return { ...domain, pk1: domain.accountId, sk1: domain.transactionId };
    }
}

abstract class BaseEntity {
    @hashKey()
    pk1!: string;

    @rangeKey()
    sk1!: string;
}

@table("test")
class CashbackEntity extends BaseEntity {
    @attribute()
    accountId!: string;

    @attribute()
    transactionId!: string;

    @attribute()
    amount!: number;
}

@table("test")
class RefundEntity extends BaseEntity {
    @attribute()
    accountId!: string;

    @attribute()
    transactionId!: string;

    @attribute()
    refundAmount!: number;
}
