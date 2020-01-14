import { APIGatewayProxyHandler } from "aws-lambda";
import { createDynamoDataMapper } from "./dynamodb";
import { DynamoDBRepository } from "./repository";
export const handler: APIGatewayProxyHandler = async (_event, _context) => {
    const dataMapper = createDynamoDataMapper();
    const repository = new DynamoDBRepository(dataMapper);

    await repository.saveCashback({
        accountId: "123",
        transactionId: "2345",
        amount: 10,
    });
    await repository.saveRefund({
        accountId: "123",
        transactionId: "2345:refund",
        refundAmount: 10,
    });
    const [cashbacks, refunds] = await repository.queryByTransactionId(
        "123",
        "2345"
    );

    await repository.save();

    return {
        statusCode: 200,
        body: JSON.stringify({ cashbacks, refunds }),
    };
};
