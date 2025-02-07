import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import api from '../services/api';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";

const PersonalInfoForm = ({ onCalculationSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      gender: 'm',
      age: '',
      weight: '',
      height: '',
      activity: '1.2',
      protein: '30',
      carbohydrate: '40',
      fats: '30',
      percentage: '100'
    }
  });

  // Form submission handler
  const onSubmit = async (formData) => {
    // Validation checks
    const age = parseInt(formData.age);
    const weight = parseInt(formData.weight);
    const height = parseInt(formData.height);

    if (age < 19 || age > 100) {
      setError('Age must be between 19 and 100');
      return;
    }

    if (weight < 30 || weight > 200) {
      setError('Weight must be between 30 and 200 kg');
      return;
    }

    if (height < 135 || height > 200) {
      setError('Height must be between 135 and 200 cm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.calculateNutrition(formData);
      onCalculationSuccess({ ...result, age: formData.age, gender: formData.gender });
    } catch (err) {
      setError(err.message || 'An error occurred while calculating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary">
        <CardTitle className="text-white">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Gender and Age Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue="m" {...register("gender")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Male</SelectItem>
                  <SelectItem value="f">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                type="number"
                id="age"
                {...register("age", {
                  required: true,
                  min: 19,
                  max: 100
                })}
                className={errors.age ? "border-red-500" : ""}
              />
              {errors.age && (
                <p className="text-sm text-red-500">Age must be between 19 and 100</p>
              )}
            </div>
          </div>

          {/* Weight and Height Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                type="number"
                id="weight"
                {...register("weight", {
                  required: true,
                  min: 30,
                  max: 200
                })}
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight && (
                <p className="text-sm text-red-500">Weight must be between 30 and 200 kg</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                type="number"
                id="height"
                {...register("height", {
                  required: true,
                  min: 135,
                  max: 200
                })}
                className={errors.height ? "border-red-500" : ""}
              />
              {errors.height && (
                <p className="text-sm text-red-500">Height must be between 135 and 200 cm</p>
              )}
            </div>
          </div>

          {/* Activity Level and Target Caloric Intake Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select defaultValue="1.2" {...register("activity")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">Sedentary</SelectItem>
                  <SelectItem value="1.375">Lightly Active</SelectItem>
                  <SelectItem value="1.55">Moderately Active</SelectItem>
                  <SelectItem value="1.725">Very Active</SelectItem>
                  <SelectItem value="1.9">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage">Target Caloric Intake (%)</Label>
              <Input
                type="number"
                id="percentage"
                {...register("percentage", {
                  required: true,
                  min: 50,
                  max: 150
                })}
              />
            </div>
          </div>

          {/* Macronutrient Ratios Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein Ratio (%)</Label>
              <Input
                type="number"
                id="protein"
                {...register("protein", {
                  required: true,
                  min: 10,
                  max: 50
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carbohydrate">Carbohydrate Ratio (%)</Label>
              <Input
                type="number"
                id="carbohydrate"
                {...register("carbohydrate", {
                  required: true,
                  min: 20,
                  max: 65
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fats">Fats Ratio (%)</Label>
              <Input
                type="number"
                id="fats"
                {...register("fats", {
                  required: true,
                  min: 15,
                  max: 40
                })}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

PersonalInfoForm.propTypes = {
  onCalculationSuccess: PropTypes.func.isRequired,
};

export default PersonalInfoForm;