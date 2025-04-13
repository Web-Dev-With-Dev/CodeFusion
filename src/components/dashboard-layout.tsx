"use client";

import { useTrip } from "@/lib/trip-context";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { TripSelector } from "@/components/trip-selector";
import { PeopleManager } from "@/components/people-manager";
import { ItemsManager } from "@/components/items-manager";
import { LanguageSelector } from "@/components/language-selector";
import { Backpack, Users, User, FileDown, Mail, Github, CheckCircle, Plane, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { EmergencyItemsSearch } from "./emergency-items-search";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function DashboardLayout() {
  const { currentTrip } = useTrip();
  const { t } = useLanguage();
  const { user, logout, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication on mount and redirect if needed
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem('pack_together_session');
        if (!session) {
          router.push('/login');
          router.refresh();
          return;
        }
        // Load profile image with user-specific key
        if (user?.email) {
          const savedImage = localStorage.getItem('profile_image_' + user.email);
          if (savedImage) {
            setProfileImage(savedImage);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
        router.refresh();
      }
    };

    if (!isLoading && !user) {
      checkAuth();
    } else if (user?.email) {
      // Also check for profile image when user is already authenticated
      const savedImage = localStorage.getItem('profile_image_' + user.email);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Backpack className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  useEffect(() => {
    if (currentTrip) {
      toast.success(`Loaded trip: ${currentTrip.name}`, {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-green-200/50 text-lg font-medium",
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
    }
  }, [currentTrip?.id]);

  const handleProfileClick = () => {
    router.push('/profile');
    toast.info("Navigating to profile...", {
      position: "top-center",
      duration: 1500,
      className: "glass-panel border border-blue-200/50 text-lg font-medium",
      icon: <User className="h-6 w-6 text-blue-500" />,
      style: {
        animation: 'fade-in-scale 0.3s ease-out',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  const handleExportList = () => {
    if (!currentTrip) return;

    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Helper function to add text and update y position
    const addText = (text: string, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, margin, yPos);
      yPos += lineHeight;
    };

    // Add title
    addText(`PACKING LIST: ${currentTrip.name}`, 16, true);
    yPos += 5;

    // Trip details
    addText(`Date: ${currentTrip.startDate} - ${currentTrip.endDate}`);
    addText(`Total Items: ${currentTrip.items.length}`);
    const packedItems = currentTrip.items.filter(item => item.isPacked).length;
    addText(`Packed Items: ${packedItems} (${Math.round((packedItems / currentTrip.items.length) * 100)}%)`);
    yPos += 5;

    // People overview
    addText('PEOPLE OVERVIEW:', 14, true);
    currentTrip.people.forEach(person => {
      const personItems = currentTrip.items.filter(item => item.assignedTo === person.id);
      const personPackedItems = personItems.filter(item => item.isPacked).length;
      const percentage = personItems.length > 0 
        ? Math.round((personPackedItems / personItems.length) * 100) 
        : 0;
      addText(`${person.name}: ${personPackedItems}/${personItems.length} items packed (${percentage}%)`);
    });
    yPos += 5;

    // Categories overview
    const categories = [...new Set(currentTrip.items.map(item => item.category))].filter(Boolean);
    if (categories.length > 0) {
      addText('CATEGORIES:', 14, true);
      categories.forEach(category => {
        const categoryItems = currentTrip.items.filter(item => item.category === category);
        const categoryPackedItems = categoryItems.filter(item => item.isPacked).length;
        const percentage = Math.round((categoryPackedItems / categoryItems.length) * 100);
        addText(`${category}: ${categoryPackedItems}/${categoryItems.length} items packed (${percentage}%)`);
      });
      yPos += 5;
    }

    // Detailed item list
    addText('DETAILED ITEM LIST:', 14, true);
    currentTrip.items.forEach(item => {
      const assignedTo = currentTrip.people.find(p => p.id === item.assignedTo)?.name || 'Unassigned';
      const status = item.isPacked ? '✓' : '✗';
      const itemText = `${status} ${item.name} (${assignedTo})${item.notes ? ` - Note: ${item.notes}` : ''}`;
      
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      addText(itemText);
    });

    // Save the PDF
    doc.save(`${currentTrip.name}-packing-list.pdf`);

    toast.success("Packing list exported as PDF!", {
      position: "top-center",
      duration: 2000,
      className: "glass-panel border border-green-200/50 text-lg font-medium",
      icon: <FileDown className="h-6 w-6 text-green-500" />,
      style: {
        animation: 'fade-in-scale 0.3s ease-out',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-red-200/50 text-lg font-medium",
        icon: <Mail className="h-6 w-6 text-red-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-red-200/50 text-lg font-medium",
        icon: <Mail className="h-6 w-6 text-red-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
      return;
    }

    toast.success("Successfully subscribed to our newsletter!", {
      position: "top-center",
      duration: 2000,
      className: "glass-panel border border-green-200/50 text-lg font-medium",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      style: {
        animation: 'fade-in-scale 0.3s ease-out',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    });
    setEmail(""); // Clear the input after successful subscription
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The redirect will be handled by the auth context
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-black relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSelector />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full p-0 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md border border-gray-200/30 overflow-hidden"
            onClick={handleProfileClick}
          >
            {profileImage ? (
              <div className="w-12 h-12 relative">
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center">
                <User className="h-7 w-7 text-blue-600" />
              </div>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-3 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md border border-gray-200/30"
            onClick={handleLogout}
          >
            <LogOut className="h-7 w-7 text-red-600" />
          </Button>
        </div>
      </div>

      <header className="mb-4 w-full mt-2">
        <div className="flex items-start justify-center w-full max-w-3xl mx-auto glass-panel p-4 animate-float relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          <div className="absolute inset-0 backdrop-blur-[2px]"></div>
          
          {/* Animated Airplane */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="animate-fly-across">
              <Plane className="h-6 w-6 text-blue-600/70 transform -rotate-12 animate-float-plane" />
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-100/50 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <h1 className="relative text-4xl font-bold flex items-center font-display tracking-tight group">
                <div className="relative transform-gpu transition-transform duration-500 hover:scale-110">
                  <Backpack className="h-10 w-10 mr-3 text-blue-600 animate-slide-in-left hover:text-blue-700 transition-colors duration-300" />
                  <div className="absolute -inset-2 bg-blue-100 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition duration-500"></div>
                </div>
                <span className="animate-slide-in-right text-blue-900 hover:text-blue-800 transition-colors duration-300 transform-gpu hover:scale-105">
                  {t('app.title')}
                </span>
              </h1>
            </div>
            <p className="text-base mt-2 font-medium tracking-wide max-w-md mx-auto text-balance animate-fade-in-delayed relative">
              <span className="text-blue-800/80 hover:text-blue-900 transition-colors duration-300">
                {t('app.description')}
              </span>
              <div className="absolute -inset-1 bg-blue-50 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
            </p>
          </div>
        </div>
      </header>

      <TripSelector />np

      {currentTrip && (
        <div className="mt-6 animate-fade-in-up">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 glass-panel p-6">
              <h1 className="text-3xl font-bold gradient-text font-display tracking-tight">{currentTrip.name}</h1>
              <div className="flex flex-col max-[580px]:w-full gap-4 flex-1 justify-end">
                <div className="flex-1 flex items-center gap-6 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out">
                  <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {currentTrip.people.length} {currentTrip.people.length === 1 ? t('member') : t('members')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <Backpack className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {currentTrip.items.filter(item => item.isPacked).length}/{currentTrip.items.length} {t('packed')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 border-l pl-6 border-gray-200 hover:scale-105 transition-transform">
                    {currentTrip.startDate} - {currentTrip.endDate}
                  </div>
                </div>
                <Button 
                  variant="default" 
                  onClick={handleExportList} 
                  className="bg-black hover:bg-black/90 text-white transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <FileDown className="h-4 w-4" />
                  {t('export.list')}
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-12 md:gap-6">
            <div className="md:col-span-8 space-y-6">
              <ItemsManager />
            </div>
            <div className="md:col-span-4 space-y-6">
              <PeopleManager />
            </div>
          </div>

          <div className="md:hidden animate-fade-in">
            <Tabs defaultValue="items" className="glass-panel p-4">
              <TabsList className="w-full">
                <TabsTrigger value="items" className="flex-1 text-black font-medium">
                  <Backpack className="h-4 w-4 mr-1" /> {t('items')}
                </TabsTrigger>
                <TabsTrigger value="people" className="flex-1 text-black font-medium">
                  <Users className="h-4 w-4 mr-1" /> {t('people')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="space-y-4 py-4">
                <ItemsManager />
              </TabsContent>
              <TabsContent value="people" className="space-y-4 py-4">
                <PeopleManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      <footer className="mt-20 border-t border-gray-200/30 w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] animate-fade-in backdrop-blur-sm bg-white/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel">
              <h3 className="text-lg font-semibold flex items-center">
                <Backpack className="h-5 w-5 mr-2 animate-bounce-slow" />
                <span className="gradient-text">{t('app.title')}</span>
              </h3>
              <p className="text-sm text-gray-600">
                {t('footer.about')}
              </p>
            </div>

            <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel group">
              <h4 className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 group-hover:animate-bounce-slow" />
                {t('footer.contact')}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:gondaliyadev71@gmail.com" className="hover:text-black transition-colors">
                    gondaliyadev71@gmail.com
                  </a>
                </li>
                <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
                  <Github className="h-4 w-4 mr-2" />
                  <a href="https://github.com/Web-Dev-With-Dev" className="hover:text-black transition-colors">
                    web-dev-with-dev
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel group">
              <h4 className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 group-hover:animate-bounce-slow" />
                {t('footer.newsletter')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('footer.newsletter.description')}
              </p>
              <div className="flex gap-2 transform hover:translate-y-[-2px] transition-transform duration-200">
                <Input 
                  type="email" 
                  placeholder={t('footer.email.placeholder')}
                  className="max-w-[200px] focus:ring-2 focus:ring-black/5 bg-white/50 backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  variant="default" 
                  className="bg-black hover:bg-black/90 text-white transform hover:translate-y-[-1px] hover:shadow-lg transition-all duration-300"
                  onClick={handleSubscribe}
                >
                  {t('footer.subscribe')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/30">
            <p className="text-center text-sm text-gray-600 hover:text-black transition-colors duration-200">
              © {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
