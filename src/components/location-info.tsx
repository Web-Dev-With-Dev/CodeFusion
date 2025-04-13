import { useTrip } from "@/lib/trip-context";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plane, Sun, Clock, Utensils, Bus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface LocationInfo {
  name: string;
  description: string;
  weather: string;
  bestTimeToVisit: string;
  localCuisine: string[];
  transportationTips: string;
  mustVisitPlaces: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

// Simulated AI generation function - Replace with actual AI implementation
async function generateLocationInfo(tripName: string, startDate: string, endDate: string): Promise<LocationInfo> {
  // This is a placeholder - Replace with actual AI API call
  return {
    name: tripName,
    description: `Discover the wonders of ${tripName}, a destination that combines natural beauty with rich cultural heritage.`,
    weather: `During ${startDate} to ${endDate}, expect mild temperatures with occasional rain. Pack accordingly with light layers and rain gear.`,
    bestTimeToVisit: `The chosen dates (${startDate} to ${endDate}) are ideal for visiting ${tripName}, offering comfortable weather and fewer crowds.`,
    localCuisine: [
      "Local Specialty 1",
      "Traditional Dish 2",
      "Famous Street Food 3",
      "Regional Delicacy 4"
    ],
    transportationTips: `Public transportation is readily available in ${tripName}. Consider getting a travel pass for convenience.`,
    mustVisitPlaces: [
      {
        name: "Popular Landmark",
        type: "attraction",
        description: "A must-visit historical site with stunning architecture."
      },
      {
        name: "Local Market",
        type: "shopping",
        description: "Experience local culture and find unique souvenirs."
      },
      {
        name: "Nature Park",
        type: "outdoor",
        description: "Perfect for hiking and enjoying natural scenery."
      }
    ]
  };
}

export function LocationInfo() {
  const { currentTrip } = useTrip();
  const { t } = useLanguage();
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInfo = async () => {
    if (!currentTrip) return;
    
    setIsLoading(true);
    try {
      const info = await generateLocationInfo(
        currentTrip.name,
        currentTrip.startDate,
        currentTrip.endDate
      );
      setLocationInfo(info);
      toast.success(t('locationInfoGenerated'));
    } catch (error) {
      console.error('Error generating location info:', error);
      toast.error(t('errorGeneratingLocation'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTrip && !locationInfo) {
      generateInfo();
    }
  }, [currentTrip?.id]);

  if (!currentTrip) return null;

  return (
    <section className="w-full border-t bg-muted/5 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight">{t('locationInformation')}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInfo}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('generating') : t('regenerateInfo')}
          </Button>
        </div>

        {locationInfo ? (
          <Card className="mb-8 shadow-sm">
            <CardHeader className="border-b bg-muted/5">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{locationInfo.name}</CardTitle>
              </div>
              <CardDescription className="text-base mt-2">
                {locationInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/5 border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">{t('weather')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{locationInfo.weather}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/5 border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">{t('bestTimeToVisit')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{locationInfo.bestTimeToVisit}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/5 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t('localCuisine')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {locationInfo.localCuisine.map((dish, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/5 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t('transportationTips')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{locationInfo.transportationTips}</p>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-semibold mb-4">{t('mustVisitPlaces')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationInfo.mustVisitPlaces.map((place, index) => (
                    <Card key={index} className="bg-muted/5 border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{place.name}</CardTitle>
                        <CardDescription className="text-sm capitalize">
                          {t(`placeType.${place.type}`)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {place.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-primary animate-bounce" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              {isLoading ? t('generatingLocation') : t('noLocationYet')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isLoading ? t('generatingLocationDescription') : t('noLocationDescription')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 