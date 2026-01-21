import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const FeasibilityAnalysis = ({ feasibilityData }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!feasibilityData || !feasibilityData.analysis) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Optimization Failed</AlertTitle>
        <AlertDescription>
          Diet optimization failed but no feasibility analysis was returned.
          Please try again with different foods or nutrient bounds.
        </AlertDescription>
      </Alert>
    );
  }

  const {
    isLowerBoundsFeasible,
    isUpperBoundsFeasible,
    isFeasible,
    lowerBoundIssues,
    upperBoundIssues,
  } = feasibilityData;

  const formatValue = (value) => {
    return typeof value === "number"
      ? value.toLocaleString("en-US", {
          maximumFractionDigits: 1,
        })
      : value;
  };

  const formatNutrientName = (name) => {
    const replacements = {
      "Thiamin (mg)": "Thiamin (Vitamin B₁) (mg)",
      "Riboflavin (mg)": "Riboflavin (Vitamin B₂) (mg)",
      "Niacin (mg)": "Niacin (Vitamin B₃) (mg)",
      "Pantothenic Acid (mg)": "Pantothenic Acid (Vitamin B₅) (mg)",
      "Folate (µg)": "Folate (Vitamin B₉) (µg)",
    };
    return replacements[name] || name;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Alert variant={isFeasible ? "success" : "destructive"}>
        {isFeasible ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertTitle>
          {isFeasible ? "Diet plan is feasible" : "Diet plan is not feasible"}
        </AlertTitle>
        <AlertDescription>
          {isFeasible
            ? "All nutrient requirements can be met with your selected foods."
            : "Some nutrient requirements cannot be met with your selected foods. Review the details below."}
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={
            isLowerBoundsFeasible ? "border-green-500" : "border-red-500"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              {isLowerBoundsFeasible ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2" />
              )}
              Minimum Nutrient Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isLowerBoundsFeasible
                ? "All minimum nutrient requirements can be met."
                : `${lowerBoundIssues.length} nutrient(s) cannot meet minimum requirements.`}
            </p>
            {!isLowerBoundsFeasible && (
              <div className="mt-2">
                <p className="text-xs text-red-500">
                  Problem nutrients:{" "}
                  {lowerBoundIssues
                    .map((issue) => formatNutrientName(issue.nutrient))
                    .join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          className={
            isUpperBoundsFeasible ? "border-green-500" : "border-red-500"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              {isUpperBoundsFeasible ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2" />
              )}
              Maximum Nutrient Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isUpperBoundsFeasible
                ? "No maximum nutrient limits are exceeded."
                : `${upperBoundIssues.length} nutrient(s) exceed maximum limits.`}
            </p>
            {!isUpperBoundsFeasible && (
              <div className="mt-2">
                <p className="text-xs text-red-500">
                  Problem nutrients:{" "}
                  {upperBoundIssues
                    .map((issue) => formatNutrientName(issue.nutrient))
                    .join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLowerBoundIssues = () => (
    <div className="space-y-6">
      {lowerBoundIssues.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>All minimum requirements can be met</AlertTitle>
          <AlertDescription>
            Your selected foods can provide all the minimum required nutrients.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Minimum nutrient requirements not met</AlertTitle>
            <AlertDescription>
              Even at maximum servings, your selected foods cannot provide
              enough of these nutrients.
            </AlertDescription>
          </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Maximum Possible</TableHead>
                <TableHead>Shortfall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowerBoundIssues.map((issue, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {formatNutrientName(issue.nutrient)}
                  </TableCell>
                  <TableCell>{formatValue(issue.required)}</TableCell>
                  <TableCell>{formatValue(issue.achievable)}</TableCell>
                  <TableCell className="text-red-500">
                    {formatValue(issue.shortfall)} (
                    {issue.shortfallPercentage.toFixed(1)}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6">
            <Alert>
              <AlertDescription>
                Consider adding foods that are rich in the nutrients listed
                above to meet your nutritional requirements.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}
    </div>
  );

  const renderUpperBoundIssues = () => (
    <div className="space-y-6">
      {upperBoundIssues.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No maximum limits exceeded</AlertTitle>
          <AlertDescription>
            Your selected foods don&apos;t exceed any maximum nutrient limits.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maximum nutrient limits exceeded</AlertTitle>
            <AlertDescription>
              Even at minimum servings, your selected foods provide too much of
              these nutrients.
            </AlertDescription>
          </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead>Food Item</TableHead>
                <TableHead>Maximum Allowed</TableHead>
                <TableHead>Minimum Possible</TableHead>
                <TableHead>Excess</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upperBoundIssues.map((issue, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {formatNutrientName(issue.nutrient)}
                  </TableCell>
                  <TableCell>{issue.foodItem}</TableCell>
                  <TableCell>{formatValue(issue.limit)}</TableCell>
                  <TableCell>{formatValue(issue.minimum)}</TableCell>
                  <TableCell className="text-red-500">
                    {formatValue(issue.excess)} (
                    {issue.excessPercentage.toFixed(1)}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6">
            <Alert>
              <AlertDescription>
                Consider removing or reducing the quantity of foods high in the
                nutrients listed above to stay within recommended limits.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary rounded-t-lg">
        <CardTitle className="text-white">Feasibility Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lower" disabled={lowerBoundIssues.length === 0}>
              Minimum Requirements
              {lowerBoundIssues.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {lowerBoundIssues.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upper" disabled={upperBoundIssues.length === 0}>
              Maximum Limits
              {upperBoundIssues.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {upperBoundIssues.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            {renderOverview()}
          </TabsContent>
          <TabsContent value="lower" className="mt-6">
            {renderLowerBoundIssues()}
          </TabsContent>
          <TabsContent value="upper" className="mt-6">
            {renderUpperBoundIssues()}
          </TabsContent>
        </Tabs>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Modify Food Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeasibilityAnalysis;
