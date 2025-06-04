// frontend/src/utils/useLayoutEffectFix.ts
'use client';

import React from 'react';

if (typeof window === 'undefined') {
  React.useLayoutEffect = () => {};
}