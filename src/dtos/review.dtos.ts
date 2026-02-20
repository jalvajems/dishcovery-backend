export interface ICreateReviewDto {
    reviewableId: string;
    reviewableType: 'Recipe' | 'Blog' | 'Workshop' | 'FoodSpot' | 'Chef';
    rating: number;
    reviewText: string;
}
