"use client";

import { useState, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { usePanelRef, useDefaultLayout } from "react-resizable-panels";
import type { PanelSize } from "react-resizable-panels";
import { NavSidebar } from "@/components/nav-sidebar";

interface AppShellProps {
  userEmail: string;
  companyName: string;
  logoUrl: string | null;
  children: React.ReactNode;
}

const COLLAPSED_SIZE = 48;

export function AppShell({
  userEmail,
  companyName,
  logoUrl,
  children,
}: AppShellProps) {
  const sidebarRef = usePanelRef();
  const [collapsed, setCollapsed] = useState(false);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "app-sidebar-layout",
    storage: typeof window !== "undefined" ? localStorage : undefined,
  });

  const handleToggleCollapse = useCallback(() => {
    if (sidebarRef.current?.isCollapsed()) {
      sidebarRef.current.expand();
    } else {
      sidebarRef.current?.collapse();
    }
  }, [sidebarRef]);

  const handleSidebarResize = useCallback((panelSize: PanelSize) => {
    setCollapsed(panelSize.inPixels <= COLLAPSED_SIZE);
  }, []);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="hidden md:flex"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <ResizablePanel
        id="sidebar"
        panelRef={sidebarRef}
        collapsible
        collapsedSize={COLLAPSED_SIZE}
        minSize={200}
        maxSize={400}
        defaultSize={240}
        onResize={handleSidebarResize}
      >
        <NavSidebar
          userEmail={userEmail}
          companyName={companyName}
          logoUrl={logoUrl}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        onDoubleClick={handleToggleCollapse}
      />
      <ResizablePanel id="content">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
