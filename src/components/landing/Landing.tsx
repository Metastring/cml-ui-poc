'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to <span className="text-blue-600">CML</span>
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Explore geospatial data, edit polygons, and overlay layers with ease.
        </p>
        <div className="flex justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Federated Search</h2>
            <p className="text-gray-600 mb-2">
              Federated Search queries multiple remote databases and returns unified results in a single view.
            </p>
            {/* <Badge variant="outline">Map Tool</Badge> */}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Map Search</h2>
            <p className="text-gray-600 mb-2">
              Draw, edit, and manage polygonal boundaries on an interactive map.
            </p>
            {/* <Badge variant="outline">Geo Data</Badge> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Landing;
