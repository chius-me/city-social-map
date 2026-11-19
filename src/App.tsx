import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Character, Faction, FactionId, Locale, RelationEdge, RelationType } from "./types";
import { CHARACTER_MAP } from "./data/characters";
import { FACTION_MAP } from "./data/factions";
import { findSocialPath } from "./utils/pathfinding";
import { LoadingCurtain } from "./components/LoadingCurtain";
import { TopBar } from "./components/TopBar";
import { SocialMapCanvas, type MapCameraHandle } from "./components/SocialMapCanvas";
import { BottomControls } from "./components/BottomControls";
import { DetailDrawer } from "./components/DetailDrawer";
import { PathFinderBar } from "./components/PathFinderBar";
import { DirectoryModal } from "./components/DirectoryModal";
import { MenuOverlay } from "./components/MenuOverlay";

export default function App() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [visibleRelationTypes, setVisibleRelationTypes] = useState<Record<RelationType, boolean>>({
    children: true,
    friendship: true,
    employment: true,
    specific: true,
  });

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedFactionId, setSelectedFactionId] = useState<FactionId | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [pathMode, setPathMode] = useState(false);
  const [pathStartId, setPathStartId] = useState<string | null>("nagumo");
  const [pathEndId, setPathEndId] = useState<string | null>("tatewaku");

  const cameraRef = useRef<MapCameraHandle | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial character from URL hash (#char=nagumo)
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/char=([a-z0-9-]+)/i);
    if (match && CHARACTER_MAP[match[1]]) {
      const char = CHARACTER_MAP[match[1]];
      setSelectedCharacterId(char.id);
      window.setTimeout(() => {
        cameraRef.current?.flyToPoint(char.x, char.y, 1.35);
      }, 650);
    }
  }, []);

  const selectedCharacter = selectedCharacterId ? CHARACTER_MAP[selectedCharacterId] ?? null : null;
  const selectedFaction = selectedFactionId ? FACTION_MAP[selectedFactionId] ?? null : null;

  const activePath = useMemo(() => {
    if (!pathMode || !pathStartId || !pathEndId) return null;
    return findSocialPath(pathStartId, pathEndId);
  }, [pathMode, pathStartId, pathEndId]);

  const handleToggleRelationType = useCallback((type: RelationType) => {
    setVisibleRelationTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleSelectCharacter = useCallback(
    (char: Character) => {
      if (pathMode) {
        if (!pathStartId || (pathStartId && pathEndId)) {
          setPathStartId(char.id);
          setPathEndId(null);
        } else {
          setPathEndId(char.id);
        }
        return;
      }
      setSelectedCharacterId(char.id);
      setSelectedFactionId(null);
      setSelectedEdgeId(null);
      window.history.replaceState(null, "", `#char=${char.id}`);
    },
    [pathEndId, pathMode, pathStartId]
  );

  const handleLocateCharacter = useCallback((char: Character) => {
    setSelectedCharacterId(char.id);
    setSelectedFactionId(null);
    setSelectedEdgeId(null);
    window.history.replaceState(null, "", `#char=${char.id}`);
    cameraRef.current?.flyToPoint(char.x, char.y, 1.35);
  }, []);

  const handleSelectFaction = useCallback((faction: Faction) => {
    setSelectedFactionId(faction.id);
    setSelectedCharacterId(null);
    setSelectedEdgeId(null);
    cameraRef.current?.flyToBounds(faction.bounds);
  }, []);

  const handleJumpToFaction = useCallback((faction: Faction | null) => {
    if (!faction) {
      setSelectedFactionId(null);
      setSelectedCharacterId(null);
      cameraRef.current?.resetView();
      return;
    }
    setSelectedFactionId(faction.id);
    setSelectedCharacterId(null);
    setSelectedEdgeId(null);
    cameraRef.current?.flyToBounds(faction.bounds);
  }, []);

  const handleSelectEdge = useCallback((edge: RelationEdge | null) => {
    setSelectedEdgeId(edge ? edge.id : null);
    if (edge) {
      setSelectedCharacterId(null);
      setSelectedFactionId(null);
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedCharacterId(null);
    setSelectedFactionId(null);
    setSelectedEdgeId(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const handleSetPathEndpoint = useCallback((charId: string, which: "start" | "end") => {
    setPathMode(true);
    setSelectedCharacterId(null);
    setSelectedFactionId(null);
    setSelectedEdgeId(null);
    if (which === "start") {
      setPathStartId(charId);
    } else {
      setPathEndId(charId);
    }
    cameraRef.current?.resetView();
  }, []);

  // Keyboard shortcuts (+ / - / 0 / / / Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");

      if (e.key === "Escape") {
        if (menuOpen) setMenuOpen(false);
        else if (directoryOpen) setDirectoryOpen(false);
        else if (pathMode) setPathMode(false);
        else handleClearSelection();
        return;
      }

      if (inInput) return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        cameraRef.current?.zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        cameraRef.current?.zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        cameraRef.current?.resetView();
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [directoryOpen, handleClearSelection, menuOpen, pathMode]);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <LoadingCurtain />

      <TopBar
        locale={locale}
        onChangeLocale={setLocale}
        directoryOpen={directoryOpen}
        onToggleDirectory={() => {
          setMenuOpen(false);
          setDirectoryOpen((v) => !v);
        }}
        pathMode={pathMode}
        onTogglePathMode={() => {
          setMenuOpen(false);
          setDirectoryOpen(false);
          setPathMode((v) => {
            const next = !v;
            if (next) {
              setSelectedCharacterId(null);
              setSelectedFactionId(null);
              cameraRef.current?.resetView();
            }
            return next;
          });
        }}
        menuOpen={menuOpen}
        onToggleMenu={() => {
          setDirectoryOpen(false);
          setMenuOpen((v) => !v);
        }}
        onResetView={() => {
          handleClearSelection();
          cameraRef.current?.resetView();
        }}
      />

      {/* Interactive Pan & Zoom CITY Social Map */}
      <SocialMapCanvas
        locale={locale}
        visibleRelationTypes={visibleRelationTypes}
        onToggleRelationType={handleToggleRelationType}
        selectedCharacterId={selectedCharacterId}
        selectedFactionId={selectedFactionId}
        selectedEdgeId={selectedEdgeId}
        activePath={activePath}
        pathMode={pathMode}
        pathStartId={pathStartId}
        pathEndId={pathEndId}
        onSelectCharacter={handleSelectCharacter}
        onSelectFaction={handleSelectFaction}
        onSelectEdge={handleSelectEdge}
        onClearSelection={handleClearSelection}
        cameraRef={cameraRef}
      />

      {/* Path Finder Overlay Bar */}
      {pathMode && !menuOpen && !directoryOpen && (
        <PathFinderBar
          locale={locale}
          startId={pathStartId}
          endId={pathEndId}
          result={activePath}
          onChangeStart={setPathStartId}
          onChangeEnd={setPathEndId}
          onSwap={() => {
            setPathStartId(pathEndId);
            setPathEndId(pathStartId);
          }}
          onClose={() => setPathMode(false)}
          onLocateCharacter={(char) => cameraRef.current?.flyToPoint(char.x, char.y, 1.3)}
        />
      )}

      {/* Character / Faction Comic Dossier Drawer */}
      {!menuOpen && !directoryOpen && (
        <DetailDrawer
          locale={locale}
          character={selectedCharacter}
          faction={selectedFaction}
          onClose={handleClearSelection}
          onSelectCharacter={handleSelectCharacter}
          onSelectFaction={handleSelectFaction}
          onLocateCharacter={handleLocateCharacter}
          onSetPathEndpoint={handleSetPathEndpoint}
        />
      )}

      {/* Bottom Official-Style HUD Controls */}
      {!menuOpen && !directoryOpen && (
        <BottomControls
          locale={locale}
          visibleRelationTypes={visibleRelationTypes}
          onToggleRelationType={handleToggleRelationType}
          selectedFactionId={selectedFactionId}
          onJumpToFaction={handleJumpToFaction}
          onLocateCharacter={handleLocateCharacter}
          onZoomIn={() => cameraRef.current?.zoomIn()}
          onZoomOut={() => cameraRef.current?.zoomOut()}
          onResetView={() => cameraRef.current?.resetView()}
          drawerOpen={Boolean(selectedCharacter || selectedFaction)}
          searchInputRef={searchInputRef}
        />
      )}

      {/* Full Resident Directory View */}
      <DirectoryModal
        open={directoryOpen}
        locale={locale}
        onClose={() => setDirectoryOpen(false)}
        onPickCharacter={handleLocateCharacter}
      />

      {/* Official-Style Full-Screen Menu & Curated Resource Hub */}
      <MenuOverlay
        open={menuOpen}
        locale={locale}
        onClose={() => setMenuOpen(false)}
        onOpenMap={() => {
          setDirectoryOpen(false);
          setPathMode(false);
        }}
        onOpenDirectory={() => {
          setPathMode(false);
          setDirectoryOpen(true);
        }}
        onOpenPathFinder={() => {
          setDirectoryOpen(false);
          setPathMode(true);
          cameraRef.current?.resetView();
        }}
      />
    </main>
  );
}
