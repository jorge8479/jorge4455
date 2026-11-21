export interface ResourceItem {
  id: number;
  name: string;
  url: string;
}

export interface LoggedUser {
  id: string;
  username: string;
  avatar: string;
  lastLogin: string;
  key: string;
  resourceId: number | null;
}

interface PanelStore {
  loggedUsers: Record<string, LoggedUser>;
  resources: ResourceItem[];
}

const globalStore = globalThis as unknown as { __PANEL_STORE__?: PanelStore };

if (!globalStore.__PANEL_STORE__) {
  globalStore.__PANEL_STORE__ = {
    loggedUsers: {},
    resources: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Resource #${i + 1}`,
      url: '',
    })),
  };
}

export const store = globalStore.__PANEL_STORE__;
