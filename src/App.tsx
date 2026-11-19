import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Character, Faction, FactionId, Locale, RelationEdge, RelationType } from "./types";
import { CHARACTER_MAP } from "./data/characters";
import { FACTION_MAP } from "./data/factions";
import { findSocialPath } from "./utils/pathfinding";
import { LoadingCurtain } from "./components/LoadingCurtain";
import { TopBar, type ViewMode } from "./components/TopBar";
import { SocialMapCanvas, type MapCameraHandle } from "./components/SocialMapCanvas";
import {
  CharacterNetworkCanvas,
  type NetworkSubMode,
} from "./components/CharacterNetworkCanvas";
import { BottomControls } from "./components/BottomControls";
import { DetailDrawer } from "./components/DetailDrawer";
import { PathFinderBar } from "./components/PathFinderBar";
import { DirectoryModal } from "./components/DirectoryModal";
import { MenuOverlay } from "./components/MenuOverlay";

function parseInitialHash(): {
  viewMode: ViewMode;
  subMode: NetworkSubMode;
  charId: string | null;
} {
  const hash = window.location.hash;
  const modeMatch = hash.match(/mode=(map|network)/i);
  const subMatch = hash.match(/sub=(ego|full)/i);
  const charMatch = hash.match(/char=([a-z0-9-]+)/i);
  const charId = charMatch && CHARACTER_MAP[charMatch[1]] ? charMatch[1] : null;
  return {
    viewMode: modeMatch && modeMatch[1].toLowerCase() === "network" ? "network" : "map",
    subMode: subMatch && subMatch[1].toLowerCase() === "full" ? "full" : "ego",
    charId,
  };
}

