import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  LogOut,
  User,
  MessageSquare,
  TreePine
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";

interface TopBarProps {
  onShowNotifications: () => void;
}

export function TopBar({ onShowNotifications }: TopBarProps) {
  const { user, logoutMutation } = useAuth();
  const { theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [isChristmasMode, setIsChristmasMode] = useState(true);

  const { data: pendingTransfers = [] } = useQuery<any[]>({
    queryKey: ["/api/transfers/pending"],
    enabled: !!user,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const { data: repositionNotifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter(
        (n: any) =>
          !n.read &&
          (n.type?.includes("reposition") ||
            n.type?.includes("completion") ||
            n.type === "new_reposition" ||
            n.type === "reposition_transfer" ||
            n.type === "reposition_approved" ||
            n.type === "reposition_rejected" ||
            n.type === "reposition_completed" ||
            n.type === "reposition_deleted" ||
            n.type === "completion_approval_needed")
      );
    },
  });

  const getAreaDisplayName = (area: string) => {
    const names: Record<string, string> = {
      corte: "Corte",
      bordado: "Bordado",
      ensamble: "Ensamble",
      plancha: "Plancha/Empaque",
      calidad: "Calidad",
      envios: "Envíos",
      admin: "Admin",
      operaciones: "Operaciones",
      almacen: "Almacén",
      diseño: "Diseño",
    };
    return names[area] || area;
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      corte: "bg-[#10b981] text-white",
      bordado: "bg-[#3b82f6] text-white",
      ensamble: "bg-[#8b5cf6] text-white",
      plancha: "bg-[#ec4899] text-white",
      calidad: "bg-[#6366f1] text-white",
      envios: "bg-[#8b5cf6] text-white",
      admin: "bg-[#64748b] text-white",
      operaciones: "bg-[#22c55e] text-white",
      almacen: "bg-[#f59e0b] text-white",
      diseño: "bg-[#a855f7] text-white",
    };
    return colors[area] || "bg-gray-400 text-white";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const totalNotifications =
    pendingTransfers.length + repositionNotifications.length;

  const getChristmasGreeting = (text: string) => {
    return (
      <span>
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="christmas-light"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    );
  };

  return (
    <>
      <style jsx global>{`
        /* ❄️ Copos de nieve */
        .snowflakes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .snowflake {
          position: absolute;
          top: -10px;
          color: white;
          font-size: 1em;
          user-select: none;
          opacity: 0.9;
          animation: fall linear infinite;
        }

        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }

        /* 🎄 Letras rojas navideñas */
        .christmas-light {
          display: inline-block;
          color: red; /* todas rojas */
        }

        /* 🌲 Capas de pinos con profundidad */
        .pine-row {
          position: absolute;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-evenly;
          align-items: flex-end;
          user-select: none;
        }

        .pine-row span {
          display: inline-block;
          transform: translateY(var(--offset, 0));
        }

        .pine-row.layer-1 { bottom: 12px; font-size: 14px; opacity: 0.4; color: #0b3d1f; filter: blur(1px); z-index: 1; }
        .pine-row.layer-2 { bottom: 6px; font-size: 18px; opacity: 0.6; color: #0f5132; z-index: 2; }
        .pine-row.layer-3 { bottom: 0; font-size: 22px; opacity: 0.9; color: #198754; z-index: 3; }
      `}</style>

      <div className="relative h-16 border-b bg-[var(--jasana-topbar-bg)]/95 backdrop-blur sticky top-0 z-40 overflow-hidden">
        {/* ❄️ Nieve cayendo */}
        {isChristmasMode && (
          <div className="snowflakes">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="snowflake"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${25 + Math.random() * 15}s`,
                  animationDelay: `${Math.random() * 10}s`,
                  fontSize: `${Math.random() * 10 + 8}px`,
                }}
              >
                ❄
              </div>
            ))}
          </div>
        )}

        {/* 🌲 Pinos con profundidad */}
        {isChristmasMode && (
          <>
            <div className="pine-row layer-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={`layer1-${i}`} style={{ "--offset": `${Math.random() * -2}px` } as React.CSSProperties}>
                  🎄
                </span>
              ))}
            </div>
            <div className="pine-row layer-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={`layer2-${i}`} style={{ "--offset": `${Math.random() * -3}px` } as React.CSSProperties}>
                  🎄
                </span>
              ))}
            </div>
            <div className="pine-row layer-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={`layer3-${i}`} style={{ "--offset": `${Math.random() * -4}px` } as React.CSSProperties}>
                  🎄
                </span>
              ))}
            </div>
          </>
        )}

        {/* 🌟 Contenido principal */}
        <div className="flex h-full items-center justify-between px-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold">
                {isChristmasMode
                  ? getChristmasGreeting(`${getGreeting()}, ${user?.name}`)
                  : `${getGreeting()}, ${user?.name}`}
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.area ? getAreaDisplayName(user.area) : ""}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChristmasMode(!isChristmasMode)}
              className={`h-10 w-10 p-0 ${isChristmasMode ? "text-red-500" : "text-muted-foreground"} mr-10`}
              title={isChristmasMode ? "Desactivar modo navideño" : "Activar modo navideño"}
            >
              <TreePine className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={onShowNotifications}
              className="relative h-10 w-10 p-0"
            >
              <Bell className="h-5 w-5" />
              {totalNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="relative"> {/* Added this div for positioning */}
                    {isChristmasMode && (
                      <img
                        src="christmas-hat.png" // Path to your Christmas hat image
                        alt="Christmas Hat"
                        className="absolute -top-3 -right-3 w-10 h-auto z-20" // Adjust positioning and size as needed
                        style={{ transform: 'rotate(15deg)' }} // Slight rotation for a more natural look
                      />
                    )}
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src="" alt={user?.name || ""} />
                      <AvatarFallback
                        className={`font-semibold text-sm ${getAreaColor(user?.area || "")}`}
                      >
                        {getUserInitials(user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.username}</p>
                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 w-fit ${getAreaColor(user?.area || "")}`}>
                      {user?.area ? getAreaDisplayName(user.area) : ""}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`msteams:/l/chat/0/0?users=${user?.username}`} className="flex w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Abrir Teams</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}