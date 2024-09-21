import helper_functions as hf


def bmr(gender, weight, height, age):
    """Calculate Basal Metabolic Rate using the Mifflin-St Jeor Equation."""
    if gender.lower() == "m":
        return 10 * weight + 6.25 * height - 5 * age + 5
    elif gender.lower() == "f":
        return 10 * weight + 6.25 * height - 5 * age - 161


def tdee(bmr, activity_multiplier):
    """Calculate Total Daily Energy Expenditure."""
    return int(bmr * activity_multiplier)


def macros(daily_caloric_intake, goal):
    """Calculate daily intake of protein, carbohydrates, and fats based on the goal."""
    if goal == "cutting":
        protein = int(0.40 * daily_caloric_intake / 4)
        carbohydrates = int(0.40 * daily_caloric_intake / 4)
        fats = int(0.20 * daily_caloric_intake / 9)
    elif goal == "bulking":
        protein = int(0.25 * daily_caloric_intake / 4)
        carbohydrates = int(0.55 * daily_caloric_intake / 4)
        fats = int(0.20 * daily_caloric_intake / 9)
    elif goal == "maintaining":
        protein = int(0.30 * daily_caloric_intake / 4)
        carbohydrates = int(0.45 * daily_caloric_intake / 4)
        fats = int(0.25 * daily_caloric_intake / 9)

    fibre = int(0.014 * daily_caloric_intake)
    saturated_fats = int(0.10 * daily_caloric_intake / 9)

    return protein, carbohydrates, fats, fibre, saturated_fats


def nutrient_bounds(age, gender):
    """Get the RDA and UL for each nutrient based on age and gender."""
    nutrients_data = hf.create_nutrients_df()

    if gender.lower() == "m":
        gender_prefix = "Males"
    else:
        gender_prefix = "Females"

    if age <= 3:
        age_group = "Children 1-3 y"
    elif 4 <= age <= 8:
        age_group = "Children 4-8 y"
    elif 9 <= age <= 13:
        age_group = f"{gender_prefix} 9-13 y"
    elif 14 <= age <= 18:
        age_group = f"{gender_prefix} 14-18 y"
    elif 19 <= age <= 30:
        age_group = f"{gender_prefix} 19-30 y"
    elif 31 <= age <= 50:
        age_group = f"{gender_prefix} 31-50 y"
    elif 51 <= age <= 70:
        age_group = f"{gender_prefix} 51-70 y"
    else:
        age_group = f"{gender_prefix} > 70 y"

    nutrient_bounds = nutrients_data[nutrients_data["Life-Stage Group"] == age_group]

    if nutrient_bounds.empty:
        raise ValueError(f"No nutrient data found for age group: {age_group}")

    return nutrient_bounds.iloc[0]
