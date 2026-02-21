import { describe, it, expect } from "vitest";

/**
 * Smoke tests: verify all 9 new shadcn/ui components can be imported
 * and export expected named exports.
 */

describe("shadcn/ui components are installed", () => {
  it("Command exports Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem", async () => {
    const mod = await import("@/components/ui/command");
    expect(mod.Command).toBeDefined();
    expect(mod.CommandInput).toBeDefined();
    expect(mod.CommandList).toBeDefined();
    expect(mod.CommandEmpty).toBeDefined();
    expect(mod.CommandGroup).toBeDefined();
    expect(mod.CommandItem).toBeDefined();
  });

  it("Dialog exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription", async () => {
    const mod = await import("@/components/ui/dialog");
    expect(mod.Dialog).toBeDefined();
    expect(mod.DialogTrigger).toBeDefined();
    expect(mod.DialogContent).toBeDefined();
    expect(mod.DialogHeader).toBeDefined();
    expect(mod.DialogTitle).toBeDefined();
    expect(mod.DialogDescription).toBeDefined();
  });

  it("DropdownMenu exports DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem", async () => {
    const mod = await import("@/components/ui/dropdown-menu");
    expect(mod.DropdownMenu).toBeDefined();
    expect(mod.DropdownMenuTrigger).toBeDefined();
    expect(mod.DropdownMenuContent).toBeDefined();
    expect(mod.DropdownMenuItem).toBeDefined();
  });

  it("Popover exports Popover, PopoverTrigger, PopoverContent", async () => {
    const mod = await import("@/components/ui/popover");
    expect(mod.Popover).toBeDefined();
    expect(mod.PopoverTrigger).toBeDefined();
    expect(mod.PopoverContent).toBeDefined();
  });

  it("Sheet exports Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription", async () => {
    const mod = await import("@/components/ui/sheet");
    expect(mod.Sheet).toBeDefined();
    expect(mod.SheetTrigger).toBeDefined();
    expect(mod.SheetContent).toBeDefined();
    expect(mod.SheetHeader).toBeDefined();
    expect(mod.SheetTitle).toBeDefined();
    expect(mod.SheetDescription).toBeDefined();
  });

  it("Badge exports Badge and badgeVariants", async () => {
    const mod = await import("@/components/ui/badge");
    expect(mod.Badge).toBeDefined();
    expect(mod.badgeVariants).toBeDefined();
  });

  it("Separator exports Separator", async () => {
    const mod = await import("@/components/ui/separator");
    expect(mod.Separator).toBeDefined();
  });

  it("Tooltip exports Tooltip, TooltipTrigger, TooltipContent, TooltipProvider", async () => {
    const mod = await import("@/components/ui/tooltip");
    expect(mod.Tooltip).toBeDefined();
    expect(mod.TooltipTrigger).toBeDefined();
    expect(mod.TooltipContent).toBeDefined();
    expect(mod.TooltipProvider).toBeDefined();
  });

  it("Avatar exports Avatar, AvatarImage, AvatarFallback", async () => {
    const mod = await import("@/components/ui/avatar");
    expect(mod.Avatar).toBeDefined();
    expect(mod.AvatarImage).toBeDefined();
    expect(mod.AvatarFallback).toBeDefined();
  });
});
