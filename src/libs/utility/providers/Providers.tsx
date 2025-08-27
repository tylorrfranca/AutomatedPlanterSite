import { Theme } from "@radix-ui/themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Theme
            appearance="light"
            accentColor="green"
            panelBackground="solid"
            radius="large"
            scaling="105%">
            {children}
        </Theme>
    );
}
