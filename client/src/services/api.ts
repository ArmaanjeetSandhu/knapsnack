import config from "../config";

export type NutrientMap = Record<string, number>;

export interface FoodItem {
  fdcId: string | number;
  description: string;
  nutrients: NutrientMap;
  price?: string | number;
  servingSize?: string | number;
  maxServing?: string | number;
  integerServings?: boolean;
  mustInclude?: boolean;
}

export interface ServiceLimits {
  AGE_MIN: number;
  AGE_MAX: number;
  WEIGHT_MIN: number;
  WEIGHT_MAX: number;
  HEIGHT_MIN: number;
  HEIGHT_MAX: number;
}

export interface ServiceConfig {
  usda_api_configured: boolean;
  limits: ServiceLimits;
}

export interface SearchFoodResponse {
  results: FoodItem[];
}

export interface NutritionCalculationRequest {
  gender: "m" | "f";
  age: number;
  weight: number;
  height: number;
  activity: number;
  percentage: number;
  protein: number;
  carbohydrate: number;
  fats: number;
  smokingStatus: "yes" | "no";
}

export interface NutritionCalculationResponse {
  lower_bounds: NutrientMap;
  upper_bounds: NutrientMap;
  fibre: number;
  saturated_fats: number;
  carbohydrate: number;
  bmr: number;
  tdee: number;
  daily_caloric_intake: number;
  protein: number;
  fats: number;
}

export interface OptimisationRequestPayload {
  selected_foods: Array<{
    fdcId: string | number;
    description: string;
    price: number;
    servingSize: number;
    maxServing: number;
    requires_integer_servings: boolean;
    must_include: boolean;
    nutrients: NutrientMap;
  }>;
  nutrient_goals: NutrientMap;
  age: number;
  gender: string;
  smokingStatus: string;
}

export interface OptimisationApiResult {
  food_items: string[];
  servings: number[];
  overflow_by_nutrient?: Record<string, number>;
  total_overflow?: number;
}

export interface LowerBoundIssue {
  nutrient: string;
  required: number;
  achievable: number;
  shortfallPercentage: number;
}

export interface UpperBoundIssue {
  nutrient: string;
  foodItem: string;
  limit: number;
  minimum: number;
  excessPercentage: number;
}

export interface FeasibilityAnalysis {
  isLowerBoundsFeasible: boolean;
  isUpperBoundsFeasible: boolean;
  isFeasible?: boolean;
  lowerBoundIssues: LowerBoundIssue[];
  upperBoundIssues: UpperBoundIssue[];
}

export interface OptimisationSuccess {
  success: true;
  result: OptimisationApiResult;
}

export interface OptimisationFailure {
  success: false;
  message: string;
  feasibilityAnalysis: FeasibilityAnalysis;
}

export type OptimisationResponse = OptimisationSuccess | OptimisationFailure;

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  content?: unknown;
}

export interface MacroRatios {
  protein: number;
  carbohydrate: number;
  fats: number;
}

export interface UserInfo {
  gender: "m" | "f";
  age: number;
  weight: number;
  height: number;
  activity: number;
  percentage: number;
  macroRatios: MacroRatios;
  smokingStatus: "yes" | "no";
}

async function extractError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return data.error ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}

const api = {
  async getServiceConfig(): Promise<ServiceConfig | null> {
    const response = await fetch(`${config.apiUrl}/config`);
    if (!response.ok) {
      console.warn("Failed to fetch server config");
      return null;
    }
    return response.json() as Promise<ServiceConfig>;
  },

  async searchFood(query: string, apiKey: string): Promise<SearchFoodResponse> {
    const response = await fetch(`${config.apiUrl}/search_food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, api_key: apiKey }),
    });
    if (!response.ok) {
      throw new Error(await extractError(response, "Search failed"));
    }
    return response.json() as Promise<SearchFoodResponse>;
  },

  async calculateNutrition(
    data: NutritionCalculationRequest,
  ): Promise<NutritionCalculationResponse> {
    const response = await fetch(`${config.apiUrl}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractError(response, "Calculation failed"));
    }
    return response.json() as Promise<NutritionCalculationResponse>;
  },

  async optimiseDiet(
    data: OptimisationRequestPayload,
  ): Promise<OptimisationResponse> {
    const response = await fetch(`${config.apiUrl}/optimise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = (await response.json()) as OptimisationResponse & {
      error?: string;
    };

    if (!response.ok || !result.success) {
      if ((result as OptimisationFailure).feasibilityAnalysis) {
        return {
          success: false,
          message:
            (result as { message?: string }).message ?? "Optimisation failed",
          feasibilityAnalysis: (result as OptimisationFailure)
            .feasibilityAnalysis,
        };
      }
      throw new Error(
        (result as { error?: string }).error ??
          (result as { message?: string }).message ??
          "Optimisation failed",
      );
    }

    return result;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    const response = await fetch(`${config.apiUrl}/posts`);
    if (!response.ok) throw new Error("Failed to fetch blog posts");
    return response.json() as Promise<BlogPost[]>;
  },

  async getBlogPost(slug: string): Promise<BlogPost> {
    const response = await fetch(`${config.apiUrl}/posts/${slug}`);
    if (!response.ok) {
      throw new Error(
        await extractError(response, `Failed to fetch post: ${slug}`),
      );
    }
    return response.json() as Promise<BlogPost>;
  },
};

export default api;
