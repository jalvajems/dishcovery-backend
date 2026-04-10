
const testMapperLogic = (obj) => {
    try {
        const result = {
            userId: (obj.userId
                ? typeof obj.userId === "object" && obj.userId !== null && "_id" in obj.userId
                    ? {
                        _id: String(obj.userId._id),
                        name: String(obj.userId.name)
                    }
                    : String(obj.userId)
                : undefined)
        };
        console.log("Success with obj:", obj, "Result:", result);
    } catch (error) {
        console.error("Failed with obj:", obj, "Error:", error.message);
    }
};

console.log("Testing with null userId...");
testMapperLogic({ userId: null });

console.log("\nTesting with valid userId object...");
testMapperLogic({ userId: { _id: "123", name: "Test User" } });

console.log("\nTesting with userId string...");
testMapperLogic({ userId: "some_id" });

console.log("\nTesting with undefined userId...");
testMapperLogic({ userId: undefined });
