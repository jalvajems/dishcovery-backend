export interface ICreateReviewDto {
    reviewableId: string;
    reviewableType: 'Recipe' | 'Blog' | 'Workshop' | 'FoodSpot' | 'Chef';
    rating: number;
    reviewText: string;
}

export interface IReviewDto {
    id: string;
    userId: string;
    reviewableId: string;
    reviewableType: 'Recipe' | 'Blog' | 'Workshop' | 'FoodSpot' | 'Chef';
    rating: number;
    reviewText: string;
    likes: string[];
    dislikes: string[];
    createdAt: Date;
    updatedAt: Date;
}
