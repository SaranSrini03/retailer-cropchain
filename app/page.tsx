import React from 'react';
import { Button } from '@cropchain/ui-web';

export default function HomePage() { 
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Welcome to the Retailer App</h1>
      <Button  size="lg" >
        Click Me
      </Button>
    </div>
  );
} 