export default function App() {
  const initialHash = useMemo(() => parseInitialHash(), []);

  const [locale, setLocale] = useState<Locale>("zh");
  const [viewMode, setViewMode] = useState<ViewMode>(initialHash.viewMode);
  const [egoCenterId, setEgoCenterId] = useState<string>(initialHash.charId ?? "nagumo");
  const [spoilerFree, setSpoilerFree] = useState<boolean>(false);

  const [visibleRelationTypes, setVisibleRelationTypes] = useState<Record<RelationType, boolean>>({
    children: true,
    friendship: true,
    employment: true,
    specific: true,
  });

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    initialHash.charId
  );
  const [selectedFactionId, setSelectedFactionId] = useState<FactionId | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [pathMode, setPathMode] = useState(false);
  const [pathStartId, setPathStartId] = useState<string | null>("nagumo");
  const [pathEndId, setPathEndId] = useState<string | null>("tatewaku");

  const cameraRef = useRef<MapCameraHandle | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // If initialized with #char=... in classic map mode, smoothly fly to that character
  useEffect(() => {
    if (initialHash.charId && initialHash.viewMode === "map") {
      const char = CHARACTER_MAP[initialHash.charId];
      if (char) {
        window.setTimeout(() => {
          cameraRef.current?.flyToPoint(char.x, char.y, 1.35);
        }, 650);
      }
    }
  }, [initialHash]);

  const syncHash = useCallback((mode: ViewMode, charId: string | null) => {
    const parts: string[] = [];
    if (mode === "network") parts.push("mode=network");
    if (charId) parts.push(`char=${charId}`);
    if (parts.length > 0) {
      window.history.replaceState(null, "", `#${parts.join("&")}`);
    } else if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
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

  const handleChangeViewMode = useCallback(
    (nextMode: ViewMode) => {
      setViewMode(nextMode);
      if (nextMode === "network" && selectedCharacterId) {
        setEgoCenterId(selectedCharacterId);
      }
      syncHash(nextMode, selectedCharacterId);
    },
    [selectedCharacterId, syncHash]
  );

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
      setEgoCenterId(char.id);
      setSelectedFactionId(null);
      setSelectedEdgeId(null);
      syncHash(viewMode, char.id);
    },
    [pathEndId, pathMode, pathStartId, syncHash, viewMode]
  );

  const handleLocateCharacter = useCallback(
    (char: Character) => {
      setSelectedCharacterId(char.id);
      setEgoCenterId(char.id);
      setSelectedFactionId(null);
      setSelectedEdgeId(null);
      syncHash(viewMode, char.id);
      if (viewMode === "map") {
        cameraRef.current?.flyToPoint(char.x, char.y, 1.35);
      }
    },
    [syncHash, viewMode]
  );

  const handleOpenEgoRadar = useCallback(
    (char: Character) => {
      setPathMode(false);
      setDirectoryOpen(false);
      setMenuOpen(false);
      setEgoCenterId(char.id);
      setSelectedCharacterId(char.id);
      setSelectedFactionId(null);
      setSelectedEdgeId(null);
      setViewMode("network");
      syncHash("network", char.id);
    },
    [syncHash]
  );

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
    syncHash(viewMode, null);
  }, [syncHash, viewMode]);

  const handleSetPathEndpoint = useCallback(
    (charId: string, which: "start" | "end") => {
      setViewMode("map");
      setPathMode(true);
      setSelectedCharacterId(null);
      setSelectedFactionId(null);
      setSelectedEdgeId(null);
      if (which === "start") {
        setPathStartId(charId);
      } else {
        setPathEndId(charId);
      }
      syncHash("map", null);
      window.setTimeout(() => cameraRef.current?.resetView(), 60);
    },
    [syncHash]
  );

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
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        spoilerFree={spoilerFree}
        onToggleSpoilerFree={() => setSpoilerFree((v) => !v)}
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
              setViewMode("map");
              setSelectedCharacterId(null);
              setSelectedFactionId(null);
              window.setTimeout(() => cameraRef.current?.resetView(), 60);
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

      {/* Primary Interactive View: Classic Social Map OR Character-Centric Ego Radar / Full Network */}
      {viewMode === "map" ? (
        <SocialMapCanvas
          locale={locale}
          spoilerFree={spoilerFree}
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
      ) : (
        <CharacterNetworkCanvas
          locale={locale}
          spoilerFree={spoilerFree}
          initialSubMode={initialHash.subMode}
          egoCenterId={egoCenterId}
          onChangeEgoCenter={(cid) => {
            setEgoCenterId(cid);
            syncHash("network", cid);
          }}
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
      )}

      {/* Path Finder Overlay Bar */}
      {pathMode && !menuOpen && !directoryOpen && (
        <PathFinderBar
          locale={locale}
          spoilerFree={spoilerFree}
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
          spoilerFree={spoilerFree}
          character={selectedCharacter}
          faction={selectedFaction}
          onClose={handleClearSelection}
          onSelectCharacter={handleSelectCharacter}
          onSelectFaction={handleSelectFaction}
          onLocateCharacter={handleLocateCharacter}
          onOpenEgoRadar={handleOpenEgoRadar}
          onSetPathEndpoint={handleSetPathEndpoint}
        />
      )}

      {/* Bottom Official-Style HUD Controls */}
      {!menuOpen && !directoryOpen && (
        <BottomControls
          locale={locale}
          spoilerFree={spoilerFree}
          viewMode={viewMode}
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
        spoilerFree={spoilerFree}
        onClose={() => setDirectoryOpen(false)}
        onPickCharacter={handleLocateCharacter}
      />

      {/* Official-Style Full-Screen Menu & Curated Resource Hub */}
      <MenuOverlay
        open={menuOpen}
        locale={locale}
        spoilerFree={spoilerFree}
        onToggleSpoilerFree={() => setSpoilerFree((v) => !v)}
        onClose={() => setMenuOpen(false)}
        onOpenMap={() => {
          setDirectoryOpen(false);
          setPathMode(false);
          handleChangeViewMode("map");
        }}
        onOpenNetwork={() => {
          setDirectoryOpen(false);
          setPathMode(false);
          handleChangeViewMode("network");
        }}
        onOpenDirectory={() => {
          setPathMode(false);
          setDirectoryOpen(true);
        }}
        onOpenPathFinder={() => {
          setDirectoryOpen(false);
          setViewMode("map");
          setPathMode(true);
          window.setTimeout(() => cameraRef.current?.resetView(), 60);
        }}
      />
    </main>
  );
}
