import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  photos: string[];
  setPhotos: (photos: string[]) => void;
  selectedStyle: {
    id: string;
    name: string;
    prompt: string;
    category: string;
  } | null;
  setSelectedStyle: (style: AppContextType["selectedStyle"]) => void;
  generatedImage: string | null;
  setGeneratedImage: (image: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<AppContextType["selectedStyle"]>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        photos,
        setPhotos,
        selectedStyle,
        setSelectedStyle,
        generatedImage,
        setGeneratedImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
