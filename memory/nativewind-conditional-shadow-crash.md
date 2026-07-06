---
name: nativewind-conditional-shadow-crash
description: NativeWind crash when a shadow-* class is toggled conditionally on selection
metadata:
  type: project
---

In this Expo/NativeWind app, adding a `shadow-*` class **only in one branch** of a conditional `className` (e.g. `${selected ? 'bg-white shadow-sm' : ''}`) causes a hard dev crash on toggle: red screen "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?".

**Why:** Tailwind `shadow-*` utilities compile to CSS variables (`--tw-shadow`). NativeWind (react-native-css-interop) flags a component whose className gains a CSS variable *after the initial render* as needing an "upgrade", and fires a dev-only warning via `printUpgradeWarning → stringify(props)`. That `JSON.stringify` walks the element tree and dereferences a React Navigation object's throwing getter (`getKey`), turning a benign warning into a crash. It only reproduces where a navigation object is reachable in the styled subtree, but the trigger (conditional shadow) is the root.

**How to apply:** Keep `shadow-*` present in BOTH states — put it in the static part of the className and only toggle the background/border: `shadow-sm ${selected ? 'bg-white' : ''}`. A shadow only renders visibly on the pill that has a solid background, so the look is unchanged. Also avoid passing the raw `navigation` object as an element prop (pass only what's used). Fixed segmented controls in BidsScreen, CompletePurchaseScreen, CreateObjectStep1 and the ExploreCatalogsScreen dropdown. Ternaries where both branches carry a shadow (CatalogItemsScreen, NotificationsScreen) are safe.
