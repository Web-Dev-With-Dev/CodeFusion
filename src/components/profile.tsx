"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  Package, 
  Users2, 
  Calendar,
  Bell,
  Shield,
  Key,
  Backpack
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EditProfileDialog } from "./profile/edit-profile-dialog";
import { ChangePasswordDialog } from "./profile/change-password-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useTrip } from "@/lib/trip-context";

export function Profile() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();
  const { trips } = useTrip();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/dashboard");
  };

  const handleProfileUpdate = (data: { name: string; email: string; avatar: string }) => {
    setUser({
      ...user!,
      ...data
    });
  };

  // Calculate real-time stats
  const tripsCreated = trips.length;
  const itemsPacked = trips.reduce((total, trip) => 
    total + trip.items.filter(item => item.isPacked).length, 0
  );
  const peopleCollaborated = trips.reduce((total, trip) => 
    total + trip.people.length, 0
  );

  if (!user) {
    return null; // Return null while the useEffect handles the redirect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8 w-full">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <div className="flex items-center">
            <h1 className="text-5xl font-bold flex items-center">
              <Backpack className="h-14 w-14 mr-4" />
              PackTogether
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")} title="Go to Dashboard">
              <Backpack className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-center mt-2">
          Manage group packing for events or travel
        </p>
      </header>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start border-b mb-4">
              <TabsTrigger value="profile" className="flex gap-2">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex gap-2">
                <Shield className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                  </p>
                  <div className="mt-4">
                    <EditProfileDialog user={user} onUpdate={handleProfileUpdate} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                        <p className="text-sm font-medium">Trips Created</p>
                      </div>
                      <p className="text-2xl font-bold">{tripsCreated}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                        <p className="text-sm font-medium">Items Packed</p>
                      </div>
                      <p className="text-2xl font-bold">{itemsPacked}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                        <p className="text-sm font-medium">Collaborators</p>
                      </div>
                      <p className="text-2xl font-bold">{peopleCollaborated}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between group p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your trips and collaborators
                    </p>
                  </div>
                  <Switch className="transition-transform duration-200 group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between group p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <Label>Trip Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when changes are made to your trips
                    </p>
                  </div>
                  <Switch defaultChecked className="transition-transform duration-200 group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between group p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <Label>Collaboration Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new collaboration requests
                    </p>
                  </div>
                  <Switch defaultChecked className="transition-transform duration-200 group-hover:scale-105" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-4">
                <div className="flex items-center justify-between group p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch className="transition-transform duration-200 group-hover:scale-105" />
                </div>
                <div className="space-y-0.5">
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Update your password regularly to keep your account secure
                  </p>
                  <ChangePasswordDialog />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 