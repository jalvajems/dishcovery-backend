export interface IDashboardStats {
    totalUsers: number;
    totalChefs: number;
    totalRecipes: number;
    totalWorkshops: number;
    totalFoodSpots: number;
}

export interface IGrowthData {
    recipeGrowth: {
        week: string;
        count: number;
    }[];
    workshopGrowth: {
        week: string;
        count: number;
    }[];
    foodSpotGrowth: {
        week: string;
        count: number;
    }[];
}
