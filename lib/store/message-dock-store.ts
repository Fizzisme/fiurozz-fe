import { create } from 'zustand';

/** Số cửa sổ mở cùng lúc trên desktop; mở thêm thì cửa sổ cũ nhất đóng lại. */
export const MAX_WINDOWS = 3;

interface MessageDockState {
    /** Bảng danh sách hội thoại đang mở hay không */
    isListOpen: boolean;
    /** displayName của các hội thoại đang mở, mới nhất đứng đầu */
    openWindows: string[];
    /** displayName -> đang thu gọn thành thanh tiêu đề */
    minimized: Record<string, boolean>;

    toggleList: () => void;
    openConversation: (displayName: string) => void;
    closeConversation: (displayName: string) => void;
    toggleMinimize: (displayName: string) => void;
}

export const useMessageDockStore = create<MessageDockState>((set) => ({
    isListOpen: false,
    openWindows: [],
    minimized: {},

    toggleList: () => set((state) => ({ isListOpen: !state.isListOpen })),

    openConversation: (displayName) =>
        set((state) => {
            // Đã mở thì chỉ bung lại, không nhân bản cửa sổ
            if (state.openWindows.includes(displayName)) {
                return { minimized: { ...state.minimized, [displayName]: false } };
            }

            const next = [displayName, ...state.openWindows].slice(0, MAX_WINDOWS);
            const dropped = state.openWindows.filter((u) => !next.includes(u));

            const minimized = { ...state.minimized, [displayName]: false };
            dropped.forEach((u) => delete minimized[u]);

            return { openWindows: next, minimized };
        }),

    closeConversation: (displayName) =>
        set((state) => {
            const minimized = { ...state.minimized };
            delete minimized[displayName];
            return { openWindows: state.openWindows.filter((u) => u !== displayName), minimized };
        }),

    toggleMinimize: (displayName) =>
        set((state) => ({
            minimized: { ...state.minimized, [displayName]: !state.minimized[displayName] },
        })),
}));
