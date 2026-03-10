export interface ICreateReviewDto {
    reviewableId: string;
    reviewableType: 'Recipe' | 'Blog' | 'Workshop' | 'FoodSpot' | 'Chef';
    rating: number;
    reviewText: string;
}

export interface IReviewDto {
    id?: string;
    _id?: string;
     
    userId: string | { _id: string; name: string; avatar?: string;[key: string]: unknown };
    reviewableId: string;
    reviewableType: 'Recipe' | 'Blog' | 'Workshop' | 'FoodSpot' | 'Chef';
    rating: number;
    reviewText: string;
    likes: string[];
    dislikes: string[];
    createdAt: Date;
    updatedAt: Date;
}
