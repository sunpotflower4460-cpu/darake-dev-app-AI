export type DesignAssetMediaType = 'image/png' | 'image/jpeg' | 'image/webp';

export type DesignAssetInput = {
  mediaType: DesignAssetMediaType;
  base64: string;
  label?: string;
};

export type DesignAssetRef = {
  id: string;
  mediaType: DesignAssetMediaType;
  uiIntent: string;
  label?: string;
};

export type VisualSpec = {
  palette: string[];
  typography: string[];
  layoutNotes: string[];
  vibe: string;
};

export type BlueprintGenerationInput = {
  appName: string;
  description: string;
  images: DesignAssetInput[];
  templateHint?: string;
};

export type BlueprintGenerationResult = {
  plan: {
    appName: string;
    phases: Array<{
      id: string;
      title: string;
      purpose: string;
      tasks: string[];
      doneConditions: string[];
      manualGates: string[];
    }>;
  };
  designSummary: string;
  designAssets: DesignAssetRef[];
  visualSpec: VisualSpec;
};
