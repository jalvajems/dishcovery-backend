import { IReviewDto } from "../../dtos/review.dtos";
import { IReviewDocument } from "../../models/review.model";

export function reviewMapper(review: IReviewDocument): IReviewDto {
    const obj = review.toObject ? review.toObject() : review;

    let mappedUserId: any = obj.userId?.toString();
    if (typeof obj.userId === 'object' && obj.userId !== null && '_id' in obj.userId) {
        mappedUserId = {
            _id: (obj.userId as any)._id.toString(),
            name: (obj.userId as any).name || "User",
            avatar: (obj.userId as any).profilePicture || ""
        };
    }

    return {
        id: (obj._id || obj.id).toString(),
        _id: (obj._id || obj.id).toString(),
        userId: mappedUserId,
        reviewableId: obj.reviewableId?.toString(),
        reviewableType: obj.reviewableType,
        rating: obj.rating,
        reviewText: obj.reviewText,
        likes: obj.likes?.map((id: any) => id.toString()) || [],
        dislikes: obj.dislikes?.map((id: any) => id.toString()) || [],
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

export function allReviewsMapper(reviews: IReviewDocument[]): IReviewDto[] {
    return reviews.map(review => reviewMapper(review));
}
