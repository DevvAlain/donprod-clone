"use client";

import type { Ref, VideoHTMLAttributes } from "react";

// Autoplaying preview/hero videos must be muted BEFORE playback starts,
// otherwise iOS Safari treats them as audible and hijacks them into native
// fullscreen. React only sets the muted *property* after mount (and never
// renders the attribute), which loses the race on mobile Safari. Setting
// defaultMuted (= the content attribute) in a ref callback closes it.
// Zero visual or behavioral change on desktop.
type InlineVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  ref?: Ref<HTMLVideoElement>;
};

export function InlineVideo({ ref, ...rest }: InlineVideoProps) {
  return (
    <video
      {...rest}
      muted
      playsInline
      // Legacy iOS inline-playback attribute; harmless everywhere else.
      {...{ "webkit-playsinline": "true" }}
      ref={(element) => {
        if (element) {
          element.muted = true;
          element.defaultMuted = true;
        }
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
    />
  );
}
