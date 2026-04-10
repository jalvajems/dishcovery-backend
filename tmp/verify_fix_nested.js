
const testFoodieLogic = (obj) => {
    try {
        const result = {
            bookingId: (obj.bookingId
                ? typeof obj.bookingId === "object" && obj.bookingId !== null && "_id" in obj.bookingId
                    ? {
                        _id: String(obj.bookingId._id),
                        foodieId: typeof obj.bookingId.foodieId === "object" && obj.bookingId.foodieId !== null && "_id" in obj.bookingId.foodieId
                            ? { _id: String(obj.bookingId.foodieId._id) }
                            : String(obj.bookingId.foodieId)
                    }
                    : String(obj.bookingId)
                : undefined)
        };
        console.log("Success with obj:", JSON.stringify(obj), "Result:", JSON.stringify(result));
    } catch (error) {
        console.error("Failed with obj:", JSON.stringify(obj), "Error:", error.message);
    }
};

console.log("Testing nested null foodieId...");
testFoodieLogic({ bookingId: { _id: "b1", foodieId: null } });

console.log("\nTesting nested valid foodieId...");
testFoodieLogic({ bookingId: { _id: "b1", foodieId: { _id: "f1" } } });

console.log("\nTesting deleted bookingId (string)...");
testFoodieLogic({ bookingId: "b1" });
