import { DataMapper } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk/clients/all";

export const createDynamoDataMapper = (): DataMapper => {
    return new DataMapper({
        client: process.env.IS_OFFLINE
            ? new DynamoDB({ endpoint: "http://localhost:8000" })
            : new DynamoDB({ region: process.env.region || "us-east-1" }),
        tableNamePrefix: `dynamodb-playground-${process.env.stage || "-dev"}-`,
    });
};
