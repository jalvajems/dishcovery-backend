import { IReviewDto } from "../../dtos/review.dtos";
import { IReviewDocument } from "../../models/review.model";

export function reviewMapper(review: IReviewDocument): IReviewDto {
    const obj = review.toObject ? review.toObject() : review;

    let mappedUserId: unknown = obj.userId?.toString();
    if (typeof obj.userId === 'object' && obj.userId !== null && '_id' in obj.userId) {
        mappedUserId = {
            _id: String((obj.userId as Record<string, unknown>)._id),
            name: String((obj.userId as Record<string, unknown>).name || "User"),
            foodieProfile: (obj.userId as Record<string, unknown>).foodieProfile || ""
        };
    }

    return {
        id: (obj._id || obj.id).toString(),
        _id: (obj._id || obj.id).toString(),
        userId: mappedUserId as never,
        reviewableId: obj.reviewableId?.toString(),
        reviewableType: obj.reviewableType,
        rating: obj.rating,
        reviewText: obj.reviewText,
        likes: (obj.likes as unknown[])?.map((id: unknown) => String(id)) || [],
        dislikes: (obj.dislikes as unknown[])?.map((id: unknown) => String(id)) || [],
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

export function allReviewsMapper(reviews: IReviewDocument[]): IReviewDto[] {
    return reviews.map(review => reviewMapper(review));
}
