export class ProviderRatingResponseDto {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number; // 1: count, 2: count, etc.
  };
} 