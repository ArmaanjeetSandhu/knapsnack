import { AlertTriangle, Check, Info, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import type { FeasibilityAnalysis as FeasibilityAnalysisData } from "../../services/api";
import { bankersRound } from "../../lib/resultsHelpers";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface FeasibilityAnalysisProps {
  feasibilityData: FeasibilityAnalysisData;
  onGoBack: () => void;
}

type ActiveTab = "overview" | "lower" | "upper";

const NUTRIENT_NAME_REPLACEMENTS: Record<string, string> = {
  "Thiamin (mg)": "Thiamin (Vitamin B₁) (mg)",
  "Riboflavin (mg)": "Riboflavin (Vitamin B₂) (mg)",
  "Niacin (mg)": "Niacin (Vitamin B₃) (mg)",
  "Pantothenic Acid (mg)": "Pantothenic Acid (Vitamin B₅) (mg)",
  "Folate (µg)": "Folate (Vitamin B₉) (µg)",
};

const formatNutrientName = (name: string): string =>
  NUTRIENT_NAME_REPLACEMENTS[name] ?? name;

const FeasibilityAnalysis = ({
  feasibilityData,
  onGoBack,
}: FeasibilityAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const {
    isLowerBoundsFeasible,
    isUpperBoundsFeasible,
    lowerBoundIssues,
    upperBoundIssues,
  } = feasibilityData;

  const renderOverview = () => (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Diet plan is not feasible</AlertTitle>
        <AlertDescription className="text-foreground">
          Some nutrient requirements cannot be met with your selected foods.
          Review the details below.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={
            isLowerBoundsFeasible ? "border-green-500" : "border-red-500"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              {isLowerBoundsFeasible ? (
                <Check className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <X className="mr-2 h-5 w-5" />
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
                <p className="text-xs">
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
            <CardTitle className="flex items-center text-lg font-medium">
              {isUpperBoundsFeasible ? (
                <Check className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <X className="mr-2 h-5 w-5" />
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
                <p className="text-xs">
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
            <AlertDescription className="text-foreground">
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
              {lowerBoundIssues.map((issue, index) => {
                const required = bankersRound(issue.required, 1);
                const achievable = bankersRound(issue.achievable, 2);
                const shortfall = bankersRound(required - achievable, 2);
                const shortfallPct = bankersRound(issue.shortfallPercentage, 2);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatNutrientName(issue.nutrient)}
                    </TableCell>
                    <TableCell>{required}</TableCell>
                    <TableCell>{achievable}</TableCell>
                    <TableCell>
                      {shortfall} ({shortfallPct}%)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-6">
            Consider adding foods that are rich in the nutrients listed above to
            meet your nutritional requirements.
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
            <AlertDescription className="text-foreground">
              Even at minimum servings, the following foods exceed upper limits
              of some nutrients.
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
              {upperBoundIssues.map((issue, index) => {
                const limit = bankersRound(issue.limit, 1);
                const minimum = bankersRound(issue.minimum, 2);
                const excess = bankersRound(minimum - limit, 2);
                const excessPct = bankersRound(issue.excessPercentage, 2);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatNutrientName(issue.nutrient)}
                    </TableCell>
                    <TableCell>{issue.foodItem}</TableCell>
                    <TableCell>{limit}</TableCell>
                    <TableCell>{minimum}</TableCell>
                    <TableCell>
                      {excess} ({excessPct}%)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-6">
            Consider removing or reducing the quantity of foods high in the
            nutrients listed above to stay within recommended limits.
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="rounded-t-lg bg-primary">
        <CardTitle className="text-white">Feasibility Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ActiveTab)}
        >
          <TabsList className="grid h-auto w-full grid-cols-1 md:grid-cols-3">
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
          <Button variant="outline" className="w-full" onClick={onGoBack}>
            <RefreshCw className="mr-2 h-5 w-5" />
            Modify Foods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeasibilityAnalysis;
