import Link from "next/link";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">NBC</span>
            </div>
            <span className="font-bold text-xl text-blue-600">NextBoomCity</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                Home
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-gray-50/95">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/properties"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          All Properties
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Browse all available properties in India
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                  <Link href="/properties?type=residential" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Residential</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Homes and apartments
                    </p>
                  </Link>
                  <Link href="/properties?type=commercial" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Commercial</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Office spaces and retail
                    </p>
                  </Link>
                  <Link href="/properties?type=plots" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Plots & Land</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Land for development
                    </p>
                  </Link>
                  <Link href="/properties?type=religious" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Religious Properties</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Temples and ashram lands
                    </p>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Locations</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-gray-50/95">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/locations"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          All Locations
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Explore cities across India
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                  <Link href="/locations/faridabad" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Faridabad</div>
                  </Link>
                  <Link href="/locations/ncr" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">NCR</div>
                  </Link>
                  <Link href="/locations/dholera" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Dholera</div>
                  </Link>
                  <Link href="/locations/vrindavan" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Vrindavan</div>
                  </Link>
                  <Link href="/locations/ayodhya" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Ayodhya</div>
                  </Link>
                  <Link href="/locations/goa" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Goa</div>
                  </Link>
                  <Link href="/locations/hyderabad" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Hyderabad</div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <Link href="/properties?listing_type=rent" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                 Rent
               </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <Link href="/ai-tools" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                 AI Tools
               </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/maps" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                Maps
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties, locations..."
              className="pl-8"
            />
          </div>
        </div>

        {/* User Menu and Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/payments">Upgrade</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Link href="/" className="flex items-center py-2 text-lg font-semibold">
                  Home
                </Link>
                <div className="space-y-2">
                  <h4 className="font-semibold">Properties</h4>
                  <Link href="/properties" className="block pl-4 py-2 text-sm">
                    All Properties
                  </Link>
                  <Link href="/properties?type=residential" className="block pl-4 py-2 text-sm">
                    Residential
                  </Link>
                  <Link href="/properties?type=commercial" className="block pl-4 py-2 text-sm">
                    Commercial
                  </Link>
                  <Link href="/properties?type=plots" className="block pl-4 py-2 text-sm">
                    Plots & Land
                  </Link>
                  <Link href="/properties?type=religious" className="block pl-4 py-2 text-sm">
                    Religious Properties
                  </Link>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Locations</h4>
                  <Link href="/locations/faridabad" className="block pl-4 py-2 text-sm">
                    Faridabad
                  </Link>
                  <Link href="/locations/ncr" className="block pl-4 py-2 text-sm">
                    NCR
                  </Link>
                  <Link href="/locations/dholera" className="block pl-4 py-2 text-sm">
                    Dholera
                  </Link>
                  <Link href="/locations/vrindavan" className="block pl-4 py-2 text-sm">
                    Vrindavan
                  </Link>
                  <Link href="/locations/ayodhya" className="block pl-4 py-2 text-sm">
                    Ayodhya
                  </Link>
                  <Link href="/locations/goa" className="block pl-4 py-2 text-sm">
                    Goa
                  </Link>
                  <Link href="/locations/hyderabad" className="block pl-4 py-2 text-sm">
                    Hyderabad
                  </Link>
                </div>
                <Link href="/properties?listing_type=rent" className="flex items-center py-2 text-lg font-semibold">
                  Rent
                </Link>
                <Link href="/ai-tools" className="flex items-center py-2 text-lg font-semibold">
                  AI Tools
                </Link>
                <Link href="/maps" className="flex items-center py-2 text-lg font-semibold">
                  Maps
                </Link>
                <Link href="/payments" className="flex items-center py-2 text-lg font-semibold">
                  Upgrade
                </Link>
                <div className="pt-4 border-t">
                  <Link href="/login" className="block py-2 text-sm">
                    Login
                  </Link>
                  <Link href="/register" className="block py-2 text-sm">
                    Register
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
