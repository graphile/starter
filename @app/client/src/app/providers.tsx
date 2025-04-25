"use client";
// ^ we do in this file, not in layout.tsx bc it will throw

import { ProgressProvider } from "@bprogress/next/app";

// ProgressProvider uses useContext, so we need to use "use client"
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="4px"
      color="#fffd00"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default Providers;
