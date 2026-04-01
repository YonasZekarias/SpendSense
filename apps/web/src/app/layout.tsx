import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";
import { TooltipProvider } from "@repo/ui/components/tooltip";
// import "@repo/ui/styles/globals.css";
import "@repo/ui/styles/globals.css";
// import "./globals.css";
const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
